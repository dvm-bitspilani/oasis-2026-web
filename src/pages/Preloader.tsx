import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "../styles/Preloader.module.scss";
import bg from "../assets/preloader/bg_star.webp";
// import light from "../assets/preloader/light1.svg";
import light2 from "../assets/preloader/light2.png";
import preloaderPathUrl from "../assets/preloader/preloader-path.svg";
// import light3 from "../assets/preloader/light3.svg";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
  onExitStart?: () => void;
}
type Point = { x: number; y: number };

type ShootingStar = {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  size: number;
  depth: number;
  opacity: number;
  nextSpawn: number;
  vx: number; // px per ms (precomputed, no cos/sin per frame)
  vy: number;
  tf: string; // static tail of the transform string (rotate/scale) built once per spawn
  dirty: boolean; // CSS vars need to be (re)applied
  visible: boolean;
};

type LogoDot = {
  x: number;
  y: number;
  size: number;
  order: number;
  phase: number;
  isGap: boolean;
  clusterId: number;
  rankInCluster: number;
  growthJitter: number;
  settled: boolean; // already baked into the static layer -> skipped every frame
  twinkle: boolean; // keeps animating forever (small subset)
};

type GapCluster = {
  id: number;
  indices: number[];
  cx: number;
  cy: number;
  originRank: number;
  originX: number;
  originY: number;
  threshold: number;
  launched: boolean;
  filled: boolean;
  fillTime: number | null;
  impactX: number | null;
  impactY: number | null;
};

type FillerStar = {
  clusterId: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  tf: string;
  phase: 0 | 1 | 2 | 3; // 0 waiting, 1 flying, 2 impacted/fading, 3 done
};

/* ------------------------------------------------------------------ */
/* QUALITY TIER                                                        */
/* Phones / low-core / low-RAM devices get a lighter scene.            */
/* Force a tier by hard-coding IS_LOW_END = true | false.              */
/* ------------------------------------------------------------------ */
const IS_LOW_END = (() => {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return cores <= 4 || mem <= 4 || coarse;
})();

const SVG_VIEWBOX_WIDTH = 342;
const SVG_VIEWBOX_HEIGHT = 405;
const PATH_STAR_COUNT = IS_LOW_END ? 280 : 400;
const DOT_SCALE = Math.sqrt(400 / PATH_STAR_COUNT); // keep the logo looking equally dense
const SHOOTING_STARS = IS_LOW_END ? 6 : 10;
const MAX_DPR = IS_LOW_END ? 1.5 : 2;
const TWINKLE_EVERY = 8; // 1 in N dots keeps its live shimmer, the rest are baked
const SETTLED_PULSE = 0.95; // average of the original 0.9-1.0 pulse

const AMBIENT_REVEAL_TIME = 450;
const AMBIENT_ORDER_STAGGER = 0.45;
const AMBIENT_REVEAL_WINDOW = 0.35;
const MIN_LOGO_TIME = 500;
const LOGO_HOLD = 2000;
const EXIT_DURATION = 1200;
const LOGO_COLOR = "180, 225, 255";
const LOGO_FILL = `rgb(${LOGO_COLOR})`;

const MAX_FRAME_DT = 1000 / 30;
const RESIZE_DEBOUNCE = 150;
const RESIZE_MIN_HEIGHT_DELTA = 150; // ignore mobile URL-bar show/hide
const TOTAL_CLUSTER_COUNT = 5;
const AMBIENT_CLUSTER_FRACTION = 0.14;
const AMBIENT_CLUSTER_COUNT = Math.round(TOTAL_CLUSTER_COUNT * AMBIENT_CLUSTER_FRACTION);
const GAP_CLUSTER_COUNT = TOTAL_CLUSTER_COUNT - AMBIENT_CLUSTER_COUNT;
const GAP_THRESHOLD_START = 0.05;
const GAP_THRESHOLD_END = 1.0;
const FILLER_MIN_LAUNCH_GAP = 400;
const FILLER_TRAVEL_TIME = 700;
const FILLER_ARRIVAL_RADIUS = 20;
const IMPACT_LOCK_MS = 220;
const FILLER_HEAD_MIN = 48;
const FILLER_HEAD_MAX = 72;
const GROWTH_STEP_MS = 30;
const GROWTH_SPEED_JITTER = 0.5;
const GROWTH_DOT_FADE_MS = 260;
const STRIKE_FLASH_DURATION = 260;
const STRIKE_FLASH_MAX_SIZE = 16;
const SHOCKWAVE_DURATION = 420;
const SHOCKWAVE_MAX_RADIUS = 30;
const FILLER_FADE_START = 180;
const FILLER_FADE_MS = 260;

const TAU = Math.PI * 2;

const MAX_CANVAS_PIXELS = IS_LOW_END ? 2_500_000 : 6_000_000;
function makeGlowSprite(size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/*
 * getPointAtLength() on this path is very expensive (huge path, 400 calls).
 * The result never changes, so compute it once per page session and reuse it
 * on every mount / resize.
 */
let cachedPathPoints: Point[] | null = null;
function samplePath(path: SVGPathElement): Point[] {
  if (cachedPathPoints && cachedPathPoints.length === PATH_STAR_COUNT) return cachedPathPoints;
  const len = path.getTotalLength();
  const out: Point[] = new Array(PATH_STAR_COUNT);
  for (let i = 0; i < PATH_STAR_COUNT; i++) {
    const p = path.getPointAtLength((len * i) / (PATH_STAR_COUNT - 1));
    out[i] = { x: p.x, y: p.y };
  }
  cachedPathPoints = out;
  return out;
}

function PreloaderContent({ assets = [], onEnter, onExitStart }: PreloaderProps) {
  const [logosReady, setLogosReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [pathD, setPathD] = useState<string | null>(null);

  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setLogosReady(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const percentRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef<number | null>(null);
  const enteredRef = useRef(false);
  const exitRef = useRef(false);
  const exitingRef = useRef(false);
  const stopAnimationRef = useRef<(() => void) | null>(null);
  const progressRef = useRef(assets.length === 0 ? 1 : 0);
  const logoCompleteRef = useRef(false);
  const initialPercent = useRef(assets.length === 0 ? "100%" : "0%");

  // always call the latest callbacks without re-running the exit effect
  const onEnterRef = useRef(onEnter);
  const onExitStartRef = useRef(onExitStart);
  onEnterRef.current = onEnter;
  onExitStartRef.current = onExitStart;

  /*
   * LOAD THE SAMPLING PATH OUTSIDE THE JS BUNDLE.
   * The path is only needed by the canvas sampler; keeping the 32KB path data
   * in a separate SVG substantially reduces JS parse/compile work.
   */
  useEffect(() => {
    let cancelled = false;

    fetch(preloaderPathUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load preloader path: ${response.status}`);
        return response.text();
      })
      .then((svgText) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const path = doc.querySelector("path");
        if (path) setPathD(path.getAttribute("d") ?? "");
      })
      .catch(() => {
        if (!cancelled) setPathD("");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * LOAD ASSETS
   * Progress is written straight into the DOM (no React state) so the big
   * component tree never re-renders while loading.
   * img.decode() also pre-decodes the bitmap so the page after the preloader
   * doesn't jank when it first paints those images.
   */
  useEffect(() => {
    startRef.current = performance.now();

    const showPercent = (p: number) => {
      if (percentRef.current) {
        percentRef.current.textContent = `${Math.round(p * 100)}%`;
      }
    };

    // Deduplicate URLs. This avoids downloading/decoding the same image twice.
    const uniqueAssets = Array.from(
      new Set(assets.filter((src): src is string => Boolean(src))),
    );

    if (uniqueAssets.length === 0) {
      progressRef.current = 1;
      showPercent(1);
      return;
    }

    let cancelled = false;
    let loaded = 0;

    const done = () => {
      if (cancelled) return;

      loaded += 1;
      const p = Math.min(1, loaded / uniqueAssets.length);
      progressRef.current = p;
      showPercent(p);
    };

    // Start all requests immediately after Preloader mounts. The browser
    // handles connection prioritisation/concurrency for us.
    for (const src of uniqueAssets) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;

      if (typeof img.decode === "function") {
        img.decode().then(done, done);
      } else {
        img.onload = done;
        img.onerror = done;
      }
    }

    return () => {
      cancelled = true;
    };
    // assets.join keeps this effect stable without depending on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.join("|")]);

  /*
   * CANVAS ANIMATION
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const path = pathRef.current;
    if (!canvas || !path || pathD === null) return;

    let rendererWorker: Worker | null = null;
    let workerMode = false;

    try {
      if (
        typeof Worker !== "undefined" &&
        typeof canvas.transferControlToOffscreen === "function"
      ) {
        rendererWorker = new Worker(
          new URL("../workers/preloader.worker.ts", import.meta.url),
          { type: "module" },
        );

        const offscreen = canvas.transferControlToOffscreen();
        rendererWorker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);
        workerMode = true;
      }
    } catch {
      rendererWorker?.terminate();
      rendererWorker = null;
      workerMode = false;
    }

    const ctx = workerMode ? null : canvas.getContext("2d");

    if (!workerMode && !ctx) {
      rendererWorker?.terminate();
      return;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastW = 0;
    let lastH = 0;
    let frame = 0;
    let dead = false;
    let rafRunning = false;

    let logoDots: LogoDot[] = [];
    let shootingStars: ShootingStar[] = [];
    let gapClusters: GapCluster[] = [];
    let fillerStars: FillerStar[] = [];
    let lastLaunchElapsed = -Infinity;
    const glowSprite = makeGlowSprite(64);

    /*
     * STATIC LAYER
     * Once a dot has finished fading in it never changes again, so it is drawn
     * ONCE into this tightly-fitted offscreen canvas. Every frame we blit that
     * single image instead of redrawing hundreds of dots.
     */
    const settledCanvas = document.createElement("canvas");
    const settledCtx = settledCanvas.getContext("2d")!;
    let settledX = 0;
    let settledY = 0;
    let clearX = 0;
    let clearY = 0;
    let clearW = 0;
    let clearH = 0;
    let hasSettled = false;

    let lastFrameTime = performance.now();
    let virtualElapsed = 0;
    let resizeTimer: number | null = null;

    const ease = (v: number) => v * v * (3 - 2 * v);

    /* one dot = soft glow sprite + core circle (identical look to the original) */
    const drawDot = (
      c: CanvasRenderingContext2D,
      dot: LogoDot,
      local: number,
      pulse: number,
      lockPulse: number,
    ) => {
      const op = 0.035 + local * 0.965 * pulse;
      const r = dot.size * (0.7 + local * 0.55) * lockPulse;
      if (local > 0.02) {
        const g = r * (4 + local * 4) * 0.7;
        c.globalAlpha = op * local * 0.6;
        c.drawImage(glowSprite, dot.x - g / 2, dot.y - g / 2, g, g);
      }
      c.globalAlpha = op;
      c.beginPath();
      c.arc(dot.x, dot.y, r * 1.3, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
    };

    /* ---------------- ambient shooting stars ---------------- */
    const randomizeShootingStar = (star: ShootingStar, now: number, initial: boolean) => {
      const depthRoll = Math.random();
      let depth = 0;
      if (depthRoll > 0.76) depth = 2;
      else if (depthRoll > 0.34) depth = 1;

      const x = -350 + Math.random() * (width * 1.15 + 350);
      let y: number;
      if (Math.random() < (initial ? 0.58 : 0.55)) {
        y = -250 + Math.random() * (height * (initial ? 0.78 : 0.75));
      } else {
        y = height * (initial ? 0.28 : 0.25) + Math.random() * (height * (initial ? 0.82 : 0.8));
      }

      const angle = ((12 + Math.random() * 32) * Math.PI) / 180;
      let speed: number, length: number, size: number, opacity: number;
      if (depth === 0) {
        speed = 110 + Math.random() * 120;
        length = 35 + Math.random() * 100;
        size = 0.55 + Math.random() * 0.55;
        opacity = 0.2 + Math.random() * 0.28;
      } else if (depth === 1) {
        speed = 180 + Math.random() * 180;
        length = 60 + Math.random() * 160;
        size = 0.75 + Math.random() * 0.85;
        opacity = 0.4 + Math.random() * 0.35;
      } else {
        speed = 240 + Math.random() * 180;
        length = 75 + Math.random() * 75;
        size = 0.65 + Math.random() * 0.65;
        opacity = 0.5 + Math.random() * 0.22;
      }

      star.x = x;
      star.y = y;
      star.angle = angle;
      star.speed = speed;
      star.length = length;
      star.size = size;
      star.depth = depth;
      star.opacity = opacity;
      star.vx = (Math.cos(angle) * speed) / 1000;
      star.vy = (Math.sin(angle) * speed) / 1000;
      star.tf =
        ` translate(-100%, -50%) rotate(${(angle * 180) / Math.PI}deg)` +
        ` scaleX(${Math.min(1, length / 140)})`;
      star.dirty = true;
      star.visible = false;
      star.nextSpawn = initial ? 0 : now + 10 + Math.random() * 650;
    };

    /* CSS vars only change when a star (re)spawns, NOT every frame */
    const applyAmbientStyle = (el: HTMLDivElement, s: ShootingStar) => {
      const st = el.style;
      st.setProperty("--star-length", `${Math.min(120, Math.max(65, s.length))}px`);
      st.setProperty("--star-height", `${Math.min(2.2, Math.max(1.1, s.size * 1.5))}px`);
      st.setProperty("--head-size", `${Math.min(5.5, Math.max(3.5, s.size * 2.5))}px`);
      st.setProperty("--star-glow", `${Math.min(5, 2 + s.size * 2)}px`);
      st.zIndex = String(20 + s.depth * 10);
    };

    const applyFillerStyle = (el: HTMLDivElement, s: FillerStar) => {
      const st = el.style;
      st.setProperty("--star-length", `${Math.min(185, Math.max(125, s.length))}px`);
      st.setProperty("--star-height", `${Math.min(6.5, Math.max(4, s.size * 2.8))}px`);
      st.setProperty("--head-size", `${Math.min(58, Math.max(38, s.size * 15))}px`);
      st.setProperty("--star-glow", `${10 + s.size * 5}px`);
      st.zIndex = "3000";
    };

    const makeShooting = () => {
      const now = performance.now();
      shootingStars = Array.from({ length: SHOOTING_STARS }, (_, i) => {
        const star = {} as ShootingStar;
        randomizeShootingStar(star, now, true);
        const el = starRefs.current[i];
        if (el) el.style.opacity = "0";
        return star;
      });
    };

    /* ---------------- logo dots ---------------- */
    const makeLogo = () => {
      const points = samplePath(path); // cached, no getPointAtLength after the first time

      // layout computed once instead of once per point
      const s =
        Math.min((width * 0.92) / SVG_VIEWBOX_WIDTH, (height * 0.68) / SVG_VIEWBOX_HEIGHT) * 0.65;
      const offsetX = (width - SVG_VIEWBOX_WIDTH * s) / 2;
      const offsetY = (height - SVG_VIEWBOX_HEIGHT * s) / 2;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      logoDots = points.map((p, i) => {
        const x = offsetX + p.x * s;
        const y = offsetY + p.y * s;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        return {
          x,
          y,
          size: (1.25 + Math.random() * 1.35) * DOT_SCALE,
          order: i / (PATH_STAR_COUNT - 1),
          phase: Math.random() * TAU,
          isGap: false,
          clusterId: -1,
          rankInCluster: 0,
          growthJitter: Math.random(),
          settled: false,
          twinkle: i % TWINKLE_EVERY === 0,
        };
      });

      // snug offscreen canvas around the logo (a loose one costs more to blit)
      const pad = 24;
      settledX = Math.floor(minX - pad);
      settledY = Math.floor(minY - pad);
      const sw = Math.ceil(maxX + pad) - settledX;
      const sh = Math.ceil(maxY + pad) - settledY;
      settledCanvas.width = Math.ceil(sw * dpr);
      settledCanvas.height = Math.ceil(sh * dpr);

      // All canvas effects live around the logo. Clearing only this small
      // region avoids touching the entire viewport every frame.
      const effectPad = 52;
      clearX = Math.max(0, settledX - effectPad);
      clearY = Math.max(0, settledY - effectPad);
      const clearRight = Math.min(width, settledX + sw + effectPad);
      const clearBottom = Math.min(height, settledY + sh + effectPad);
      clearW = Math.max(0, clearRight - clearX);
      clearH = Math.max(0, clearBottom - clearY);

      settledCtx.setTransform(dpr, 0, 0, dpr, -settledX * dpr, -settledY * dpr);
      settledCtx.fillStyle = LOGO_FILL;
      hasSettled = false;

      const clusterOrder = Array.from({ length: TOTAL_CLUSTER_COUNT }, (_, i) => i);
      for (let i = clusterOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clusterOrder[i], clusterOrder[j]] = [clusterOrder[j], clusterOrder[i]];
      }
      const ambientClusterIds = new Set(clusterOrder.slice(0, AMBIENT_CLUSTER_COUNT));

      const baseSize = Math.floor(PATH_STAR_COUNT / TOTAL_CLUSTER_COUNT);
      gapClusters = [];
      let gapCursor = 0;
      for (let c = 0; c < TOTAL_CLUSTER_COUNT; c++) {
        const start = c * baseSize;
        const end = c === TOTAL_CLUSTER_COUNT - 1 ? PATH_STAR_COUNT : start + baseSize;
        if (ambientClusterIds.has(c)) continue;

        const indices: number[] = [];
        let sx = 0,
          sy = 0;
        for (let k = start; k < end; k++) {
          indices.push(k);
          sx += logoDots[k].x;
          sy += logoDots[k].y;
          logoDots[k].isGap = true;
          logoDots[k].clusterId = gapCursor;
          logoDots[k].rankInCluster = k - start;
        }
        const avgX = sx / indices.length;
        const avgY = sy / indices.length;

        // target a REAL point of the cluster (the raw average can fall in empty space
        // between two disconnected sub-paths)
        let originRank = 0;
        let originIndex = start;
        let bestDist = Infinity;
        for (const k of indices) {
          const d = Math.hypot(logoDots[k].x - avgX, logoDots[k].y - avgY);
          if (d < bestDist) {
            bestDist = d;
            originRank = k - start;
            originIndex = k;
          }
        }
        const cx = logoDots[originIndex].x;
        const cy = logoDots[originIndex].y;
        gapClusters.push({
          id: gapCursor,
          indices,
          cx,
          cy,
          originRank,
          originX: cx,
          originY: cy,
          threshold: 0,
          launched: false,
          filled: false,
          fillTime: null,
          impactX: null,
          impactY: null,
        });
        gapCursor++;
      }

      const fillOrder = gapClusters.map((c) => c.id);
      for (let i = fillOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fillOrder[i], fillOrder[j]] = [fillOrder[j], fillOrder[i]];
      }
      const count = gapClusters.length;
      fillOrder.forEach((clusterId, rank) => {
        gapClusters[clusterId].threshold =
          count <= 1
            ? GAP_THRESHOLD_END
            : GAP_THRESHOLD_START +
              (rank * (GAP_THRESHOLD_END - GAP_THRESHOLD_START)) / (count - 1);
      });

      logoCompleteRef.current = gapClusters.length === 0;
      lastLaunchElapsed = -Infinity;

      fillerStars = gapClusters.map((cluster, i) => {
        const startX = -200 - Math.random() * 160;
        const startY = -100 - Math.random() * (height * 0.3);
        const dx = cluster.cx - startX;
        const dy = cluster.cy - startY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);
        const speed = dist / (FILLER_TRAVEL_TIME / 1000);
        const el = fillerRefs.current[i];
        if (el) el.style.opacity = "0";
        return {
          clusterId: cluster.id,
          x: startX,
          y: startY,
          angle,
          speed,
          length: 140 + Math.random() * 55,
          size: 4.0 + Math.random() * 1.0,
          opacity: 0.85 + Math.random() * 0.15,
          vx: (Math.cos(angle) * speed) / 1000,
          vy: (Math.sin(angle) * speed) / 1000,
          tf: ` translate(-100%, -50%) rotate(${(angle * 180) / Math.PI}deg)`,
          phase: 0,
        } as FillerStar;
      });
    };

    /* ---------------- resize ---------------- */
    const rebuild = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      lastW = width;
      lastH = height;
      const nativeDpr = window.devicePixelRatio || 1;
      const pixelDpr = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height));
      dpr = Math.min(nativeDpr, MAX_DPR, Math.max(1, pixelDpr));

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (!workerMode && ctx) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = LOGO_FILL;
        ctx.strokeStyle = LOGO_FILL;
      }

      makeShooting();
      makeLogo();

      if (workerMode && rendererWorker) {
        rendererWorker.postMessage({
          type: "resize",
          width,
          height,
          dpr,
          logoDots,
          gapClusters,
        });
      }
    };

    const resize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        // mobile URL-bar collapse fires resize with a tiny height change:
        // rebuilding would restart the whole animation for nothing
        if (
          window.innerWidth === lastW &&
          Math.abs(window.innerHeight - lastH) < RESIZE_MIN_HEIGHT_DELTA
        ) {
          return;
        }
        rebuild();
      }, RESIZE_DEBOUNCE);
    };

    /* ---------------- main loop ---------------- */
    let pageHidden = document.visibilityState === "hidden";

    const stopAnimation = () => {
      if (rafRunning) {
        rafRunning = false;
        cancelAnimationFrame(frame);
      }
      rendererWorker?.postMessage({ type: "pause" });
    };

    const startAnimation = () => {
      if (dead || pageHidden || exitingRef.current || rafRunning) return;
      rendererWorker?.postMessage({ type: "resume" });
      lastFrameTime = performance.now();
      rafRunning = true;
      frame = requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      pageHidden = document.visibilityState === "hidden";
      lastFrameTime = performance.now();

      if (pageHidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
    stopAnimationRef.current = stopAnimation;

    const animate = (time: number) => {
      if (dead || pageHidden || exitingRef.current) {
        rafRunning = false;
        return;
      }

      const rawDt = time - lastFrameTime;
      lastFrameTime = time;
      const dt = Math.min(Math.max(rawDt, 0), MAX_FRAME_DT);
      virtualElapsed += dt;
      const elapsed = virtualElapsed;

      const assetP = progressRef.current;
      const ambientTimeP = Math.min(1, elapsed / AMBIENT_REVEAL_TIME);

      // IMPORTANT: these simulations stay on the main thread because they
      // update DOM elements. They must run in both worker and fallback modes.
      for (let i = 0; i < gapClusters.length; i++) {
        const cluster = gapClusters[i];
        if (cluster.launched || cluster.filled) continue;
        if (
          assetP >= cluster.threshold &&
          elapsed - lastLaunchElapsed >= FILLER_MIN_LAUNCH_GAP
        ) {
          cluster.launched = true;
          lastLaunchElapsed = elapsed;
        }
      }

      /* ---- ambient DOM shooting stars ---- */
      for (let i = 0; i < shootingStars.length; i++) {
        const star = shootingStars[i];
        const el = starRefs.current[i];
        if (!el || time < star.nextSpawn) continue;

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        if (
          star.x > width + 450 ||
          star.y > height + 450 ||
          star.x < -450 ||
          star.y < -450
        ) {
          randomizeShootingStar(star, time, false);
          el.style.opacity = "0";
          continue;
        }

        if (star.dirty) {
          applyAmbientStyle(el, star);
          star.dirty = false;
        }

        if (!star.visible) {
          el.style.opacity = String(star.opacity);
          star.visible = true;
        }

        el.style.transform =
          `translate3d(${star.x}px, ${star.y}px, 0)` + star.tf;
      }

      /* ---- filler DOM stars ---- */
      for (let i = 0; i < fillerStars.length; i++) {
        const star = fillerStars[i];
        const el = fillerRefs.current[i];
        const cluster = gapClusters[star.clusterId];
        if (!el || !cluster || star.phase === 3) continue;

        if (star.phase === 2) {
          const age = elapsed - (cluster.fillTime ?? elapsed);

          if (age >= FILLER_FADE_START + FILLER_FADE_MS) {
            el.style.opacity = "0";
            star.phase = 3;
          } else if (age >= FILLER_FADE_START) {
            el.style.opacity = String(
              1 - (age - FILLER_FADE_START) / FILLER_FADE_MS,
            );
          }
          continue;
        }

        if (star.phase === 0) {
          if (!cluster.launched) continue;
          applyFillerStyle(el, star);
          el.style.opacity = String(star.opacity);
          star.phase = 1;
        }

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        const dx = cluster.cx - star.x;
        const dy = cluster.cy - star.y;

        if (
          dx * dx + dy * dy <= FILLER_ARRIVAL_RADIUS * FILLER_ARRIVAL_RADIUS ||
          star.x >= cluster.cx
        ) {
          star.phase = 2;
          cluster.filled = true;
          cluster.fillTime = elapsed;
          cluster.impactX = star.x;
          cluster.impactY = star.y;

          if (gapClusters.every((c) => c.filled)) {
            logoCompleteRef.current = true;
          }

          el.style.setProperty(
            "--head-size",
            `${Math.min(
              FILLER_HEAD_MAX,
              Math.max(FILLER_HEAD_MIN, star.size * 16),
            )}px`,
          );
          el.style.opacity = "1";
          el.style.transform =
            `translate3d(${star.x}px, ${star.y}px, 0)` + star.tf;

          // Tell the worker about the impact so its canvas animation stays
          // synchronized with the DOM-side filler star.
          rendererWorker?.postMessage({
            type: "fillCluster",
            id: cluster.id,
            impactX: star.x,
            impactY: star.y,
          });
          continue;
        }

        el.style.transform =
          `translate3d(${star.x}px, ${star.y}px, 0)` + star.tf;
      }

      // The worker owns the expensive logo canvas renderer. In fallback mode,
      // the same rendering code remains on this thread.
      if (!workerMode && ctx) {
        ctx.clearRect(clearX, clearY, clearW, clearH);

        if (hasSettled) {
          ctx.drawImage(
            settledCanvas,
            settledX,
            settledY,
            settledCanvas.width / dpr,
            settledCanvas.height / dpr,
          );
        }

        /* ---- strike flash + shockwave ---- */
        for (let i = 0; i < gapClusters.length; i++) {
          const cluster = gapClusters[i];
          if (!cluster.filled || cluster.fillTime === null) continue;

          const age = elapsed - cluster.fillTime;
          if (age >= SHOCKWAVE_DURATION) continue;

          const ix = cluster.impactX ?? cluster.originX;
          const iy = cluster.impactY ?? cluster.originY;

          if (age < STRIKE_FLASH_DURATION) {
            const eased = ease(age / STRIKE_FLASH_DURATION);
            const size = 7 + eased * (STRIKE_FLASH_MAX_SIZE + 5);
            ctx.globalAlpha = (1 - eased) * 0.75;
            ctx.drawImage(
              glowSprite,
              ix - size / 2,
              iy - size / 2,
              size,
              size,
            );
          }

          const eased = ease(age / SHOCKWAVE_DURATION);
          ctx.globalAlpha = (1 - eased) * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ix, iy, 2 + eased * SHOCKWAVE_MAX_RADIUS, 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        /* ---- only dots still animating/twinkling are drawn live ---- */
        for (let i = 0; i < logoDots.length; i++) {
          const dot = logoDots[i];
          if (dot.settled) continue;

          let local: number;
          let cluster: GapCluster | undefined;

          if (dot.isGap) {
            cluster = gapClusters[dot.clusterId];
            if (!cluster || !cluster.filled || cluster.fillTime === null) continue;

            const rankDist = Math.abs(dot.rankInCluster - cluster.originRank);
            const speedFactor =
              1 - GROWTH_SPEED_JITTER / 2 +
              dot.growthJitter * GROWTH_SPEED_JITTER;
            const arrivalTime =
              rankDist === 0
                ? 0
                : IMPACT_LOCK_MS + rankDist * GROWTH_STEP_MS * speedFactor;

            local = ease(
              Math.min(
                1,
                Math.max(
                  0,
                  (elapsed - cluster.fillTime - arrivalTime) /
                    GROWTH_DOT_FADE_MS,
                ),
              ),
            );
          } else {
            local = ease(
              Math.min(
                1,
                Math.max(
                  0,
                  (ambientTimeP - dot.order * AMBIENT_ORDER_STAGGER) /
                    AMBIENT_REVEAL_WINDOW,
                ),
              ),
            );
          }

          if (local <= 0.001) continue;

          const isImpact =
            !!cluster && dot.rankInCluster === cluster.originRank;
          const lockAge =
            cluster && cluster.fillTime !== null
              ? elapsed - cluster.fillTime
              : Infinity;
          const locking = isImpact && lockAge < IMPACT_LOCK_MS;
          const lockPulse = locking
            ? 1 + Math.sin((lockAge / IMPACT_LOCK_MS) * Math.PI) * 0.45
            : 1;
          const pulse = dot.twinkle
            ? 0.9 +
              0.1 * ((Math.sin(elapsed * 0.002 + dot.phase) + 1) / 2)
            : SETTLED_PULSE;

          drawDot(ctx, dot, local, pulse, lockPulse);

          if (!dot.twinkle && local >= 1 && !locking) {
            drawDot(settledCtx, dot, 1, SETTLED_PULSE, 1);
            dot.settled = true;
            hasSettled = true;
          }
        }
      }

      if (!dead && !pageHidden && !exitingRef.current) {
        frame = requestAnimationFrame(animate);
      } else {
        rafRunning = false;
      }
    };

    window.addEventListener("resize", resize);
    rebuild();
    startAnimation();

    return () => {
      dead = true;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      stopAnimation();

      if (rendererWorker) {
        rendererWorker.postMessage({ type: "destroy" });
        rendererWorker.terminate();
      }

      if (stopAnimationRef.current === stopAnimation) {
        stopAnimationRef.current = null;
      }
    };
  }, [pathD]);

  /*
   * EXIT HANDLING (timers are cleaned up, callbacks read via refs)
   */
  useEffect(() => {
    let checkTimer = 0;
    let holdTimer = 0;
    let enterTimer = 0;
    let cancelled = false;

    const checkReady = () => {
      if (cancelled || exitRef.current) return;

      const startTime = startRef.current;
      const ready =
        progressRef.current >= 1 &&
        logoCompleteRef.current &&
        startTime !== null &&
        performance.now() - startTime >= MIN_LOGO_TIME;

      if (ready) {
        exitRef.current = true;

        holdTimer = window.setTimeout(() => {
          if (cancelled) return;

          exitingRef.current = true;
          stopAnimationRef.current?.();
          setExiting(true);
          onExitStartRef.current?.();

          enterTimer = window.setTimeout(() => {
            if (cancelled || enteredRef.current) return;
            enteredRef.current = true;
            onEnterRef.current();
          }, EXIT_DURATION);
        }, LOGO_HOLD);

        return;
      }

      // A timeout is cheaper than a permanent interval and stops immediately
      // once the preloader is ready.
      checkTimer = window.setTimeout(checkReady, 120);
    };

    checkReady();

    return () => {
      cancelled = true;
      window.clearTimeout(checkTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(enterTimer);
    };
  }, []);

  /*
   * RENDER
   */
  return (
    <div
      className={[styles.preloader, exiting ? styles.exiting : ""].join(" ")}
      style={{ "--exit-duration": `${EXIT_DURATION}ms` } as CSSProperties}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 42%",
          transform: exiting
            ? "perspective(1100px) translateY(38px) scale(0.92)"
            : "perspective(1100px) rotateX(0deg) translateY(0px) scale(1)",
          opacity: exiting ? 0 : 1,
          transition: `transform ${EXIT_DURATION}ms cubic-bezier(0.55, 0, 0.15, 1), opacity ${EXIT_DURATION}ms ease`,
          willChange: exiting ? "transform, opacity" : undefined,
        }}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.bg}></div>
        <img src={bg} className={styles.img} style={{ opacity: "0.6" }} alt="" decoding="async" />
        <svg
          className={styles.sourceSvg}
          viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path ref={pathRef} d={pathD ?? ""} />
        </svg>

        <div className={styles.shootingStars}>
          {Array.from({ length: SHOOTING_STARS }).map((_, i) => (
            <div
              key={`ambient-${i}`}
              ref={(el) => {
                starRefs.current[i] = el;
              }}
              className={styles.star}
              style={{ opacity: 0, zIndex: 20 }}
            />
          ))}
          {Array.from({ length: GAP_CLUSTER_COUNT }).map((_, i) => (
            <div
              key={`filler-${i}`}
              ref={(el) => {
                fillerRefs.current[i] = el;
              }}
              className={`${styles.star} ${styles.fillerStar}`}
              style={{ opacity: 0, zIndex: 45 }}
            />
          ))}
        </div>


         <div className={`${styles.c1} ${styles.logoPath} ${logosReady ? styles.logoStart : ""}`}>
                    <svg width="486" height="166" viewBox="0 0 486 166" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path pathLength="1" d="M484.75 115.815C482.791 117.307 479.221 120.3 476.171 123.179C473.481 125.719 470.449 127.304 466.602 131.796C463.585 135.319 460.249 136.303 456.936 138.305C453.624 140.307 450.048 142.797 447.182 144.308C442.483 146.784 435.017 145.556 431.796 146.434C427.215 147.682 416.839 147.311 409.694 145.943C406.656 145.361 403.88 143.817 399.856 141.2C395.308 138.241 392.606 136.318 389.294 134.694C386.239 133.197 376.92 133.063 370.239 134.057C365.728 134.727 363.08 136.558 359.234 138.927C355.593 141.17 352.343 143.052 348.942 144.432C345.324 145.9 327.971 146.561 317.269 145.317C313.658 144.896 310.115 143.562 305.729 141.694C302.694 140.402 299.733 140.067 295.537 137.949C285.911 133.088 280.6 133.573 275.22 132.939C267.574 132.038 255.357 133.303 251.862 135.058C249.033 136.478 243.923 137.802 233.277 143.663C228.668 146.2 225.648 148.301 222.516 150.427C218.221 153.342 214.912 154.555 211.599 156.925C208.706 158.995 205.785 160.3 199.265 162.677C195.157 164.175 191.827 163.809 186.921 164.432C175.939 165.825 172.329 162.324 169.097 160.067C166.298 158.112 161.603 155.335 157.201 152.444C152.458 149.329 147.452 145.826 140.843 142.576C138.703 141.523 136.21 140.337 126.341 139.823C116.471 139.31 99.2864 139.557 89.9024 139.808C79.4513 140.088 70.3882 140.562 57.9549 140.438C51.317 140.372 48.4904 138.567 45.6236 137.566C42.7569 136.565 39.5466 135.073 35.1606 131.826C31.8999 129.412 27.5643 126.584 21.3879 122.204C17.6833 119.577 4.39412 119.565 1.6643 119.816C-2.94682 120.24 11.0403 117.315 17.5709 116.692C33.4027 115.184 37.002 118.065 41.4792 118.687C46.4748 119.382 60.3439 115.35 70.7345 112.943C75.6187 111.811 81.3666 108.841 85.3285 105.451C88.1263 103.058 90.5144 99.3321 93.0241 96.0812C96.2766 91.8683 99.4582 88.8333 102.507 87.3222C105.915 85.6335 111.086 86.0737 119.842 85.9424C124.766 85.8686 127.911 88.0684 132.385 88.9383C136.511 89.7403 140.613 92.3129 144.199 94.1839C149.123 96.7533 153.669 100.052 160.014 102.062C168.236 104.666 174.45 101.574 175.521 100.078C177.761 96.9486 179.813 93.3328 181.517 88.9608C183.194 84.6601 185.181 80.8393 187.42 77.7046C189.827 74.3344 193.942 72.8302 198.06 71.5741C200.182 70.9269 203.777 70.8205 207.712 70.3256C211.255 69.88 212.023 61.3566 213.996 54.7199C215.293 50.3575 218.1 45.8485 220.881 42.3351C223.973 38.4293 227.409 37.5844 236.96 37.1982C239.757 37.5694 241.018 38.5668 242.178 39.9392C242.806 40.5691 243.515 41.064 244.781 41.574" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M330.199 74.5864C328.422 77.8185 324.487 82.8204 322.155 86.4462C319.995 89.8032 314.846 93.5591 309.458 96.825C305.907 98.9781 298.579 98.5835 292.287 99.2059C282.087 100.215 277.793 96.0938 273.042 94.0915C269.582 92.6335 267.045 88.0998 262.67 83.4878C253.461 73.781 252.368 67.1173 249.949 62.6028C248.132 59.2107 248.599 54.6088 248.154 50.6042C247.684 46.3864 247.526 35.4261 248.505 28.1069C249.062 23.9447 251.627 20.1129 254.494 16.8545C257.73 13.1763 264.135 9.86913 268.36 7.22569C271.206 5.44543 275.592 3.85485 279.723 1.97632C286.694 -1.1936 298.15 2.58 301.288 4.33855C304.725 6.26495 307.276 11.069 310.237 14.5823C312.608 17.3956 314.083 21.3277 315.522 25.9472C317.207 31.358 316.241 38.8007 316.687 44.8149C317.389 54.293 314.813 59.8131 313.474 63.9489C312.169 67.9782 308.382 70.0719 305.515 72.2054C302.887 74.1617 299.084 73.8365 295.318 74.5826C289.989 75.6384 282.796 74.3464 279.747 72.8428C275.902 70.9472 274.013 63.8627 272.494 56.3785C270.893 48.4916 272.752 42.1003 273.911 40.353C276.037 37.1504 279.543 37.3458 284.275 36.4684C292.198 34.9995 294.403 38.5907 295.565 39.0856C296.018 39.5806 296.196 40.5705 296.464 41.5753C296.732 42.5802 297.087 43.5701 297.452 46.8397" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M484.75 114.728C483.403 115.017 480.315 116.183 477.216 117.353C475.672 117.936 474.116 118.524 467.975 118.962C441.448 120.856 437.941 117.656 434.746 117.068C430.825 116.348 427.493 113.57 424.393 111.085C421.023 108.382 418.589 104.225 415.3 98.8248C411.954 93.3296 411.426 86.9897 409.49 79.2531C408.024 73.396 406.399 68.001 404.46 63.0214C402.373 57.6605 395.985 49.0472 391.307 43.7259C388.389 40.4069 384.736 37.2998 380.957 35.1038C377.863 33.3055 374.288 32.6184 370.895 31.448C366.616 29.9719 361.901 29.9884 344.829 29.8349C338.83 29.781 335.78 32.0222 332.584 34.2095C328.888 36.7395 326.492 40.4909 323.874 43.5593C323.195 44.2957 322.429 44.8743 321.747 45.6063C321.065 46.3383 320.49 47.2062 318.157 49.8538" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M211.967 70.8447C213.389 70.8447 216.605 71.8346 219.472 73.9606C222.683 76.342 225.194 80.5786 227.438 84.3281C229.53 87.8231 228.963 93.0721 229.591 99.4313C230.307 106.683 229.328 112.33 228.526 114.325C226.744 118.752 223.079 121.824 219.319 124.951C217.021 126.862 212.89 127.838 208.241 127.714C205.704 127.647 203.57 125.108 201.246 121.49C198.23 116.796 199.265 109.615 199.348 102.866C199.367 101.306 200.145 100.361 201.482 99.8512C207.844 100.084 209.991 102.086 211.153 103.331C211.607 104.081 211.784 105.071 213.577 106.84" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
        
                  </div>
        
        <div className={`${styles.c11} ${styles.logoPathC11} ${logosReady ? styles.logoStart : ""}`}>
                    <svg width="441" height="136" viewBox="0 0 441 136" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path pathLength="1" d="M0.75 108.043C4.20028 108.043 11.4822 107.744 14.5058 107.213C19.885 106.268 22.3779 106.382 38.744 105.399C44.0412 105.081 46.7387 104.566 49.3174 103.96C51.75 103.388 54.1568 102.45 56.0545 100.335C57.8432 98.3407 57.7978 95.4953 58.5537 92.7691C59.2503 90.2568 61.2753 88.2315 62.8643 85.8073C66.1149 80.8479 73.6782 75.5109 76.1774 74.9048C79.1072 74.1943 81.85 73.6949 84.2742 73.0888C86.8104 72.4548 89.5677 72.333 93.3403 71.8018C98.5422 71.0694 103.787 72.1741 106.585 73.2296C107.68 73.6425 107.736 74.5847 107.963 74.671C109.897 75.4059 117.197 66.3313 122.863 63.1012C125.16 61.7914 128.156 61.8913 137.136 61.9617C141.855 61.9986 144.046 65.2054 145.944 67.6297C147.887 70.1129 149.648 73.6768 151.164 76.8569C152.122 78.8645 151.786 86.1886 149.523 96.4714C147.641 105.024 142.557 105.465 137.27 108.561C133.472 110.786 129.255 111.367 121.462 111.6C117.79 111.711 115.772 109.56 112.971 108.05C110.371 106.649 109.262 103.667 107.368 100.866C102.774 95.518 96.096 87.6232 93.5265 86.4065C92.6185 86.2522 91.42 86.2522 90.1851 86.2522" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M124.727 64.4174C124.727 63.3642 125.625 60.949 127.067 58.2228C128.266 55.9547 130.011 53.086 131.607 50.2032C132.504 48.5823 133.348 46.8709 134.328 45.4363C135.294 44.0235 141.02 36.9422 148.811 26.6549C153.169 20.8999 156.487 19.3276 159.747 16.9101C162.747 14.6854 165.422 13.8798 167.846 12.6676C170.27 11.4555 172.686 10.2479 175.185 8.73384C177.669 7.22878 181.003 6.77035 184.714 5.32894C188.381 3.90473 197.137 1.93994 203.557 0.784546C204.915 0.540027 213.776 1.60399 226.56 3.64466C233.628 4.7729 236.997 7.66015 238.822 9.85518C240.64 12.0419 242.754 13.8616 244.497 16.8874C246.59 20.5206 247.448 24.4486 247.832 27.6333C248.393 32.2932 247.611 38.3768 245.95 42.3015C243.982 46.9504 242.164 50.9386 237.885 54.9246C228.39 63.7694 219.019 67.895 216.3 68.4239C211.224 69.4111 205.699 68.6577 202.751 67.525C197.74 65.6 195.557 63.9725 192.609 60.1205C190.344 57.1614 189.047 54.5932 187.458 51.4153C186.074 48.6465 185.415 45.2138 185.182 39.6208C185.034 36.0928 186.314 32.8019 188.954 28.4936C190.835 25.4236 192.815 23.1138 194.552 21.5271C201.091 15.5525 217.93 23.2409 220.359 25.1409C222.866 27.1021 223.986 31.8576 224.454 39.7978C224.664 43.3787 221.889 45.341 219.619 47.1592C218.44 48.1029 214.348 50.0261 208.453 52.296C206.056 53.2188 204.655 53.0678 203.811 51.1951C202.966 49.3224 202.667 45.577 203.636 43.6476C204.605 41.7182 206.853 41.7182 209.168 41.7182" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M248.701 24.6486C256.823 23.5909 268.359 23.8859 272.143 25.5498C276.216 27.3408 278.809 31.749 281.073 37.7711C285.04 48.327 285.474 57.6216 285.249 60.3433C284.575 61.8664 283.812 63.0785 283.134 64.4382C282.755 65.0488 282.305 65.4983 280.48 65.9613" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M282.268 52.1816C292.977 52.1816 302.37 53.3802 305.337 55.3527C306.32 56.2584 307.382 56.8713 309.189 57.6976C310.397 58.374 312.194 59.5725 314.047 60.8074" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M353.702 109.035C347.463 108.883 342.475 108.268 336.636 106.731C331.996 105.51 328.922 102.416 326.103 99.9547C323.384 97.5811 320.583 95.3346 317.873 92.7137C313.594 88.5755 311.406 83.4734 311.503 70.8727C311.542 65.8389 315.557 62.6725 318.889 59.6633C322.236 56.64 325.971 55.7296 329.932 54.1118C334.139 52.393 338.886 51.4123 348.754 49.7205C363.915 47.121 369.305 51.7081 372.965 53.6357C376.481 55.4873 378.069 58.9468 379.328 61.4152C380.543 63.7957 380.582 75.4951 379.338 82.7546C378.751 86.1774 373.305 88.8354 370.383 90.9248C368.882 91.9982 366.423 92.3901 364.447 93.1597C355.379 96.6929 339.536 84.8509 338.911 83.3925C337.424 79.9232 338.074 77.3071 339.421 74.8387C341.054 71.8467 346.388 70.2163 350.042 68.9775C350.918 68.6802 352.014 68.8203 352.855 69.1254C356.307 70.378 357.027 73.7386 357.246 79.6599C357.04 80.9866 356.627 81.5968 356.002 81.9873C355.377 82.3779 354.552 82.5305 353.702 81.7631" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M368.685 91.1611C368.385 91.1611 368.085 91.1611 368.231 91.3109C369.782 92.9107 372.607 93.876 374.956 95.6942C377.117 97.3665 378.064 100.077 379.723 103.328C380.308 104.474 381.078 105.961 381.989 106.808C389.091 113.414 406.801 108.258 409.986 108.864C413.054 109.448 416.635 110.229 419.597 111.057C422.914 111.985 426.631 111.89 429.582 112.421C432.812 113.003 436.156 113.406 439.043 114.235C439.668 114.414 440.251 114.614 439.061 115.44C431.693 120.559 428.02 120.062 424.318 120.516C416.129 121.52 413.493 122.332 410.086 122.561C406.646 122.793 401.853 123.394 397.758 123.771C390.512 124.438 384.315 124.302 373.238 125.351C366.455 125.993 357.517 128.497 352.511 129.727C343.988 131.822 338.585 133.527 333.905 134.213C323.7 135.707 319.064 132.174 314.828 130.288C311.199 128.672 308.622 126.881 305.667 125.292C304.981 124.91 304.382 124.611 303.624 124.232C302.866 123.853 301.967 123.403 300.133 122.94" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M235.166 129.508C237.418 129.808 242.266 131.016 244.691 131.399C247.32 131.815 249.984 132.686 258.719 133.817C270.337 135.32 278.44 133.898 280.097 133.522C286.015 132.176 291.442 129.971 296.888 126.646C300.162 124.646 302.192 121.809 303.788 118.624C305.291 115.624 306.732 111.676 307.275 104.489C307.551 100.832 304.036 96.6943 300.706 93.1259C296.691 88.8235 286.085 89.1036 279.443 90.309C276.441 90.8539 273.464 91.6732 271.342 93.2576C268.332 95.5047 268.915 100.29 268.986 109.799C269.014 113.593 271.93 115.725 273.823 117.623C275.808 119.612 279.039 119.82 281.915 121.18C286.449 123.324 293.866 121.191 295.993 119.378C299.388 116.483 298.724 108.053 298.122 104.473C297.999 103.737 297.371 103.041 296.84 102.58C294.1 100.203 288.446 102.414 286.021 103.175C283.148 104.23 280.269 106.196 279.134 108.08C278.749 109.215 278.749 110.713 278.749 111.803" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M2.91406 110.65C15.8828 116.51 21.4624 118.921 24.7731 119.377C29.4215 120.017 34.4509 120.429 40.979 120.957C52.969 121.927 61.7644 120.885 63.3511 120.585C66.5367 119.982 69.7102 119.083 73.7547 117.878C76.3792 117.096 78.9923 116.375 85.6079 116.142C89.5333 116.004 92.649 118.469 94.8383 119.3C98.1841 120.57 102.058 122.388 104.317 123.212C106.455 123.992 108.819 124.943 111.144 125.471C112.376 125.751 113.731 125.846 119.449 126.372C124.499 126.837 133.961 126.749 139.354 127.049C148.408 127.553 153.878 130.054 157.731 131.636C164.559 134.44 167.284 133.972 173.597 134.349C178.985 134.671 188.835 134.279 194.364 134.054C202.341 133.728 204.4 132.022 206.589 131.345C209.101 130.568 211.161 129.765 213.68 128.862C216.1 127.995 218.319 127.959 229.421 127.88C231.845 127.954 232.501 128.103 233.167 128.255C233.833 128.406 234.489 128.555 235.166 129.16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
        
        <div className={`${styles.c2} ${styles.logoPathC2} ${logosReady ? styles.logoStart : ""}`}>
                    <svg width="321" height="79" viewBox="0 0 321 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path pathLength="1" d="M320.215 55.1204C318.921 55.8255 316.565 57.2393 314.552 58.6C312.777 59.8004 310.775 60.5489 308.236 62.6715C306.245 64.3364 304.043 64.8011 301.856 65.7472C299.67 66.6933 297.31 67.8697 295.418 68.5837C292.317 69.7539 287.388 69.1737 285.262 69.5883C282.239 70.1779 275.39 70.0028 270.674 69.3562C268.669 69.0812 266.837 68.3516 264.181 67.1149C261.179 65.7171 259.395 64.8082 257.209 64.041C255.193 63.3334 249.041 63.2703 244.632 63.7398C241.654 64.0568 239.906 64.9215 237.368 66.0413C234.965 67.1009 232.82 67.9902 230.575 68.6422C228.186 69.3359 216.732 69.6485 209.669 69.0603C207.285 68.8618 204.947 68.2311 202.052 67.3488C200.049 66.7383 198.094 66.5799 195.325 65.5789C188.971 63.282 185.465 63.5113 181.915 63.2118C176.867 62.7862 168.804 63.3837 166.497 64.2129C164.63 64.8841 161.256 65.5098 154.23 68.279C151.187 69.4779 149.194 70.4706 147.127 71.4751C144.292 72.8525 142.108 73.4258 139.921 74.5455C138.012 75.5236 136.084 76.1401 131.78 77.2634C129.068 77.9712 126.871 77.7984 123.632 78.0925C116.384 78.7508 114.001 77.0968 111.868 76.0302C110.02 75.1063 106.921 73.7943 104.016 72.4283C100.885 70.9565 97.5808 69.3012 93.2188 67.7652C91.8063 67.2677 90.1609 66.7074 83.6463 66.4647C77.1316 66.222 65.7891 66.3389 59.5952 66.4576C52.6969 66.5898 46.7148 66.8137 38.5082 66.7553C34.1268 66.7241 32.2611 65.8712 30.3689 65.3981C28.4767 64.9251 26.3577 64.2199 23.4628 62.6856C21.3106 61.545 18.4488 60.2088 14.3721 58.1394C11.9269 56.8982 3.15534 56.8921 1.35352 57.0108C-1.69006 57.2113 7.54214 55.8291 11.8527 55.535C22.3025 54.822 24.6782 56.1834 27.6334 56.4775C30.9308 56.8057 40.085 54.9007 46.9434 53.7632C50.1672 53.2286 53.9611 51.825 56.5762 50.2233C58.4229 49.0923 59.9992 47.3319 61.6557 45.7958C63.8025 43.8051 65.9025 42.371 67.9152 41.657C70.1645 40.8591 73.5776 41.0671 79.3569 41.0051C82.607 40.9702 84.6827 42.0096 87.6362 42.4207C90.3592 42.7996 93.0665 44.0152 95.4335 44.8993C98.684 46.1134 101.684 47.6721 105.872 48.6217C111.299 49.8521 115.401 48.3914 116.108 47.6844C117.586 46.2057 118.941 44.4971 120.066 42.4313C121.172 40.3991 122.484 38.5937 123.962 37.1126C125.55 35.5201 128.267 34.8093 130.985 34.2158C132.385 33.91 134.759 33.8597 137.356 33.6258C139.694 33.4153 140.201 29.3879 141.503 26.2519C142.359 24.1906 144.212 22.06 146.048 20.3999C148.089 18.5543 150.357 18.1551 156.661 17.9727C158.507 18.1481 159.339 18.6193 160.105 19.2678C160.519 19.5654 160.987 19.7993 161.823 20.0403" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M218.203 35.6389C217.03 37.1661 214.433 39.5296 212.893 41.2428C211.468 42.8291 208.069 44.6038 204.513 46.147C202.169 47.1644 197.332 46.9779 193.179 47.272C186.447 47.7488 183.612 45.8015 180.476 44.8554C178.193 44.1664 176.518 42.0242 173.63 39.8449C167.552 35.2583 166.83 32.1096 165.234 29.9764C164.035 28.3736 164.343 26.1991 164.049 24.3069C163.739 22.3139 163.634 17.135 164.281 13.6766C164.649 11.7099 166.341 9.89928 168.234 8.35965C170.37 6.62163 174.598 5.05894 177.386 3.80987C179.264 2.96867 182.159 2.21709 184.886 1.32946C189.487 -0.168383 197.049 1.6147 199.12 2.44565C201.389 3.3559 203.073 5.62589 205.027 7.28599C206.592 8.61532 207.566 10.4733 208.515 12.6561C209.628 15.2128 208.99 18.7295 209.284 21.5714C209.748 26.0499 208.048 28.6583 207.164 30.6125C206.302 32.5164 203.803 33.5057 201.91 34.5138C200.175 35.4382 197.665 35.2845 195.18 35.6371C191.662 36.136 186.915 35.5255 184.902 34.815C182.365 33.9193 181.118 30.5717 180.115 27.0354C179.058 23.3087 180.285 20.2887 181.05 19.463C182.453 17.9498 184.767 18.0421 187.891 17.6275C193.12 16.9334 194.576 18.6303 195.343 18.8642C195.642 19.0981 195.759 19.5658 195.936 20.0406C196.113 20.5154 196.347 20.9832 196.588 22.5281" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M320.215 54.6058C319.326 54.7425 317.288 55.2935 315.242 55.8465C314.223 56.122 313.196 56.3995 309.142 56.6066C291.633 57.5013 289.319 55.9894 287.21 55.7119C284.621 55.3713 282.422 54.059 280.376 52.8847C278.152 51.6076 276.545 49.6432 274.375 47.0915C272.166 44.4949 271.817 41.4992 270.539 37.8435C269.572 35.0759 268.499 32.5267 267.219 30.1738C265.842 27.6407 261.626 23.5708 258.538 21.0563C256.612 19.488 254.201 18.0199 251.706 16.9822C249.664 16.1325 247.304 15.8079 245.065 15.2548C242.24 14.5573 239.128 14.5651 227.86 14.4926C223.9 14.4672 221.887 15.5262 219.778 16.5597C217.338 17.7551 215.757 19.5278 214.029 20.9776C213.58 21.3256 213.075 21.599 212.625 21.9449C212.174 22.2908 211.795 22.7009 210.255 23.9519" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M140.168 33.8711C141.107 33.8711 143.229 34.3388 145.121 35.3434C147.241 36.4686 148.899 38.4705 150.38 40.2422C151.76 41.8936 151.386 44.3739 151.801 47.3787C152.273 50.8052 151.627 53.4734 151.097 54.416C149.922 56.5079 147.503 57.9594 145.02 59.4371C143.503 60.34 140.777 60.8013 137.708 60.7428C136.034 60.7109 134.626 59.5115 133.091 57.8018C131.101 55.5839 131.784 52.1907 131.839 49.0016C131.851 48.2648 132.365 47.8181 133.247 47.5771C137.446 47.687 138.864 48.6331 139.631 49.2213C139.93 49.5756 140.047 50.0434 141.231 50.8796" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
        
        <div className={`${styles.c3} ${styles.logoPathC3} ${logosReady ? styles.logoStart : ""}`}>
                    <svg width="423" height="130" viewBox="0 0 423 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path pathLength="1" d="M421.75 103.644C418.441 103.644 411.458 103.356 408.558 102.847C403.4 101.941 401.009 102.05 385.314 101.108C380.234 100.803 377.647 100.309 375.174 99.7275C372.841 99.1792 370.533 98.2799 368.713 96.2511C366.998 94.3388 367.041 91.61 366.316 88.9956C365.648 86.5864 363.706 84.6441 362.182 82.3192C359.065 77.5632 351.812 72.445 349.415 71.8638C346.605 71.1824 343.975 70.7035 341.65 70.1223C339.218 69.5143 336.574 69.3974 332.956 68.8881C327.967 68.1857 322.938 69.2451 320.254 70.2573C319.204 70.6533 319.15 71.5569 318.933 71.6396C317.078 72.3443 310.077 63.6418 304.644 60.5442C302.441 59.2881 299.567 59.3839 290.956 59.4514C286.431 59.4869 284.329 62.5621 282.509 64.887C280.645 67.2684 278.957 70.6861 277.503 73.7359C276.585 75.6612 276.906 82.6849 279.076 92.5461C280.882 100.748 285.757 101.171 290.827 104.14C294.47 106.273 298.514 106.831 305.987 107.055C309.509 107.16 311.444 105.098 314.13 103.65C316.624 102.307 317.687 99.4467 319.503 96.7605C323.909 91.6318 330.313 84.0607 332.777 82.8939C333.648 82.7459 334.798 82.7459 335.982 82.7459" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M302.859 61.8068C302.859 60.7968 301.997 58.4806 300.615 55.8662C299.465 53.6911 297.792 50.94 296.261 48.1754C295.401 46.6209 294.592 44.9797 293.651 43.604C292.725 42.2491 287.234 35.4582 279.763 25.5927C275.583 20.0737 272.401 18.5658 269.275 16.2475C266.398 14.114 263.833 13.3414 261.508 12.1789C259.183 11.0165 256.867 9.85842 254.47 8.40646C252.088 6.96313 248.891 6.52349 245.332 5.14119C241.815 3.77537 233.418 1.89115 227.261 0.783129C225.959 0.548637 217.461 1.56898 205.201 3.52596C198.423 4.60794 195.192 7.37681 193.442 9.48183C191.698 11.5789 189.671 13.324 188 16.2257C185.992 19.7099 185.17 23.4768 184.802 26.5309C184.264 30.9998 185.013 36.834 186.606 40.5977C188.494 45.056 190.237 48.8807 194.341 52.7032C203.446 61.1853 212.433 65.1417 215.041 65.649C219.909 66.5957 225.206 65.8732 228.034 64.7869C232.84 62.9409 234.933 61.3801 237.76 57.686C239.933 54.8483 241.176 52.3854 242.7 49.3378C244.027 46.6825 244.659 43.3906 244.883 38.0269C245.025 34.6436 243.797 31.4876 241.265 27.356C239.461 24.4119 237.562 22.1968 235.897 20.6752C229.626 14.9456 213.478 22.3187 211.148 24.1407C208.744 26.0216 207.67 30.582 207.221 38.1967C207.019 41.6307 209.681 43.5125 211.858 45.2562C212.988 46.1612 216.913 48.0056 222.566 50.1824C224.864 51.0674 226.208 50.9226 227.018 49.1267C227.827 47.3307 228.115 43.7389 227.185 41.8886C226.256 40.0383 224.101 40.0383 221.88 40.0383" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M183.965 23.6682C176.176 22.6538 165.113 22.9367 161.484 24.5324C157.578 26.25 155.091 30.4774 152.921 36.2526C149.116 46.3757 148.7 55.2891 148.915 57.8992C149.562 59.3598 150.293 60.5223 150.944 61.8262C151.308 62.4118 151.739 62.8428 153.489 63.2869" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M151.773 50.0723C141.503 50.0723 132.495 51.2216 129.65 53.1133C128.707 53.9819 127.689 54.5696 125.956 55.362C124.798 56.0107 123.074 57.1601 121.297 58.3443" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M83.267 104.595C89.2498 104.449 94.0337 103.859 99.633 102.385C104.083 101.214 107.031 98.2469 109.734 95.8864C112.341 93.6102 115.028 91.4557 117.627 88.9423C121.73 84.9738 123.828 80.0809 123.735 67.9969C123.698 63.1695 119.848 60.1329 116.652 57.2471C113.442 54.3478 109.86 53.4748 106.062 51.9233C102.028 50.275 97.4748 49.3344 88.0119 47.712C73.4722 45.2192 68.3038 49.6181 64.7938 51.4667C61.422 53.2424 59.899 56.56 58.691 58.9272C57.526 61.2101 57.489 72.4298 58.682 79.3916C59.2445 82.6741 64.4671 85.2231 67.2697 87.2268C68.7095 88.2561 71.0674 88.632 72.9618 89.3701C81.6582 92.7584 96.8513 81.402 97.4508 80.0034C98.877 76.6762 98.2541 74.1675 96.9622 71.8003C95.3963 68.931 90.281 67.3674 86.7769 66.1794C85.9361 65.8943 84.8856 66.0287 84.0793 66.3213C80.7689 67.5225 80.0777 70.7453 79.8679 76.4238C80.0657 77.6961 80.4614 78.2812 81.0608 78.6558C81.6603 79.0304 82.4517 79.1767 83.267 78.4408" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M68.9034 87.4531C69.1908 87.4531 69.4781 87.4531 69.3388 87.5968C67.8512 89.1309 65.1418 90.0566 62.8887 91.8003C60.8165 93.404 59.9086 96.0038 58.3173 99.121C57.7563 100.22 57.0177 101.646 56.1448 102.458C49.3338 108.794 32.3496 103.849 29.2954 104.43C26.3531 104.99 22.9194 105.739 20.0787 106.533C16.8978 107.423 13.3326 107.332 10.5027 107.842C7.40564 108.399 4.19846 108.786 1.4295 109.581C0.830241 109.753 0.271425 109.944 1.4121 110.737C8.47847 115.645 12.0003 115.169 15.5508 115.604C23.4046 116.567 25.9322 117.346 29.1997 117.566C32.4988 117.788 37.0952 118.364 41.0222 118.726C47.9709 119.365 53.9136 119.235 64.5366 120.241C71.042 120.857 79.6136 123.258 84.4135 124.438C92.5875 126.447 97.7686 128.082 102.257 128.739C112.044 130.173 116.49 126.784 120.552 124.976C124.032 123.426 126.503 121.708 129.337 120.184C129.995 119.819 130.569 119.531 131.297 119.168C132.024 118.804 132.886 118.373 134.645 117.929" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M196.945 124.228C194.786 124.515 190.136 125.673 187.811 126.041C185.29 126.44 182.735 127.275 174.358 128.359C163.216 129.801 155.446 128.438 153.857 128.076C148.181 126.786 142.977 124.672 137.754 121.483C134.614 119.565 132.667 116.844 131.137 113.79C129.695 110.913 128.313 107.126 127.793 100.234C127.528 96.7272 130.899 92.7592 134.093 89.3371C137.943 85.2111 148.114 85.4798 154.484 86.6357C157.363 87.1582 160.217 87.944 162.253 89.4634C165.139 91.6184 164.58 96.2073 164.512 105.326C164.485 108.965 161.689 111.01 159.873 112.83C157.97 114.738 154.871 114.937 152.113 116.241C147.765 118.297 140.652 116.252 138.612 114.512C135.356 111.736 135.993 103.652 136.57 100.219C136.689 99.5128 137.291 98.8456 137.8 98.4037C140.428 96.1243 145.85 98.2448 148.175 98.9741C150.931 99.9863 153.691 101.871 154.78 103.678C155.15 104.767 155.15 106.203 155.15 107.248" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path pathLength="1" d="M419.676 106.144C407.239 111.763 401.888 114.075 398.713 114.512C394.255 115.126 389.432 115.521 383.171 116.028C371.673 116.958 363.238 115.958 361.717 115.67C358.662 115.092 355.618 114.231 351.74 113.075C349.223 112.325 346.717 111.633 340.372 111.41C336.608 111.278 333.62 113.642 331.52 114.439C328.312 115.656 324.596 117.4 322.43 118.19C320.38 118.938 318.113 119.85 315.884 120.357C314.702 120.625 313.403 120.716 307.918 121.221C303.075 121.666 294.002 121.582 288.83 121.87C280.147 122.353 274.902 124.751 271.206 126.269C264.659 128.957 262.045 128.509 255.991 128.871C250.824 129.179 241.378 128.804 236.075 128.587C228.425 128.275 226.451 126.639 224.351 125.989C221.943 125.244 219.967 124.474 217.551 123.608C215.231 122.777 213.102 122.742 202.456 122.667C200.131 122.738 199.502 122.881 198.863 123.026C198.224 123.171 197.595 123.314 196.947 123.894" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
        
                  </div>
        
        <div className={`${styles.light2} ${logosReady ? styles.logoStart : ""}`}>
                    <img src={light2} />
        
                  </div>
      </div>

      <div className={styles.loadingBarRow}>
        <span ref={percentRef} className={styles.loadingBarPercent}>
          {initialPercent.current}
        </span>
      </div>
    </div>
  );
}

/**
 * Critical loading gate:
 * 1. Load/decode ONLY bg_star.webp.
 * 2. Mount the actual preloader immediately after it is ready.
 * 3. The preloader then starts loading all remaining assets from its own effect.
 */
export default function Preloader(props: PreloaderProps) {
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.decoding = "async";
    image.src = bg;

    const ready = () => {
      if (!cancelled) setBackgroundReady(true);
    };

    if (image.complete) {
      if (typeof image.decode === "function") {
        image.decode().then(ready, ready);
      } else {
        ready();
      }
    } else {
      image.onload = ready;
      image.onerror = ready;
    }

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  // Do not mount the heavy preloader tree until the critical background is ready.
  if (!backgroundReady) return null;

  return <PreloaderContent {...props} />;
}
