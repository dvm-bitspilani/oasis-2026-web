import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PageTransitionHandle } from "../components/pageTransition/PageTransition";
import { loadPageTransition, loadRoute } from "../loading/routes";
import { prepareRoute, setBackgroundNavigationBusy } from "../loading/background";
import { abortCurtainWarmup, getCurtainVideoSource, warmCurtainVideo } from "../loading/resources";

const PageTransition = lazy(loadPageTransition);
type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (to: string) => void;
  entered: boolean;
  markEntered: () => void;
};
const TransitionContext = createContext<TransitionContextValue | null>(null);
const PRELOADER_KEY = "oasis_preloader_shown";

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function selectVideoSource(): Promise<string | undefined> {
  const cached = getCurtainVideoSource();
  if (cached) return cached;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return undefined;
  let timer: number | undefined;
  try {
    const source = await Promise.race([
      warmCurtainVideo("high").catch(() => undefined),
      new Promise<undefined>((resolve) => { timer = window.setTimeout(() => resolve(undefined), 1200); }),
    ]);
    if (!source) abortCurtainWarmup();
    return source;
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>();
  const pendingPathRef = useRef<string | null>(null);
  const transitionRef = useRef<PageTransitionHandle>(null);
  const navigatingRef = useRef(false);
  const generationRef = useRef(0);
  const navigationTimerRef = useRef<number | undefined>(undefined);
  const originKeyRef = useRef(location.key);
  const routeCommittedRef = useRef(false);
  const curtainMountedRef = useRef(false);
  const transitionStageRef = useRef<"strings" | "curtain">("strings");
  const routeReadyRef = useRef<Promise<boolean> | null>(null);
  const [entered, setEntered] = useState<boolean>(() => {
    try { return sessionStorage.getItem(PRELOADER_KEY) === "true"; }
    catch { return false; }
  });

  const markEntered = useCallback(() => {
    setEntered(true);
    try { sessionStorage.setItem(PRELOADER_KEY, "true"); }
    catch { /* Storage can be unavailable in private browsing. */ }
  }, []);

  const finish = useCallback(() => {
    generationRef.current++;
    if (navigationTimerRef.current !== undefined) window.clearTimeout(navigationTimerRef.current);
    navigationTimerRef.current = undefined;
    pendingPathRef.current = null;
    routeReadyRef.current = null;
    transitionStageRef.current = "strings";
    navigatingRef.current = false;
    routeCommittedRef.current = false;
    curtainMountedRef.current = false;
    setTransitioning(false);
    abortCurtainWarmup();
    setBackgroundNavigationBusy(false);
  }, []);

  const navigateWithTransition = useCallback((to: string) => {
    if (to.toLowerCase() === location.pathname.toLowerCase() || navigatingRef.current) return;
    markEntered();
    navigatingRef.current = true;
    const generation = ++generationRef.current;
    originKeyRef.current = location.key;
    pendingPathRef.current = to;
    setBackgroundNavigationBusy(true);
    // Covers import preparation as well as playback, including an offline chunk.
    navigationTimerRef.current = window.setTimeout(() => {
      if (generationRef.current !== generation) return;
      if (curtainMountedRef.current) navigate(to);
      finish();
    }, 20000);

    void (async () => {
      try {
        // Share the same import promise as React.lazy before touching the route.
        await loadRoute(to);
        if (generationRef.current !== generation) return;
        routeReadyRef.current = prepareRoute(to).then(() => true, () => false);
        if (to.toLowerCase() === "/aboutus" || location.pathname.toLowerCase() === "/aboutus") {
          const ready = await routeReadyRef.current;
          if (generationRef.current !== generation) return;
          if (!ready) { finish(); return; }
          navigate(to);
          finish();
          return;
        }
        await loadPageTransition();
        if (generationRef.current !== generation) return;
        const source = await selectVideoSource();
        if (generationRef.current !== generation) return;
        setVideoSrc(source);
        transitionStageRef.current = "strings";
        curtainMountedRef.current = true;
        setTransitioning(true);
      } catch {
        // Keep the current page usable if a route chunk fails to load.
        if (generationRef.current === generation) finish();
      }
    })();
  }, [location.pathname, location.key, markEntered, navigate, finish]);

  const handleTransition = useCallback(async () => {
    const destination = pendingPathRef.current;
    if (!destination) { finish(); return; }
    if (transitionStageRef.current === "strings") {
      transitionStageRef.current = "curtain";
      const generation = generationRef.current;
      const ready = await routeReadyRef.current;
      if (generationRef.current !== generation) return;
      if (!ready) { finish(); return; }
      routeCommittedRef.current = true;
      navigate(destination);
      await waitForNextPaint();
      await waitForNextPaint();
      if (generationRef.current === generation && pendingPathRef.current === destination) {
        transitionRef.current?.resumeCurtain();
      }
    } else {
      finish();
    }
  }, [navigate, finish]);

  useEffect(() => {
    if (!navigatingRef.current) return;
    const expected = pendingPathRef.current?.toLowerCase();
    if (routeCommittedRef.current
      ? location.pathname.toLowerCase() !== expected
      : location.key !== originKeyRef.current) finish();
  }, [location.key, location.pathname, finish]);

  useEffect(() => () => {
    generationRef.current++;
    if (navigationTimerRef.current !== undefined) window.clearTimeout(navigationTimerRef.current);
    if (navigatingRef.current) setBackgroundNavigationBusy(false);
  }, []);

  const contextValue = useMemo<TransitionContextValue>(() => ({
    transitioning, navigateWithTransition, entered, markEntered,
  }), [transitioning, navigateWithTransition, entered, markEntered]);

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
      {transitioning && (
        <Suspense fallback={null}>
          <PageTransition ref={transitionRef} videoSrc={videoSrc} onComplete={handleTransition} />
        </Suspense>
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransition must be used within a TransitionProvider");
  return context;
}
