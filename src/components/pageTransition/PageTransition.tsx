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
};

const STRING_TAUT_DELAY = 0.05;
const SMOKE_START_PERCENT = 0.48;

// Whole smoke sequence, in seconds. Phases:
//   TORNADO_SECONDS : the tornado forms (see the formation timeline below)
//   BURST_SECONDS   : the tornado explodes outwards into a cloud
//   COVER_SECONDS   : cloud settles into a fully opaque smoke screen
const TORNADO_SECONDS = 3.5;   // was 2.8, gives the slower climb room
const BURST_SECONDS = 1.2;
const COVER_SECONDS = 0.5;
const SMOKE_DURATION = TORNADO_SECONDS + BURST_SECONDS + COVER_SECONDS;
const TORNADO_END = TORNADO_SECONDS / SMOKE_DURATION;                    // progress (0 -> 1) where the burst starts
const BURST_END = (TORNADO_SECONDS + BURST_SECONDS) / SMOKE_DURATION;    // progress where the burst ends

// Formation timeline (seconds). Overlaps are intentional so phases blend together.
const FLARE_SECONDS = 0.6;     // inverted funnel emerges from below the page
const STREAM_START = 0.5;      // the column starts climbing out of the funnel
const STREAM_SECONDS = 2.0;    // ...and takes this long to reach the top (was 1.3)
const HEAD_START = 0.1;        // the column's width starts building
const TOP_FLARE_FROM = 0.55;   // column progress at which the top funnel starts to flare
const EXPAND_START = 2.0;      // the whole thing expands into the full tornado (was 1.6)
const EXPAND_SECONDS = 1.0;
const SWELL_START = 2.2;       // soft cloud begins building before the burst (was 2.2)

// Spin builds up with this time constant instead of starting at full speed.
const SPIN_UP_SECONDS = 0.7;

// Tail width multiplier (1 = the original tail width, 1.4 = 40% wider).
const TAIL_WIDTH = 1.2;

const PageTransition = forwardRef<PageTransitionHandle, PageTransitionProps>(
  function PageTransitionComponent({ onComplete }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const layerRef = useRef<SVGSVGElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const smokeProgressRef = useRef({ value: 0 });
    const smokeVisibleRef = useRef(false);

    const onCompleteRef = useRef(onComplete);

    // Keep the latest callback without mutating a ref during render.
    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);

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
      // SPRITES — same recipe as the Events page smoke:
      //   1. a feathered radial body (soft falloff, then blurred)
      //   2. a few BIG, softly blurred light/dark specks for a little texture
      //   3. a soft clip so the specks never create a hard edge
      // The result is a smooth oval with gentle texture, not a grainy dot.
      // ---------------------------------------------------------------
      const makeSmokeSprite = (blur: number) => {
        const spriteSize = 256;
        const sprite = document.createElement("canvas");
        sprite.width = spriteSize;
        sprite.height = spriteSize;
        const sctx = sprite.getContext("2d");
        if (!sctx) return sprite;

        const r = spriteSize / 2;

        // 1. feathered body
        sctx.filter = "blur(" + blur + "px)";
        const gradient = sctx.createRadialGradient(r, r, 0, r, r, r * 0.78);
        gradient.addColorStop(0, "rgba(200, 208, 228, 1)");
        gradient.addColorStop(0.5, "rgba(160, 172, 200, 0.62)");
        gradient.addColorStop(0.8, "rgba(128, 141, 172, 0.22)");
        gradient.addColorStop(1, "rgba(111, 123, 155, 0)");
        sctx.fillStyle = gradient;
        sctx.beginPath();
        sctx.arc(r, r, r * 0.78, 0, Math.PI * 2);
        sctx.fill();

        // 2. texture: uneven light/dark specks, lighter blur than the body
        sctx.filter = "blur(" + blur * 0.4 + "px)";
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * r * 0.75;
          const speckRadius = 6 + Math.random() * 22;
          sctx.globalAlpha = 0.08 + Math.random() * 0.16;
          sctx.fillStyle = Math.random() > 0.45
            ? "rgba(228, 234, 248, 1)"
            : "rgba(82, 94, 126, 1)";
          sctx.beginPath();
          sctx.arc(r + Math.cos(angle) * distance, r + Math.sin(angle) * distance, speckRadius, 0, Math.PI * 2);
          sctx.fill();
        }
        sctx.globalAlpha = 1;

        // 3. clip the texture back to the soft circle
        sctx.globalCompositeOperation = "destination-in";
        sctx.filter = "blur(" + blur + "px)";
        const clipGradient = sctx.createRadialGradient(r, r, 0, r, r, r * 0.78);
        clipGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        clipGradient.addColorStop(0.8, "rgba(255, 255, 255, 1)");
        clipGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        sctx.fillStyle = clipGradient;
        sctx.beginPath();
        sctx.arc(r, r, r * 0.78, 0, Math.PI * 2);
        sctx.fill();
        sctx.globalCompositeOperation = "source-over";
        return sprite;
      };

      const particleSprite = makeSmokeSprite(6);   // lightest blur, still smooth
      const puffSprite = makeSmokeSprite(15);      // soft body / mist / cover
      const midSprite = makeSmokeSprite(10);       // in-between texture for the tornado body

      // ---------------------------------------------------------------
      // TORNADO PARTICLES
      //
      //   spine particles — flow up a spine that runs from BELOW the page to the top.
      //                     The spine is a cone: a wide inverted funnel at the base,
      //                     narrow just above it, widening as the column climbs, and
      //                     flaring open again at the top (mirroring the base).
      //                     A share of them ("trail") stays clustered near the
      //                     rising tip so the column stays dense as it extends.
      //   cap particles   — a funnel-shaped mass at the top. Its formation is driven
      //                     by how far the column has climbed (not a separate clock),
      //                     so it grows out of the arriving column.
      //
      // sprite: 0 / 1 / 2 = three softness levels (all use the feathered,
      // lightly textured Events-style sprite)
      // ---------------------------------------------------------------
      type TornadoParticle = {
        isCap: boolean;
        trail: boolean;        // spine only: stays clustered near the rising tip to keep the trail dense
        streak: boolean;
        sprite: 0 | 1 | 2;
        f0: number;            // spine only: starting place along the spine (0 = base, 1 = column tip)
        rise: number;          // spine only: how fast it flows up the spine
        radiusJitter: number;
        yOffset: number;       // cap only: place inside the cap (-0.5 .. 0.5, +0.5 = top)
        phase: number;
        spin: number;
        size: number;
        opacity: number;
        burstAngle: number;
        burstSpeed: number;
        appear: number;        // cap only: how far into the cap formation this particle fades in (0 .. 0.7)
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

      const makeParticle = (group: "spine" | "cap"): TornadoParticle => {
        const isBig = group !== "spine";
        // Like the Events smoke, every particle is a soft oval drawn at low opacity;
        // the look comes from lots of them overlapping, not from small dots.
        // The spine only uses the two softest sprites, so the early formation
        // reads as smooth smoke instead of small grainy dots.
        const roll = Math.random();
        let sprite: 0 | 1 | 2 = roll < 0.3 ? 0 : roll < 0.7 ? 1 : 2;
        if (group === "spine") sprite = roll < 0.5 ? 1 : 2;

        let size = isBig ? 60 + Math.random() * 45 : 50 + Math.random() * 30;
        if (sprite === 1) size = isBig ? 80 + Math.random() * 55 : 60 + Math.random() * 30;
        if (sprite === 2) size = isBig ? 100 + Math.random() * 60 : 80 + Math.random() * 40;

        return {
          isCap: group === "cap",
          trail: group === "spine" && Math.random() < 0.4,
          streak: Math.random() < 0.3,
          sprite,
          f0: Math.random(),
          rise: 0.25 + Math.random() * 0.3,
          radiusJitter: isBig ? 0.3 + Math.random() * 0.75 : 0.55 + Math.random() * 0.75,
          yOffset: Math.random() - 0.5,
          phase: Math.random() * Math.PI * 2,
          spin: 0.85 + Math.random() * 0.3,
          size: size * 0.8,
          opacity: 0.55 + Math.random() * 0.7,
          burstAngle: Math.random() * Math.PI * 2,
          burstSpeed: 0.55 + Math.random() * 0.75,
          appear: Math.random() * 0.7,
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

      const particles: TornadoParticle[] = [
        ...Array.from({ length: 180 }, () => makeParticle("cap")),
        ...Array.from({ length: 760 }, () => makeParticle("spine")),   // took over the old head particles' share
      ];
      const spriteList = [particleSprite, midSprite, puffSprite];

      // ---------------------------------------------------------------
      // SIDE MIST — big soft puffs that drift in from the left and right
      // edges while the tornado forms
      // ---------------------------------------------------------------
      const mistPuffs = Array.from({ length: 16 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        return {
          side,
          startX: side < 0 ? -0.12 : 1.12,          // fraction of width (off-screen)
          endX: side < 0 ? 0.04 + Math.random() * 0.26 : 0.96 - Math.random() * 0.26,
          y: 0.18 + Math.random() * 0.78,           // fraction of height
          radius: 0.16 + Math.random() * 0.14,      // fraction of max(width, height)
          phase: Math.random() * Math.PI * 2,
          alpha: 0.04 + Math.random() * 0.04,       // very subtle
        };
      });

      // Full-screen lobes. They start swelling BEFORE the burst (driven by
      // `swell` below) so the burst is a continuation, not a sudden pop.
      const screenPuffs = Array.from({ length: 20 }, (_, index) => ({
        x: ((index % 5) / 4) * 1.06 - 0.03 + (Math.random() - 0.5) * 0.08,
        y: (Math.floor(index / 5) / 3) * 1.06 - 0.03 + (Math.random() - 0.5) * 0.08,
        scale: 0.8 + Math.random() * 0.45,
        delay: Math.random() * 0.25,
      }));

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.25);
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

      const draw = (now: number) => {
        frame = requestAnimationFrame(draw);
        if (now - lastDrawTime < frameInterval) return;
        lastDrawTime = now;
        if (!smokeVisibleRef.current) {
          smokeContext.clearRect(0, 0, width, height);
          return;
        }

        const progress = smokeProgressRef.current.value;
        const elapsed = progress * SMOKE_DURATION;

        // -------------------------------------------------------------
        // FORMATION TIMELINE (each value 0 -> 1, eased so nothing snaps)
        // -------------------------------------------------------------
        const intro = smooth(clamp01(elapsed / 0.3));                                   // overall fade-in
        const flareAmount = smooth(clamp01(elapsed / FLARE_SECONDS));                   // base funnel emerges from below the page
        const streamRaw = clamp01((elapsed - STREAM_START) / STREAM_SECONDS);
        // part linear, part eased: a steadier climb than pure smoothstep
        const streamReach = 0.55 * streamRaw + 0.45 * smooth(streamRaw);                // column climbs the page
        // the top funnel forms as the column arrives, not on its own clock
        const capAmount = smooth(clamp01((streamReach - TOP_FLARE_FROM) / (1 - TOP_FLARE_FROM)));
        const expand = smooth(clamp01((elapsed - EXPAND_START) / EXPAND_SECONDS));      // whole thing expands to full tornado

        // swell starts well before the burst and builds gently into it
        const burstEndSeconds = BURST_END * SMOKE_DURATION;
        const swell = smooth(clamp01((elapsed - SWELL_START) / (burstEndSeconds - SWELL_START)));
        const burstRaw = clamp01((progress - TORNADO_END) / (BURST_END - TORNADO_END));
        const burst = smooth(burstRaw);

        // -------------------------------------------------------------
        // PHYSICS
        // Spin-up: angular speed builds up with an exponential ease instead of
        // starting at full speed, so the swirl gathers momentum like real smoke.
        // -------------------------------------------------------------
        const spinTime = elapsed - SPIN_UP_SECONDS * (1 - Math.exp(-elapsed / SPIN_UP_SECONDS));
        // The sway of the column also builds up gradually
        const swayGrow = smooth(clamp01(elapsed / 1.0));

        // -------------------------------------------------------------
        // GEOMETRY (recomputed each frame so resize just works)
        // u runs along the spine: 0 = base (below the page), 1 = top
        // -------------------------------------------------------------
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const baseY = height * 1.1;           // base of the tornado sits BELOW the page
        const topY = height * 0.06;
        const spineHeight = baseY - topY;

        const baseRadius = 9;
        const streamRadius = 14;                               // width of the column at its base
        const fullRadius = Math.min(width * 0.28, 300);        // widest part of the finished tornado
        const flareRadius = Math.min(width * 0.3, 340) * flareAmount;
        const flareHeight = 0.3;                               // base funnel thins into the column over this part of the spine

        const capHeight = spineHeight * (0.18 + 0.12 * expand);  // was 0.1 + 0.1 * expand
        const capRadius = fullRadius * (0.5 + 0.5 * expand) * (0.25 + 0.75 * capAmount);   // grows from a small funnel, never jumps
        const topFlareRadius = Math.min(width * 0.3, 340) * capAmount;                     // mirrors flareRadius at the top

        // the whole spine rises into place from below the page as the base forms
        const riseOffset = (1 - flareAmount) * height * 0.2;

        // THE RISING TIP: headU is how far up the spine the column has climbed, and
        // headWidth is how wide the column is at that tip. No particles are drawn for
        // the tip itself; spineRadius uses them to size the cone.
        const headStartU = flareHeight * 0.6;
        const headTopU = 1.0;                                  // was 0.95, so the column reaches the top
        const headU = headStartU + (headTopU - headStartU) * streamReach;
        const headAmount = smooth(clamp01((elapsed - HEAD_START) / 0.5));
        const headWidth = Math.min(width * 0.2, 230) * (0.6 + 0.4 * headAmount) * (1 + 0.25 * streamReach);

        // how far up the spine the column reaches
        const spineExtent = headU;

        // Width of the spine at position u.
        // FORMATION: a cone whose top always matches the width of the rising tip, so the
        // column widens AS it climbs (no thin stream that expands later), with a
        // flare at the top that mirrors the one at the base.
        // FULL: classic tornado shape, blended in by `expand` for the final settle.
        const spineRadius = (u: number) => {
          const flareK = u < flareHeight ? Math.pow(1 - u / flareHeight, 1.6) : 0;   // trumpet-like flare at the base
          const topFlareK = u > 1 - flareHeight
            ? Math.pow((u - (1 - flareHeight)) / flareHeight, 1.6)
            : 0;                                                                     // matching flare at the top

          // position along the part of the spine that exists so far (0 = base, 1 = tip)
          const tu = headU > 0.001 ? clamp01(u / headU) : 0;

          // cone: thin at the base, as wide as the tip right under it
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
        const mistProgress = easeOut(clamp01(progress / (TORNADO_END * 1.1)));
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
        // 2. SOFT BODY GLOW — puffs along the spine plus one at the top cap,
        //    so the tornado has a smoky core under the particles
        // -------------------------------------------------------------
        if (burst < 0.6) {
          const glowFade = 1 - burst / 0.6;

          for (let i = 0; i < 24; i++) {                          // was 16
            const u = Math.pow(i / 23, 1.4) * spineExtent;        // was i / 15
            const glowRadius = spineRadius(u) * 1.2 + 16;
            const baseBoost = u < flareHeight ? 1 + 0.8 * (1 - u / flareHeight) : 1;
            const x = centerX + Math.sin(elapsed * 2.1 + u * 3.2) * 26 * u * swayGrow;
            const y = baseY - u * spineHeight + riseOffset;

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
          let x = 0;
          let y = 0;
          let angle = 0;
          let alpha = 0;
          let sizeScale = 1;

          if (particle.isCap) {
            // CAP: funnel-shaped mass at the top, wide on top and narrowing downward
            angle = particle.phase + spinTime * particle.spin * 3.2;
            const yFrac = particle.yOffset + 0.5;               // 1 = very top of the cap
            const radius = capRadius * particle.radiusJitter * (0.3 + 0.7 * yFrac);

            x = centerX + Math.sin(elapsed * 2.1 + 3.2) * 26 * swayGrow + Math.cos(angle) * radius;
            y = topY + capHeight * (1 - yFrac) + Math.sin(angle) * radius * 0.22;
            // each cap particle fades in at its own moment, so the funnel's density
            // builds up gradually instead of appearing all at once
            alpha = smooth(clamp01((capAmount - particle.appear) / 0.3));
            sizeScale = 0.35 + 0.65 * capAmount;
          } else {
            // SPINE: flows up from below the page. Particles loop along the spine,
            // fading in near the base and out near the tip, so the column
            // looks continuous and its tip tapers instead of ending in a hard cut.
            const f = (particle.f0 + elapsed * particle.rise) % 1;
            // trail particles stay in the top 30% of the column, so density holds near the tip
            const u = (particle.trail ? 0.7 + 0.3 * f : Math.pow(f, 1.2)) * spineExtent;
            const radius = spineRadius(u) * particle.radiusJitter;

            // faster swirl near the base, slower higher up
            angle = particle.phase + spinTime * particle.spin * (3 + (1 - u) * 6);

            // a little turbulence so the column is never perfectly rigid
            const turbulence = Math.sin(elapsed * 1.3 + particle.phase * 2.1 + u * 6) * (4 + 10 * expand);

            x = centerX + Math.sin(elapsed * 2.1 + u * 3.2) * 26 * u * swayGrow + Math.cos(angle) * radius + turbulence;
            y = baseY - u * spineHeight + riseOffset + Math.sin(angle) * radius * 0.22;

            const edgeFade = smooth(clamp01(f / 0.1)) * smooth(clamp01((1 - f) / 0.12));
            alpha = intro * edgeFade;

            // particles in the narrow part are smaller than the ones in the wide body
            sizeScale = 0.45 + 0.55 * smooth(clamp01(radius / (fullRadius * 0.6)));
          }

          const sinA = Math.sin(angle);

          // front-of-funnel particles are bigger/brighter, back ones smaller/dimmer.
          // swell grows size/opacity before the burst so there is no sudden jump.
          let size = particle.size * sizeScale * (0.85 + 0.3 * sinA) * (1 + swell * 0.5);
          alpha *= particle.opacity * (0.24 + 0.1 * sinA) * (1 + swell * 0.35);

          // -----------------------------------------------------------
          // BURST: every particle flies outwards from where it was
          // -----------------------------------------------------------
          if (burst > 0) {
            const push = Math.hypot(width, height) * 0.95 * particle.burstSpeed * burst;
            const swirl = particle.burstAngle + burst * 0.9;
            x += Math.cos(swirl) * push;
            y += Math.sin(swirl) * push * 0.8;
            size *= 1 + burst * 1.7;
          }

          particle.x = x;
          particle.y = y;
          particle.drawSize = size;
          particle.drawAlpha = Math.min(alpha, 0.9);
          particle.depth = sinA;

          // streaks are stretched along the direction of the spin so the
          // smoke looks like wind-blown bands; they relax into round puffs on burst
          if (particle.streak) {
            particle.rotation = Math.atan2(Math.cos(angle) * 0.22, -Math.sin(angle));
            particle.scaleX = 1.45 - burst * 0.45;
            particle.scaleY = 0.55 + burst * 0.25;
          } else {
            particle.rotation = particle.phase + angle * 0.15;
            particle.scaleX = 1;
            particle.scaleY = 0.62 + Math.sin(particle.phase) * 0.18;
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
        // 5. SWELLING BODY — a broad cloud growing out from the funnel.
        //    Driven by `swell`, which begins before the burst, and squared
        //    so it fades in gently instead of appearing all at once.
        // -------------------------------------------------------------
        if (swell > 0) {
          const bodyAmount = swell * swell;
          const bodyRadius = Math.hypot(width, height) * (0.1 + 1.1 * swell);
          const body = smokeContext.createRadialGradient(
            centerX, centerY, bodyRadius * 0.06,
            centerX, centerY, bodyRadius,
          );
          body.addColorStop(0, "rgba(157, 166, 191, " + (0.94 * bodyAmount) + ")");
          body.addColorStop(0.52, "rgba(137, 148, 176, " + (0.84 * bodyAmount) + ")");
          body.addColorStop(0.82, "rgba(116, 129, 160, " + (0.64 * bodyAmount) + ")");
          body.addColorStop(1, "rgba(103, 116, 148, 0)");
          smokeContext.fillStyle = body;
          smokeContext.fillRect(0, 0, width, height);

          // overlapping lobes expanding from the centre keep the texture billowy
          screenPuffs.forEach((puff) => {
            const puffEase = smooth(clamp01((swell - puff.delay) / 0.75));
            const x = centerX + (puff.x * width - centerX) * puffEase;
            const y = centerY + (puff.y * height - centerY) * puffEase;
            const radius = Math.max(width, height) * 0.24 * puff.scale * (0.35 + puffEase * 0.65);

            smokeContext.save();
            smokeContext.globalAlpha = 0.88 * puffEase;
            smokeContext.translate(x, y);
            smokeContext.scale(1, 0.82);
            smokeContext.drawImage(puffSprite, -radius, -radius, radius * 2, radius * 2);
            smokeContext.restore();
          });
        }

        // -------------------------------------------------------------
        // 6. FINAL COVER — fully opaque before navigation (same idea as before)
        // -------------------------------------------------------------
        const coverProgress = clamp01((progress - (BURST_END - 0.06)) / (1 - (BURST_END - 0.06)));
        if (coverProgress > 0) {
          smokeContext.fillStyle = "rgba(120, 131, 157, " + coverProgress + ")";
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

        const applyDrownWobble = (
          el: HTMLElement,
          duration: number,
          sinkDistance = SINK_DISTANCE,
          basePercent?: { xPercent?: number; yPercent?: number },
        ) => {
          gsap.set(el, {
            willChange: "transform",
            ...(basePercent ?? {}),
          });

          const state = { p: 0 };

          tl.to(
            state,
            {
              p: 1,
              duration,
              ease: "power2.in",

              onUpdate: () => {
                const p = state.p;

                const y = sinkDistance * p;

                /*
                 * IMPORTANT:
                 * Do NOT touch x.
                 * Do NOT touch rotation.
                 *
                 * The castle's horizontal position is controlled
                 * entirely by its CSS.
                 */
                gsap.set(el, {
                  y,
                  ...(basePercent ?? {}),
                });
              },
            },
            0,
          );
        };

        const applyDrown = (
          el: HTMLElement,
          duration: number,
          sinkDistance = SINK_DISTANCE,
          basePercent?: { xPercent?: number; yPercent?: number },
        ) => {
          gsap.set(el, {
            willChange: "transform",
            ...(basePercent ?? {}),
          });

          const state = { p: 0 };

          tl.to(
            state,
            {
              p: 1,
              duration,
              ease: "power2.in",

              onUpdate: () => {
                const p = state.p;
                const y = sinkDistance * p;

                gsap.set(el, {
                  y,
                  ...(basePercent ?? {}),
                });
              },
            },
            0,
          );
        };

        if (castleEl) {
          applyDrownWobble(castleEl, FOREGROUND_DURATION, SINK_DISTANCE, {
          });
        }

        if (moonEl) {
          applyDrown(moonEl, MOON_DURATION, SINK_DISTANCE, {});
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
          smokeProgressRef.current.value = 0;
          gsap.set(canvas, { opacity: 1, visibility: "visible" });
          gsap.to(smokeProgressRef.current, {
            value: 1,
            duration: SMOKE_DURATION,
            ease: "none", // was "power2.inOut" — linear so the phase timings land on real seconds
            onComplete: () => onCompleteRef.current?.(),
          });
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
          smokeProgressRef.current.value = 0;
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
      </div>
    );
  },
);

export default PageTransition;