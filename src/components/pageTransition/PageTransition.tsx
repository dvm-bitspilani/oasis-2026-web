import styles from "./PageTransition.module.scss";
import { gsap } from "gsap";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const CLOUD_SELECTOR = "[data-cloud-string]";
const CASTLE_SELECTOR = "[data-castle-drown]";
const MOON_SELECTOR = "[data-moon-shrink]";
const FADE_SELECTOR = "[data-transition-fade]";

type CloudRig = {
  el: HTMLElement;
  group: SVGGElement;
  path: SVGPathElement;
  anchorX: number;
  hookY: number;
};

export type PageTransitionHandle = {
  resumeSmoke: () => void;
};

type PageTransitionProps = {
  onComplete?: () => void;
  /** URLs to start loading as soon as the transition mounts (images, fonts, json, video...). */
  assets?: string[];
  /** Optional extra loader, e.g. () => import("../pages/Home"). Counts as one unit in the bar. */
  preload?: () => Promise<unknown>;
};

const STRING_TAUT_DELAY = 0.05;
const SMOKE_START_PERCENT = 0.48;

// Smoke sequence, in seconds. Phases:
//   TORNADO_SECONDS : MINIMUM time for the tornado to form. On slow devices the
//                     formation is stretched: it advances only as fast as the
//                     destination's assets, JS chunk and fonts load, so it is
//                     fully formed exactly when loading is done (no idle spinning).
//   BURST_SECONDS   : the tornado explodes and spreads over the whole screen
//   COVER_SECONDS   : tiny final settle so the screen is guaranteed opaque
// The route changes only AFTER the burst (in the provider), on the covered
// screen. The loading bar stays visible until the smoke starts fading.
const TORNADO_SECONDS = 3.5;
const BURST_SECONDS = 1.4;
const COVER_SECONDS = 0.5;
const BURST_SHARE = BURST_SECONDS / (BURST_SECONDS + COVER_SECONDS);

// Safety net: never wait forever on a stuck asset.
const ASSET_TIMEOUT_SECONDS = 20;

// Warm the browser cache for one asset. Resolves when done, rejects on error
// (errors are counted as "done" by the caller so one bad url cannot block the page).
const loadAsset = (url: string): Promise<void> => {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(clean)) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.decode) {
          img.decode().then(() => resolve(), () => resolve());
        } else {
          resolve();
        }
      };
      img.onerror = () => reject(new Error("image failed: " + url));
      img.src = url;
    });
  }
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error("asset failed: " + url);
    return res.blob().then(() => undefined);
  });
};

// Formation timeline (seconds). Overlaps are intentional so phases blend together.
const FLARE_SECONDS = 0.6;
const STREAM_START = 0.5;
const STREAM_SECONDS = 2.0;
const HEAD_START = 0.1;
const TOP_FLARE_FROM = 0.55;
const EXPAND_START = 2.0;
const EXPAND_SECONDS = 1.0;

// Spin builds up with this time constant instead of starting at full speed.
const SPIN_UP_SECONDS = 0.7;

// Tail width multiplier (1 = the original tail width, 1.4 = 40% wider).
const TAIL_WIDTH = 1.2;

// Burst targets: particles are spread over a COLS x ROWS jittered grid that
// covers the screen, so the burst fills every part of the page.
const COLS = 36;
const ROWS = 22;

const PageTransition = forwardRef<PageTransitionHandle, PageTransitionProps>(
  function PageTransitionComponent({ onComplete, assets, preload }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const layerRef = useRef<SVGSVGElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // 0 -> 1 over burst + cover. Only starts once the tornado has formed, assets are loaded
    // AND the new page is ready.
    const burstProgressRef = useRef({ value: 0 });
    const burstStartedRef = useRef(false);
    const smokeStartRef = useRef(0); // performance.now() when the smoke started
    const loadedRef = useRef(false);
    const loadProgressRef = useRef(0); // 0 -> 1
    const barRef = useRef<HTMLDivElement | null>(null);
    const barFillRef = useRef<HTMLDivElement | null>(null);
    const assetsRef = useRef(assets);
    const preloadRef = useRef(preload);
    const smokeVisibleRef = useRef(false);

    // True once the smoke starts fading away (page is ready underneath).
    const fadingRef = useRef(false);

    const onCompleteRef = useRef(onComplete);

    // Keep the latest callback without mutating a ref during render.
    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);

    // ASSET PRELOAD: starts the moment the transition mounts, in the background.
    useEffect(() => {
      const urls = assetsRef.current ?? [];
      const extra = preloadRef.current;
      // document.fonts is typed as always present, but older browsers lack it.
      const fontsReady: Promise<unknown> | null =
        "fonts" in document ? document.fonts.ready : null;
      const total = urls.length + (extra ? 1 : 0) + (fontsReady ? 1 : 0);

      loadedRef.current = total === 0;
      loadProgressRef.current = total === 0 ? 1 : 0;
      if (total === 0) return;

      let cancelled = false;
      let done = 0;
      const tick = () => {
        if (cancelled) return;
        done += 1;
        loadProgressRef.current = done / total;
        if (done >= total) loadedRef.current = true;
      };

      urls.forEach((url) => {
        loadAsset(url).then(tick, tick);
      });
      if (extra) {
        Promise.resolve().then(extra).then(tick, tick);
      }
      if (fontsReady) {
        fontsReady.then(tick, tick);
      }

      const timeout = window.setTimeout(() => {
        if (cancelled) return;
        loadProgressRef.current = 1;
        loadedRef.current = true;
      }, ASSET_TIMEOUT_SECONDS * 1000);

      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const smokeContext = canvas?.getContext("2d");
      if (!canvas || !smokeContext) return;

      let width = 0;
      let height = 0;
      let frame = 0;
      let lastDrawTime = 0;
      const frameInterval = 1000 / 40;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        smokeContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);

      // ---------------------------------------------------------------
      // SPRITES
      // Built from many soft overlapping blobs (a billowy puff, not a grainy
      // dot), then given light/dark shading for volume and a soft edge.
      // No ctx.filter, so it also works on Safari.
      // puffiness: 0 = few big blobs (smooth), 1 = many small blobs (lumpy)
      // ---------------------------------------------------------------
      // Palette sorted dark -> light. Narrow, mid-tone range on purpose: low
      // contrast so overlapping puffs melt into one smoke mass.
      const palette = [
        [112, 82, 64],
        [121, 90, 70],
        [130, 97, 75],
        [138, 103, 79],
        [146, 109, 83],
        [154, 116, 88],
        [162, 124, 94],
        [170, 132, 100],
        [178, 140, 106],
        [186, 149, 114],
      ];

      const makeSmokeSprite = (puffiness: number) => {
        const spriteSize = 256;
        const sprite = document.createElement("canvas");
        sprite.width = spriteSize;
        sprite.height = spriteSize;
        const sctx = sprite.getContext("2d");
        if (!sctx) return sprite;

        const r = spriteSize / 2;

        // 1. lumpy body: overlapping soft blobs of varying tone
        const blobCount = 9 + Math.floor(puffiness * 12);
        for (let i = 0; i < blobCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 0.7) * r * 0.42;
          const cx = r + Math.cos(angle) * dist;
          const cy = r + Math.sin(angle) * dist;
          const br = r * (0.5 - puffiness * 0.18 + Math.random() * 0.2);

          // blobs on the upper-left are lighter, lower-right darker
          const lightBias = 0.5 - ((cx - r) + (cy - r)) / (r * 1.6);
          // biased towards the darker/mid tones so the light ones stay as highlights
          const t = Math.max(0, Math.min(1, lightBias * 0.5 + Math.random() * 0.4 + 0.15));
          const pick = palette[Math.min(palette.length - 1, Math.floor(t * palette.length))];
          const cr = pick[0];
          const cg = pick[1];
          const cb = pick[2];

          const g = sctx.createRadialGradient(cx, cy, 0, cx, cy, br);
          g.addColorStop(0, "rgba(" + cr + "," + cg + "," + cb + ",0.5)");
          g.addColorStop(0.55, "rgba(" + cr + "," + cg + "," + cb + ",0.24)");
          g.addColorStop(1, "rgba(" + cr + "," + cg + "," + cb + ",0)");
          sctx.fillStyle = g;
          sctx.beginPath();
          sctx.arc(cx, cy, br, 0, Math.PI * 2);
          sctx.fill();
        }

        // 2. volume shading: light from the top-left, shade on the bottom-right
        sctx.globalCompositeOperation = "source-atop";
        const shade = sctx.createLinearGradient(r * 0.45, r * 0.3, r * 1.55, r * 1.7);
        shade.addColorStop(0, "rgba(236, 210, 176, 0.12)");
        shade.addColorStop(0.5, "rgba(120, 84, 62, 0)");
        shade.addColorStop(1, "rgba(90, 66, 52, 0.14)");
        sctx.fillStyle = shade;
        sctx.fillRect(0, 0, spriteSize, spriteSize);

        // 3. soft circular edge so no puff ever has a hard outline
        sctx.globalCompositeOperation = "destination-in";
        const clip = sctx.createRadialGradient(r, r, 0, r, r, r * 0.98);
        clip.addColorStop(0, "rgba(255, 255, 255, 1)");
        clip.addColorStop(0.4, "rgba(255, 255, 255, 0.85)");
        clip.addColorStop(0.75, "rgba(255, 255, 255, 0.3)");
        clip.addColorStop(1, "rgba(255, 255, 255, 0)");
        sctx.fillStyle = clip;
        sctx.fillRect(0, 0, spriteSize, spriteSize);
        sctx.globalCompositeOperation = "source-over";
        return sprite;
      };

      // 6 variants (2 per puffiness level) so repeats are not noticeable.
      // index % 3 = softness level: 0 small/lumpy, 1 mid, 2 big/smooth
      const spriteList = [
        makeSmokeSprite(0.45),
        makeSmokeSprite(0.25),
        makeSmokeSprite(0.08),
        makeSmokeSprite(0.4),
        makeSmokeSprite(0.2),
        makeSmokeSprite(0.05),
      ];
      const puffSprite = spriteList[2]; // used for mist / glow

      // ---------------------------------------------------------------
      // TORNADO PARTICLES
      // Every particle flows up the spine (a cone from below the page to the
      // top). On burst, each one flies to its own target cell on the screen,
      // growing as it goes, so the tornado itself spreads over the page.
      // ---------------------------------------------------------------
      type TornadoParticle = {
        trail: boolean; // stays clustered near the rising tip to keep the trail dense
        streak: boolean;
        sprite: number; // index into spriteList
        f0: number; // starting place along the spine (0 = base, 1 = tip)
        rise: number; // how fast it flows up the spine
        radiusJitter: number;
        phase: number;
        spin: number;
        size: number;
        opacity: number;
        // burst
        tx: number; // target, as fraction of screen width
        ty: number; // target, as fraction of screen height
        burstSize: number; // size at the end of the burst
        burstDelay: number; // 0 .. 0.4, centre goes first
        swirlDir: number; // -1 / 1, which way the path curves
        coverAlpha: number; // opacity at the end of the burst
        burstRotation: number;
        // written every frame, read by the draw passes below
        x: number;
        y: number;
        drawSize: number;
        drawAlpha: number;
        depth: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
      };

      // jittered grid of burst targets, shuffled so neighbours in the tornado
      // do not all land next to each other
      const targets: Array<[number, number]> = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const jx = (Math.random() - 0.5) * 0.9;
          const jy = (Math.random() - 0.5) * 0.9;
          targets.push([
            ((col + 0.5 + jx) / COLS) * 1.06 - 0.03,
            ((row + 0.5 + jy) / ROWS) * 1.06 - 0.03,
          ]);
        }
      }
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }

      const makeParticle = (target: [number, number]): TornadoParticle => {
        const sprite = [1, 2, 4, 5][Math.floor(Math.random() * 4)];
        const level = sprite % 3;

        let size = 50 + Math.random() * 30;
        if (level === 1) size = 60 + Math.random() * 30;
        if (level === 2) size = 80 + Math.random() * 40;

        const [tx, ty] = target;
        // horizontal distance from the middle of the screen, 0 .. 1
        const dist = Math.min(1, Math.abs(tx - 0.5) / 0.53);

        return {
          trail: Math.random() < 0.4,
          streak: Math.random() < 0.3,
          sprite,
          f0: Math.random(),
          rise: 0.25 + Math.random() * 0.3,
          radiusJitter: 0.55 + Math.random() * 0.75,
          phase: Math.random() * Math.PI * 2,
          spin: 0.85 + Math.random() * 0.3,
          size: size * 1.2,
          opacity: 0.55 + Math.random() * 0.7,
          tx,
          ty,
          burstSize: 125 + Math.random() * 70,
          burstDelay: dist * 0.4,
          swirlDir: Math.random() < 0.5 ? -1 : 1,
          coverAlpha: 0.34 + Math.random() * 0.2,
          burstRotation: Math.random() * Math.PI * 2,
          x: 0,
          y: 0,
          drawSize: 0,
          drawAlpha: 0,
          depth: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 0.62,
        };
      };

      const particles: TornadoParticle[] = targets.map(makeParticle);

      // ---------------------------------------------------------------
      // SIDE MIST — big soft puffs that drift in from the left and right
      // edges while the tornado forms
      // ---------------------------------------------------------------
      const mistPuffs = Array.from({ length: 16 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        return {
          side,
          startX: side < 0 ? -0.12 : 1.12,
          endX: side < 0 ? 0.04 + Math.random() * 0.26 : 0.96 - Math.random() * 0.26,
          y: 0.18 + Math.random() * 0.78,
          radius: 0.5 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.04 + Math.random() * 0.35,
        };
      });

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.25);
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

      let barShown = 0; // smoothed value shown by the loading bar

      // FORMATION CLOCK: drives how far the tornado has formed. It advances at
      // real speed but is capped by how much has loaded, so on slow devices the
      // tornado forms slowly (thin and small at first, full only when loaded)
      // instead of forming fast and then just spinning while it waits.
      let formElapsed = 0;
      let formGate = 0; // smoothed load progress, 0 -> 1
      let prevNow = 0;
      let lastSmokeStart = -1;

      const draw = (now: number) => {
        frame = requestAnimationFrame(draw);
        if (now - lastDrawTime < frameInterval) return;
        lastDrawTime = now;
        if (!smokeVisibleRef.current) {
          smokeContext.clearRect(0, 0, width, height);
          if (barRef.current) barRef.current.style.opacity = "0";
          return;
        }

        // Real clock: keeps running while the tornado waits for assets and the
        // new page, so it keeps spinning instead of freezing.
        const elapsed = Math.max(0, (now - smokeStartRef.current) / 1000);

        // New smoke run -> restart the formation clock.
        if (smokeStartRef.current !== lastSmokeStart) {
          lastSmokeStart = smokeStartRef.current;
          formElapsed = 0;
          formGate = 0;
          prevNow = now;
        }
        const dt = Math.min(0.1, Math.max(0, (now - prevNow) / 1000));
        prevNow = now;

        // Fraction of the formation allowed so far: a small floor so the
        // tornado always starts appearing, the rest unlocked by loading.
        formGate += (loadProgressRef.current - formGate) * 0.08;
        const allowedFrac = loadedRef.current ? 1 : 0.12 + 0.88 * formGate;
        formElapsed = Math.min(formElapsed + dt, TORNADO_SECONDS * allowedFrac);

        const tornadoFormed = formElapsed >= TORNADO_SECONDS - 0.001;

        // BURST GATE: tornado formed AND everything preloaded -> burst.
        // The route is NOT changed yet; the provider does that after the burst.
        if (!burstStartedRef.current && tornadoFormed && loadedRef.current) {
          burstStartedRef.current = true;
          gsap.to(burstProgressRef.current, {
            value: 1,
            duration: BURST_SECONDS + COVER_SECONDS,
            ease: "none",
            onComplete: () => onCompleteRef.current?.(),
          });
        }

        // LOADING BAR: visible from when the tornado has formed until the smoke
        // starts fading. Preload fills it to 90%; the last 10% is "new page ready"
        // (fadingRef), so a slow post-burst wait never looks like a frozen screen.
        const showBar = !fadingRef.current;
        const barTarget = fadingRef.current ? 1 : loadProgressRef.current * 0.9;
        barShown += (barTarget - barShown) * 0.2;
        if (barRef.current) barRef.current.style.opacity = showBar ? "1" : "0";
        if (barFillRef.current) barFillRef.current.style.transform = "scaleX(" + barShown + ")";

        const burstP = burstProgressRef.current.value;

        // -------------------------------------------------------------
        // FORMATION TIMELINE (each value 0 -> 1, eased so nothing snaps)
        // -------------------------------------------------------------
        const intro = smooth(clamp01(formElapsed / 0.3));
        const flareAmount = smooth(clamp01(formElapsed / FLARE_SECONDS));
        const streamRaw = clamp01((formElapsed - STREAM_START) / STREAM_SECONDS);
        const streamReach = 0.55 * streamRaw + 0.45 * smooth(streamRaw);
        const capAmount = smooth(clamp01((streamReach - TOP_FLARE_FROM) / (1 - TOP_FLARE_FROM)));
        const expand = smooth(clamp01((formElapsed - EXPAND_START) / EXPAND_SECONDS));

        const burstRaw = clamp01(burstP / BURST_SHARE);
        const burst = smooth(burstRaw);

        // -------------------------------------------------------------
        // PHYSICS
        // -------------------------------------------------------------
        const spinTime = elapsed - SPIN_UP_SECONDS * (1 - Math.exp(-elapsed / SPIN_UP_SECONDS));
        const swayGrow = smooth(clamp01(elapsed / 1.0));

        // -------------------------------------------------------------
        // GEOMETRY (recomputed each frame so resize just works)
        // u runs along the spine: 0 = base (below the page), 1 = top
        // -------------------------------------------------------------
        const centerX = width * 0.5;
        const baseY = height * 1.1;
        const topY = height * 0.06;
        const spineHeight = baseY - topY;

        const baseRadius = 9;
        const streamRadius = 14;
        const fullRadius = Math.min(width * 0.28, 300);
        const flareRadius = Math.min(width * 0.3, 340) * flareAmount;
        const flareHeight = 0.3;

        const capHeight = spineHeight * (0.18 + 0.12 * expand);
        const capRadius = fullRadius * (0.5 + 0.5 * expand) * (0.25 + 0.75 * capAmount);
        const topFlareRadius = Math.min(width * 0.3, 340) * capAmount;

        const riseOffset = (1 - flareAmount) * height * 0.2;

        const headStartU = flareHeight * 0.6;
        const headTopU = 1.0;
        const headU = headStartU + (headTopU - headStartU) * streamReach;
        const headAmount = smooth(clamp01((formElapsed - HEAD_START) / 0.5));
        const headWidth = Math.min(width * 0.2, 230) * (0.6 + 0.4 * headAmount) * (1 + 0.25 * streamReach);

        const spineExtent = headU;

        const spineRadius = (u: number) => {
          const flareK = u < flareHeight ? Math.pow(1 - u / flareHeight, 1.6) : 0;
          const topFlareK = u > 1 - flareHeight
            ? Math.pow((u - (1 - flareHeight)) / flareHeight, 1.6)
            : 0;

          const tu = headU > 0.001 ? clamp01(u / headU) : 0;

          const coneTop = headWidth * 0.9 * (0.35 + 0.65 * headAmount);
          const cone = streamRadius + (coneTop - streamRadius) * Math.pow(tu, 1.35) * TAIL_WIDTH;

          const formation =
            Math.min(cone, coneTop) + flareRadius * flareK + topFlareRadius * 0.8 * topFlareK;

          const full =
            Math.min(fullRadius, (baseRadius + (fullRadius - baseRadius) * Math.pow(u, 1.35)) * TAIL_WIDTH) +
            flareRadius * 0.7 * flareK + topFlareRadius * 0.7 * topFlareK;

          const expandLocal = smooth(clamp01(expand * 1.5 - (1 - u) * 0.5));
          return formation + (full - formation) * expandLocal;
        };

        smokeContext.clearRect(0, 0, width, height);

        // -------------------------------------------------------------
        // 1. SIDE MIST (behind everything)
        // -------------------------------------------------------------
        const mistProgress = easeOut(clamp01(formElapsed / (TORNADO_SECONDS * 1.1)));
        for (const mist of mistPuffs) {
          const x =
            width * (mist.startX + (mist.endX - mist.startX) * mistProgress) +
            Math.sin(elapsed * 0.9 + mist.phase) * 34;
          const y = height * mist.y + Math.cos(elapsed * 0.7 + mist.phase) * 16;
          const radius = Math.max(width, height) * mist.radius * (1 + burst * 0.9);

          smokeContext.save();
          smokeContext.globalAlpha = mist.alpha * mistProgress;
          smokeContext.translate(x, y);
          smokeContext.scale(1.15, 0.7);
          smokeContext.drawImage(puffSprite, -radius, -radius, radius * 2, radius * 2);
          smokeContext.restore();
        }

        // dusty glow where the base funnel meets the bottom of the page
        if (burst < 1) {
          const dustRadius = 60 + flareRadius * 1.1;
          smokeContext.save();
          smokeContext.globalAlpha = 0.55 * flareAmount * (1 - burst);
          smokeContext.translate(centerX, height);
          smokeContext.scale(1.6, 0.55);
          smokeContext.drawImage(puffSprite, -dustRadius, -dustRadius, dustRadius * 2, dustRadius * 2);
          smokeContext.restore();
        }

        // -------------------------------------------------------------
        // 2. SOFT BODY GLOW — puffs along the spine plus one at the top,
        //    so the tornado has a smoky core under the particles.
        //    Fades out as the burst takes over.
        // -------------------------------------------------------------
        if (burst < 0.6) {
          const glowFade = 1 - burst / 0.6;

          for (let i = 0; i < 24; i++) {
            const u = Math.pow(i / 23, 1.4) * spineExtent;
            const glowRadius = spineRadius(u) * 1.2 + 16;
            const baseBoost = u < flareHeight ? 1 + 0.8 * (1 - u / flareHeight) : 1;
            const x = centerX + Math.sin(elapsed * 2.1 + u * 3.2) * 26 * u * swayGrow;
            const y = (baseY - u * spineHeight + riseOffset) * 1.3;

            smokeContext.save();
            smokeContext.globalAlpha = 0.22 * (1 + 0.5 * streamReach) * intro * glowFade * baseBoost;
            smokeContext.translate(x, y);
            smokeContext.scale(1, 1.25);
            smokeContext.drawImage(puffSprite, -glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);
            smokeContext.restore();
          }

          const capGlowRadius = capRadius * 0.95 + 1;
          smokeContext.save();
          smokeContext.globalAlpha = 0.38 * capAmount * glowFade;
          smokeContext.translate(centerX + Math.sin(elapsed * 2.1 + 3.2) * 26 * swayGrow, topY + capHeight * 0.5);
          smokeContext.scale(1.4, 0.8);
          smokeContext.drawImage(puffSprite, -capGlowRadius, -capGlowRadius, capGlowRadius * 2, capGlowRadius * 2);
          smokeContext.restore();
        }

        // -------------------------------------------------------------
        // 3. UPDATE TORNADO PARTICLES
        // -------------------------------------------------------------
        for (const particle of particles) {
          // SPINE: flows up from below the page. Particles loop along the spine,
          // fading in near the base and out near the tip, so the column
          // looks continuous and its tip tapers instead of ending in a hard cut.
          const f = (particle.f0 + elapsed * particle.rise) % 1;
          const u = (particle.trail ? 0.7 + 0.3 * f : Math.pow(f, 1.2)) * spineExtent;
          const radius = spineRadius(u) * particle.radiusJitter;

          // faster swirl near the base, slower higher up
          const angle = particle.phase + spinTime * particle.spin * (3 + (1 - u) * 6);

          const turbulence = Math.sin(elapsed * 1.3 + particle.phase * 2.1 + u * 6) * (4 + 10 * expand);

          let x = centerX + Math.sin(elapsed * 2.1 + u * 3.2) * 26 * u * swayGrow + Math.cos(angle) * radius + turbulence;
          let y = baseY - u * spineHeight + riseOffset + Math.sin(angle) * radius * 0.22;

          const sinA = Math.sin(angle);

          // particles in the narrow part are smaller than the ones in the wide body
          const sizeScale = 0.45 + 0.55 * smooth(clamp01(radius / (fullRadius * 0.6)));

          // BURST progress for THIS particle: the middle goes first, the edges
          // follow, so the burst reads as a shockwave leaving the tornado.
          const local = clamp01((burstRaw - particle.burstDelay) / (1 - 0.4));
          const e = easeOut(local);

          // fade-out at the ends of the spine goes away as the particle bursts,
          // so every particle is visible and helps cover the screen
          const rawEdge = smooth(clamp01(f / 0.1)) * smooth(clamp01((1 - f) / 0.12));
          const edgeFade = rawEdge + (1 - rawEdge) * e;

          let size = particle.size * sizeScale * (0.92 + 0.16 * sinA);
          let alpha = intro * edgeFade * particle.opacity * (0.58 + 0.05 * sinA);

          if (e > 0) {
            // fly from the tornado to this particle's own spot on the screen,
            // along a curved (spiral) path
            // HORIZONTAL burst: x travels all the way to the target, y barely
            // moves (the tornado column already spans the full height), plus a
            // small vertical wave so it does not look ruler-straight.
            const targetX = particle.tx * width;
            const targetY = particle.ty * height;
            const dx = targetX - x;
            const dy = targetY - y;

            x += dx * e;
            y += dy * e * 0.2 + Math.sin(e * Math.PI) * 16 * particle.swirlDir;

            size = size * (1 - e) + particle.burstSize * e;
            alpha = alpha * (1 - e) + particle.coverAlpha * e;
          }

          particle.x = x;
          particle.y = y;
          particle.drawSize = size;
          particle.drawAlpha = Math.min(alpha, 0.9);
          particle.depth = e > 0.5 ? Math.sin(particle.phase) : sinA;

          // streaks are stretched along the direction of the spin so the
          // smoke looks like wind-blown bands; they relax into round puffs on burst
          if (particle.streak) {
            const streakRot = Math.atan2(Math.cos(angle) * 0.22, -Math.sin(angle));
            particle.rotation = streakRot * (1 - e);
            particle.scaleX = 1.2 + e * 0.6;
            particle.scaleY = 0.75 + e * 0.05;
          } else {
            particle.rotation = (particle.phase + angle * 0.15) * (1 - e);
            particle.scaleX = 1 + e * 0.6;
            particle.scaleY = (0.85 + Math.sin(particle.phase) * 0.1) * (1 - e) + 0.8 * e;
          }
        }

        // -------------------------------------------------------------
        // 4. DRAW — back half of the spin first, then the front half,
        //    so the particles read as orbiting around the funnel
        // -------------------------------------------------------------
        for (let pass = 0; pass < 2; pass++) {
          for (const particle of particles) {
            const isBack = particle.depth < 0;
            if (pass === 0 && !isBack) continue;
            if (pass === 1 && isBack) continue;
            if (particle.drawAlpha <= 0.002) continue;

            smokeContext.save();
            smokeContext.globalAlpha = particle.drawAlpha;
            smokeContext.translate(particle.x, particle.y);
            smokeContext.rotate(particle.rotation);
            smokeContext.scale(particle.scaleX, particle.scaleY);
            smokeContext.drawImage(
              spriteList[particle.sprite],
              -particle.drawSize,
              -particle.drawSize,
              particle.drawSize * 2,
              particle.drawSize * 2,
            );
            smokeContext.restore();
          }
        }

        // -------------------------------------------------------------
        // 5. FINAL COVER — only starts once the burst is done. The burst
        //    particles already hide the page; this just guarantees it is
        //    100% opaque before the smoke fades, with no visible pop.
        // -------------------------------------------------------------
        const coverProgress = clamp01((burstP - BURST_SHARE) / (1 - BURST_SHARE));
        if (coverProgress > 0) {
          smokeContext.fillStyle = "rgba(142, 105, 80, " + coverProgress + ")";
          smokeContext.fillRect(0, 0, width, height);
        }
      };
      frame = requestAnimationFrame(draw);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        resumeSmoke: () => {
          fadingRef.current = true;
          const canvas = canvasRef.current;
          if (!canvas) {
            onCompleteRef.current?.();
            return;
          }
          gsap.to(canvas, {
            opacity: 0,
            duration: 1.1,
            ease: "power2.out",
            onComplete: () => {
              smokeVisibleRef.current = false;
              onCompleteRef.current?.();
            },
          });
        },
      }),
      [],
    );

    // =========================================
    // MAIN STRING ANIMATION
    // =========================================
    useEffect(() => {
      const root = rootRef.current;
      const layer = layerRef.current;
      if (!root || !layer) return;

      const cloudEls = Array.from(
        document.querySelectorAll<HTMLElement>(CLOUD_SELECTOR),
      );
      const fadeEls = Array.from(
        document.querySelectorAll<HTMLElement>(FADE_SELECTOR),
      );
      const castleEl = document.querySelector<HTMLElement>(CASTLE_SELECTOR);
      const moonEl = document.querySelector<HTMLElement>(MOON_SELECTOR);

      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }

      gsap.killTweensOf(cloudEls);

      const animationContext = gsap.context(() => {
        const rigs: CloudRig[] = cloudEls.map((el) => {
          const rect = el.getBoundingClientRect();
          const group = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g",
          );
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );

          path.setAttribute("class", styles.path);
          group.appendChild(path);
          layer.appendChild(group);

          return {
            el,
            group,
            path,
            anchorX: rect.left + rect.width / 2,
            hookY: rect.top + rect.height / 2,
          };
        });

        const TOP_Y = 0;
        const START_LEN = 30;
        const START_SAG = 120;
        const STRAIGHT_T = 0.55;
        const HOOK_T = 0.85;

        const buildPath = (r: CloudRig, endY: number, sag: number) => {
          const control1Y = TOP_Y + (endY - TOP_Y) * STRAIGHT_T;
          const control2Y = TOP_Y + (endY - TOP_Y) * HOOK_T;
          return `M ${r.anchorX} ${TOP_Y} C ${r.anchorX} ${control1Y} ${r.anchorX + sag
            } ${control2Y} ${r.anchorX} ${endY}`;
        };

        rigs.forEach((r) => {
          r.path.setAttribute(
            "d",
            buildPath(r, START_LEN, START_SAG),
          );
          gsap.set(r.path, { opacity: 0 });
        });

        const tl = gsap.timeline();

        if (rigs.length > 0) {
          rigs.forEach((r, i) => {
            const state = { fall: 0 };

            tl.to(
              state,
              {
                fall: 1,
                duration: 0.35,
                ease: "power1.in",
                onUpdate: () => {
                  const p = state.fall;
                  const endY = gsap.utils.interpolate(START_LEN, r.hookY, p);
                  const sag = gsap.utils.interpolate(
                    START_SAG,
                    0,
                    Math.pow(p, 0.7),
                  );

                  r.path.setAttribute("d", buildPath(r, endY, sag));
                  const fadeInP = Math.min(p / 0.25, 1);
                  gsap.set(r.path, { opacity: fadeInP });

                  const currentLen = r.path.getTotalLength();
                  const drawP = Math.min(p / 0.6, 1);
                  r.path.style.strokeDasharray = `${currentLen}`;
                  r.path.style.strokeDashoffset = `${currentLen * (1 - drawP)}`;
                },
              },
              i * 0.045,
            )
              .to(
                {},
                {
                  duration: 0.05,
                  onUpdate: function () {
                    const overshoot =
                      -Math.sin(this.progress() * Math.PI) * 10;
                    r.path.setAttribute(
                      "d",
                      buildPath(r, r.hookY, overshoot),
                    );
                  },
                },
                ">-0.03",
              )
              .to({}, { duration: STRING_TAUT_DELAY })
              .to(
                {},
                {
                  duration: 0.05,
                  ease: "power3.out",
                  onUpdate: function () {
                    const sag = gsap.utils.interpolate(5, 0, this.progress());
                    r.path.setAttribute("d", buildPath(r, r.hookY, sag));
                    gsap.set(r.path, {
                      strokeDashoffset: 0,
                      opacity: 1,
                    });
                  },
                },
              );
          });

          const liftDistance = window.innerHeight * 1.3;

          tl.to(
            rigs.map((r) => r.group),
            {
              y: -liftDistance,
              duration: 0.35,
              ease: "power2.in",
              stagger: 0.03,
            },
            "+=0.05",
          ).to(
            rigs.map((r) => r.el),
            {
              y: -liftDistance,
              opacity: 0,
              duration: 0.35,
              ease: "power2.in",
              stagger: 0.03,
            },
            "<",
          );
        }

        const cloudsDuration = tl.duration() || 0.5;
        const SINK_DISTANCE = window.innerHeight;
        const FOREGROUND_DURATION = cloudsDuration * 1.0;
        const MOON_DURATION = cloudsDuration * 1.2;

        const applyDrown = (
          el: HTMLElement,
          duration: number,
          sinkDistance = SINK_DISTANCE,
        ) => {
          gsap.set(el, { willChange: "transform" });

          const state = { p: 0 };

          tl.to(
            state,
            {
              p: 1,
              duration,
              ease: "power2.in",
              onUpdate: () => {
                // Only y is touched. The element's horizontal position
                // is controlled entirely by its CSS.
                gsap.set(el, { y: sinkDistance * state.p });
              },
            },
            0,
          );
        };

        if (castleEl) {
          applyDrown(castleEl, FOREGROUND_DURATION);
        }

        if (moonEl) {
          applyDrown(moonEl, MOON_DURATION);
        }

        if (fadeEls.length > 0) {
          tl.to(
            fadeEls,
            {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            0,
          );
        }

        const startSmoke = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            onCompleteRef.current?.();
            return;
          }

          smokeVisibleRef.current = true;
          smokeStartRef.current = performance.now();
          burstProgressRef.current.value = 0;
          burstStartedRef.current = false;
          fadingRef.current = false;
          gsap.set(canvas, { opacity: 1, visibility: "visible" });
        };

        tl.call(
          startSmoke,
          [],
          (tl.duration() || 0.5) * SMOKE_START_PERCENT,
        );
      });

      // Capture the nodes for this effect instance. Refs can point to a
      // different node by the time React runs the cleanup.
      const transitionCanvas = canvasRef.current;
      const transitionLayer = layer;

      return () => {
        animationContext.revert();

        // Release GPU promotion after the transition so will-change
        // does not remain permanently active on animated elements.
        if (castleEl) gsap.set(castleEl, { clearProps: "willChange" });
        if (moonEl) gsap.set(moonEl, { clearProps: "willChange" });

        if (transitionCanvas) {
          gsap.killTweensOf(transitionCanvas);
          transitionCanvas.style.opacity = "0";
          transitionCanvas.style.visibility = "hidden";
          smokeVisibleRef.current = false;
          gsap.killTweensOf(burstProgressRef.current);
          burstProgressRef.current.value = 0;
          burstStartedRef.current = false;
          fadingRef.current = false;
        }

        while (transitionLayer.firstChild) {
          transitionLayer.removeChild(transitionLayer.firstChild);
        }
      };
    }, []);

    return (
      <div ref={rootRef} className={styles.root}>
        {/* STRING SVG */}
        <div className={styles.stringLayerWrap}>
          <svg
            ref={layerRef}
            className={styles.stringLayer}
            width="100%"
            height="100%"
          />
        </div>

        <canvas ref={canvasRef} aria-hidden="true" style={{position:"fixed",inset:0,width:"100vw",height:"100vh",zIndex:10000,pointerEvents:"none",opacity:0,visibility:"hidden"}} />

        {/* LOADING BAR — bottom right, only visible while the tornado waits for assets / the new page */}
        <div
          ref={barRef}
          role="progressbar"
          aria-label="Loading"
          style={{
            position: "fixed",
            right: 28,
            bottom: 28,
            width: 160,
            height: 4,
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.22)",
            zIndex: 10001,
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <div
            ref={barFillRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 4,
              background: "rgba(244, 226, 196, 0.95)",
              transformOrigin: "left center",
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>
    );
  },
);

export default PageTransition;