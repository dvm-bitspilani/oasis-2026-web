import curtainVideo from "../assets/video/curtain.mp4";

export type Resource =
  | { type: "image"; url: string; large?: boolean }
  | { type: "font"; spec: string };
export type ResourcePriority = "high" | "low";
type LoadOptions = { priority?: ResourcePriority; timeoutMs?: number; decode?: boolean };
type Entry = { ready: boolean; promise: Promise<void>; image?: HTMLImageElement };

const images = new Map<string, Entry>();
const fonts = new Map<string, Entry>();

export function loadImage(url: string, options: LoadOptions = {}): Promise<void> {
  const cached = images.get(url);
  if (cached) {
    if (options.priority === "high" && cached.image) cached.image.fetchPriority = "high";
    return cached.promise;
  }
  const image = new Image();
  image.fetchPriority = options.priority ?? "low";
  image.decoding = "async";
  const entry: Entry = { ready: false, promise: Promise.resolve(), image };
  images.set(url, entry);
  entry.promise = new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => finish(new Error(`Image timed out: ${url}`)), options.timeoutMs ?? 15000);
    let settled = false;
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      entry.image = undefined;
      if (error) {
        if (images.get(url) === entry) images.delete(url);
        reject(error);
      } else {
        entry.ready = true;
        resolve();
      }
    }
    image.onload = () => {
      if (options.decode) void image.decode().then(() => finish(), () => finish());
      else finish();
    };
    image.onerror = () => finish(new Error(`Image unavailable: ${url}`));
    image.src = url;
  });
  return entry.promise;
}

export function loadFont(spec: string, options: LoadOptions = {}): Promise<void> {
  const cached = fonts.get(spec);
  if (cached) return cached.promise;
  const entry: Entry = { ready: false, promise: Promise.resolve() };
  fonts.set(spec, entry);
  entry.promise = new Promise<void>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => finish(new Error(`Font timed out: ${spec}`)), options.timeoutMs ?? 8000);
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (error) {
        if (fonts.get(spec) === entry) fonts.delete(spec);
        reject(error);
      } else {
        entry.ready = true;
        resolve();
      }
    }
    void Promise.resolve().then(() => document.fonts.load(spec)).then(
      (faces) => finish(faces.length ? undefined : new Error(`Font is not declared: ${spec}`)),
      () => finish(new Error(`Font unavailable: ${spec}`)),
    );
  });
  return entry.promise;
}

export async function loadResources(
  resources: readonly Resource[],
  options: { priority?: ResourcePriority; concurrency?: number; signal?: AbortSignal } = {},
): Promise<void> {
  let cursor = 0;
  const worker = async () => {
    while (cursor < resources.length && !options.signal?.aborted) {
      const resource = resources[cursor++];
      try {
        if (resource.type === "image") await loadImage(resource.url, { priority: options.priority, decode: false });
        else await loadFont(resource.spec, { priority: options.priority });
      } catch {
        // A failed warmup remains retryable and never blocks other resources.
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(options.concurrency ?? 2, resources.length) }, worker));
}

export function isResourcesReady(resources: readonly Resource[]): boolean {
  return resources.every((resource) => resource.type === "image"
    ? images.get(resource.url)?.ready === true
    : fonts.get(resource.spec)?.ready === true);
}

type VideoEntry = { controller: AbortController; promise: Promise<string>; source?: string };
let videoEntry: VideoEntry | undefined;

export function warmCurtainVideo(priority: ResourcePriority = "low"): Promise<string> {
  if (videoEntry) return videoEntry.promise;
  const controller = new AbortController();
  const entry: VideoEntry = { controller, promise: Promise.resolve("") };
  videoEntry = entry;
  const timer = window.setTimeout(() => controller.abort(), 30000);
  entry.promise = fetch(curtainVideo, { signal: controller.signal, priority })
    .then(async (response) => {
      if (!response.ok) throw new Error("Curtain video unavailable");
      const blob = await response.blob();
      if (controller.signal.aborted) throw new Error("Curtain warmup cancelled");
      entry.source = URL.createObjectURL(blob);
      return entry.source;
    })
    .catch((error: unknown) => {
      if (videoEntry === entry) videoEntry = undefined;
      throw error;
    })
    .finally(() => window.clearTimeout(timer));
  return entry.promise;
}

export function getCurtainVideoSource(): string | undefined {
  return videoEntry?.source;
}

export function abortCurtainWarmup(): void {
  if (videoEntry && !videoEntry.source) {
    videoEntry.controller.abort();
    videoEntry = undefined;
  }
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  abortCurtainWarmup();
  if (videoEntry?.source) URL.revokeObjectURL(videoEntry.source);
  videoEntry = undefined;
});
