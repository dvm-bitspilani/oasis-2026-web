import { loadRoute, loadPageTransition } from "./routes";
import { loadResources, warmCurtainVideo, abortCurtainWarmup, type Resource } from "./resources";
import { criticalRouteResources, registrationResources, aboutResources, eventsResources, contactResources, comingSoonResources, menuResources } from "./manifests";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string; downlink?: number };
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const slow = () => /(^|-)2g$/.test(connection?.effectiveType ?? "") || (connection?.downlink !== undefined && connection.downlink < 1.5);
const permitted = () => !document.hidden && navigator.onLine && !connection?.saveData;
const normalise = (path: string) => path.split(/[?#]/)[0].replace(/\/$/, "").toLowerCase() || "/";
const groups = [
  { name: "transition", path: "", resources: () => [] as Resource[] },
  { name: "registration", path: "/register", resources: registrationResources },
  { name: "about", path: "/aboutus", resources: aboutResources },
  { name: "events", path: "/events", resources: eventsResources },
  { name: "contact", path: "/contactus", resources: contactResources },
  { name: "comingsoon", path: "/comingsoon", resources: comingSoonResources },
  { name: "menu", path: "", resources: menuResources },
];
let started = false;
let running = false;
let busy = false;
let actualRequests = 0;
let currentPage = normalise(window.location.pathname);
let index = 0;
let controller: AbortController | undefined;
const canRun = () => started && permitted() && !busy && actualRequests === 0;
const yieldTask = () => new Promise<void>((resolve) => window.setTimeout(resolve, 40));
function pause() {
  controller?.abort();
  abortCurtainWarmup();
}
async function waitForModule(pending: Promise<unknown>, signal: AbortSignal): Promise<void> {
  let timer: number | undefined;
  let onAbort: (() => void) | undefined;
  const interrupted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(new Error("Background loading paused"));
    signal.addEventListener("abort", onAbort, { once: true });
    timer = window.setTimeout(() => reject(new Error("Background module timed out")), 15000);
    if (signal.aborted) onAbort();
  });
  try { await Promise.race([pending, interrupted]); }
  finally {
    if (timer !== undefined) window.clearTimeout(timer);
    if (onAbort) signal.removeEventListener("abort", onAbort);
  }
}
async function run() {
  if (running || !canRun()) return;
  running = true;
  try {
    while (index < groups.length && canRun()) {
      const group = groups[index];
      controller = new AbortController();
      const signal = controller.signal;
      performance.mark(`oasis:warm:${group.name}:start`);
      try {
        if (group.name === "transition") {
          await waitForModule(loadPageTransition(), signal);
          if (canRun() && !signal.aborted && !slow()) await warmCurtainVideo("low");
        } else if (group.path && group.path !== currentPage) {
          await waitForModule(loadRoute(group.path), signal);
        }
        const resources = group.resources().filter((resource) => !(slow() && resource.type === "image" && resource.large));
        for (let offset = 0; offset < resources.length && canRun() && !signal.aborted; offset += 2) {
          await yieldTask();
          if (!canRun() || signal.aborted) break;
          await loadResources(resources.slice(offset, offset + 2), { priority: "low", concurrency: 2, signal });
        }
        if (!canRun() || signal.aborted) break;
        index++;
        performance.mark(`oasis:warm:${group.name}:end`);
      } catch {
        // A failed speculative stage cannot block later pages or actual retries.
        if (!canRun() || signal.aborted) break;
        index++;
        performance.mark(`oasis:warm:${group.name}:end`);
      }
      await yieldTask();
    }
  } finally {
    running = false;
    controller = undefined;
    if (canRun() && index < groups.length) void run();
  }
}
function environmentChanged() {
  if (!canRun()) pause();
  else void run();
}
export function startBackgroundLoading() {
  if (!started) {
    started = true;
    document.addEventListener("visibilitychange", environmentChanged);
    window.addEventListener("online", environmentChanged);
    window.addEventListener("offline", environmentChanged);
    connection?.addEventListener("change", environmentChanged);
  }
  void run();
}
export function setBackgroundPage(path: string) {
  currentPage = normalise(path);
  void run();
}
export function setBackgroundNavigationBusy(value: boolean) {
  busy = value;
  if (busy) pause();
  else void run();
}
export async function prepareRoute(path: string): Promise<void> {
  actualRequests++;
  pause();
  const navigationResources = new AbortController();
  let timer: number | undefined;
  try {
    // Module loading is required; assets have a bounded wait so a broken image
    // never leaves the curtain paused indefinitely. Later form/modal artwork and
    // the large Contact map remain outside this navigation wait.
    await loadRoute(path);
    const resources = criticalRouteResources(path);
    await Promise.race([
      loadResources(resources, { priority: "high", concurrency: 4, signal: navigationResources.signal }),
      new Promise<void>((resolve) => { timer = window.setTimeout(resolve, 2500); }),
    ]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
    navigationResources.abort();
    actualRequests--;
    void run();
  }
}
