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
const SMOKE_DURATION = 2.8;

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

      // Pre-render a pair of soft sprites. Fine specks add the same grainy,
      // layered surface used by the Events page's smoke.
      const makeSmokeSprite = (blur: number) => {
        const sprite = document.createElement("canvas");
        sprite.width = 256;
        sprite.height = 256;
        const sctx = sprite.getContext("2d");
        if (!sctx) return sprite;

        const center = 128;
        sctx.filter = "blur(" + blur + "px)";
        const body = sctx.createRadialGradient(center, center, 0, center, center, 104);
        body.addColorStop(0, "rgba(213, 220, 237, 0.96)");
        body.addColorStop(0.48, "rgba(173, 184, 210, 0.68)");
        body.addColorStop(0.82, "rgba(132, 146, 177, 0.24)");
        body.addColorStop(1, "rgba(111, 123, 155, 0)");
        sctx.fillStyle = body;
        sctx.beginPath();
        sctx.arc(center, center, 104, 0, Math.PI * 2);
        sctx.fill();

        sctx.filter = "blur(" + Math.max(1, blur * 0.4) + "px)";
        for (let i = 0; i < 84; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 78;
          const radius = 2 + Math.random() * 7;
          sctx.globalAlpha = 0.08 + Math.random() * 0.15;
          sctx.fillStyle = Math.random() > 0.45
            ? "rgba(236, 240, 250, 1)"
            : "rgba(82, 94, 126, 1)";
          sctx.beginPath();
          sctx.arc(center + Math.cos(angle) * distance, center + Math.sin(angle) * distance, radius, 0, Math.PI * 2);
          sctx.fill();
        }
        sctx.filter = "none";
        for (let i = 0; i < 90; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 82;
          const radius = 0.4 + Math.random() * 1.2;
          sctx.globalAlpha = 0.03 + Math.random() * 0.06;
          sctx.fillStyle = Math.random() > 0.5
            ? "rgba(238, 241, 249, 1)"
            : "rgba(71, 83, 112, 1)";
          sctx.beginPath();
          sctx.arc(center + Math.cos(angle) * distance, center + Math.sin(angle) * distance, radius, 0, Math.PI * 2);
          sctx.fill();
        }
        sctx.globalAlpha = 1;
        sctx.globalCompositeOperation = "destination-in";
        sctx.filter = "blur(" + blur + "px)";
        const mask = sctx.createRadialGradient(center, center, 0, center, center, 104);
        mask.addColorStop(0, "rgba(255,255,255,1)");
        mask.addColorStop(0.82, "rgba(255,255,255,0.95)");
        mask.addColorStop(1, "rgba(255,255,255,0)");
        sctx.fillStyle = mask;
        sctx.beginPath();
        sctx.arc(center, center, 104, 0, Math.PI * 2);
        sctx.fill();
        sctx.globalCompositeOperation = "source-over";
        return sprite;
      };

      const particleSprite = makeSmokeSprite(4);
      const puffSprite = makeSmokeSprite(15);
      const originX = width * 0.5;
      const originY = height * 1.08;
      const cloudCenterX = width * 0.5;
      const cloudCenterY = height * 0.42;
      const spreadX = width * 0.82;
      const spreadY = height * 0.82;

      type SmokeParticle = {
        startX: number; startY: number; targetX: number; targetY: number;
        size: number; phase: number; speed: number; delay: number;
        opacity: number; drift: number; core: boolean; aspect: number;
      };
      const makeParticle = (core: boolean): SmokeParticle => {
        const angle = Math.random() * Math.PI * 2;
        const reach = core ? 0.12 + Math.random() * 0.54 : 0.36 + Math.random() * 0.72;
        const radiusX = Math.cos(angle) * spreadX * reach;
        const radiusY = Math.sin(angle) * spreadY * reach;
        const edgeClamp = Math.min(1, Math.sqrt((radiusX / spreadX) ** 2 + (radiusY / spreadY) ** 2) || 1);
        return {
          startX: originX + (Math.random() - 0.5) * 40,
          startY: originY + Math.random() * 24,
          targetX: cloudCenterX + radiusX / edgeClamp,
          targetY: cloudCenterY + radiusY / edgeClamp,
          size: core ? 42 + Math.random() * 42 : 20 + Math.random() * 28,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.9,
          delay: Math.random() * 0.3,
          opacity: 0.6 + Math.random() * 0.4,
          drift: 7 + Math.random() * 36,
          core,
          aspect: 0.62 + Math.random() * 0.32,
        };
      };
      const particles = [
        ...Array.from({ length: 170 }, () => makeParticle(true)),
        ...Array.from({ length: 360 }, () => makeParticle(false)),
      ];
      const puffs: [number, number, number][] = [
        [-0.72, 0.25, 0.88], [-0.48, 0.1, 0.82], [-0.25, 0.31, 1.0],
        [-0.05, 0.02, 0.9], [0.15, 0.2, 1.0], [0.34, -0.08, 0.95],
        [0.55, -0.24, 0.9], [0.77, -0.38, 0.82], [-0.38, -0.27, 0.8],
        [-0.13, -0.43, 0.9], [0.12, -0.57, 0.82], [0.39, -0.68, 0.78],
      ];
      const screenPuffs = Array.from({ length: 20 }, (_, index) => ({
        x: (index % 5) / 4 * 1.06 - 0.03 + (Math.random() - 0.5) * 0.08,
        y: Math.floor(index / 5) / 3 * 1.06 - 0.03 + (Math.random() - 0.5) * 0.08,
        scale: 0.8 + Math.random() * 0.45,
        delay: Math.random() * 0.2,
      }));
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.25);

      const draw = (now: number) => {
        frame = requestAnimationFrame(draw);
        if (now - lastDrawTime < frameInterval) return;
        lastDrawTime = now;
        if (!smokeVisibleRef.current) {
          smokeContext.clearRect(0, 0, width, height);
          return;
        }

        const progress = smokeProgressRef.current.value;
        const elapsed = progress * 3.2;
        const eased = easeOut(progress);
        smokeContext.clearRect(0, 0, width, height);

        // A broad translucent body grows out of the corner first, so the
        // rising wisps join into one continuous cloud instead of separate dots.
        const frontX = originX + (cloudCenterX - originX) * eased;
        const frontY = originY + (cloudCenterY - originY) * eased;
        const bodyRadius = Math.hypot(width, height) * (0.08 + 1.18 * eased);
        const body = smokeContext.createRadialGradient(frontX, frontY, bodyRadius * 0.06, frontX, frontY, bodyRadius);
        body.addColorStop(0, "rgba(157, 166, 191, " + (0.94 * eased) + ")");
        body.addColorStop(0.52, "rgba(137, 148, 176, " + (0.84 * eased) + ")");
        body.addColorStop(0.82, "rgba(116, 129, 160, " + (0.64 * eased) + ")");
        body.addColorStop(1, "rgba(103, 116, 148, 0)");
        smokeContext.fillStyle = body;
        smokeContext.fillRect(0, 0, width, height);

        // Finish with an opaque smoke layer before navigation. Its opacity
        // ramps up only after the cloud has spread, so the incoming page is
        // fully hidden at the handoff while the cloud texture stays visible.
        const coverProgress = Math.max(0, Math.min(1, (progress - 0.72) / 0.28));
        if (coverProgress > 0) {
          smokeContext.fillStyle = "rgba(120, 131, 157, " + coverProgress + ")";
          smokeContext.fillRect(0, 0, width, height);
        }

        const cloudProgress = Math.max(0, Math.min(1, (elapsed - 0.16) / 1.8));
        const cloudEase = easeOut(cloudProgress);

        // Draw the textured wisps with the Events page's ease, drift,
        // particle sprite, and overlapping puff structure.
        for (const particle of particles) {
          const raw = Math.max(0, Math.min(1, (elapsed - particle.delay) / 2.35));
          const p = easeOut(raw);
          const spread = Math.pow(p, 1.3);
          const wave = Math.sin(elapsed * particle.speed * 2.2 + particle.phase);
          const x = particle.startX + (particle.targetX - particle.startX) * spread + wave * particle.drift * 0.2;
          const rise = Math.sin(p * Math.PI * 0.9) * Math.min(height * 0.34, 360);
          const y0 = particle.startY - rise;
          const y = y0 + (particle.targetY - y0) * Math.pow(p, 1.8);
          const size = particle.size * (1.7 + p * 1.7);
          smokeContext.save();
          smokeContext.globalAlpha = particle.opacity * (0.12 + p * (particle.core ? 0.54 : 0.44));
          smokeContext.translate(x, y);
          smokeContext.rotate(particle.phase + wave * 0.05);
          smokeContext.scale(1, particle.aspect);
          smokeContext.drawImage(particle.core ? puffSprite : particleSprite, -size, -size, size * 2, size * 2);
          smokeContext.restore();
        }

        // Broad, overlapping lobes keep the final opaque cover reading as
        // a full frame of billowing cloud instead of a flat colored sheet.
        screenPuffs.forEach((puff) => {
          const puffProgress = Math.max(0, Math.min(1, (cloudProgress - puff.delay) / 0.72));
          const puffEase = easeOut(puffProgress);
          const x = originX + (puff.x * width - originX) * puffEase;
          const y = originY + (puff.y * height - originY) * puffEase;
          const radius = Math.max(width, height) * 0.23 * puff.scale * (0.4 + puffEase * 0.6);
          smokeContext.save();
          smokeContext.globalAlpha = 0.88 * puffEase;
          smokeContext.translate(x, y);
          smokeContext.scale(1, 0.82);
          smokeContext.drawImage(puffSprite, -radius, -radius, radius * 2, radius * 2);
          smokeContext.restore();
        });

        const baseRadius = Math.max(width, height) * 0.36;
        smokeContext.save();
        smokeContext.globalAlpha = 0.86 * cloudEase;
        smokeContext.translate(frontX, frontY);
        smokeContext.scale(1.12, 0.9);
        smokeContext.drawImage(puffSprite, -baseRadius, -baseRadius, baseRadius * 2, baseRadius * 2);
        smokeContext.restore();
        puffs.forEach(([px, py, scale], index) => {
          const delay = index * 0.018;
          const puffProgress = Math.max(0, Math.min(1, (cloudProgress - delay) / 0.78));
          const puffEase = easeOut(puffProgress);
          const x = frontX + px * width * 0.67 * puffEase;
          const y = frontY + py * height * 0.68 * puffEase;
          const radius = Math.max(width, height) * 0.25 * scale * (0.32 + puffEase * 0.68);
          smokeContext.save();
          smokeContext.globalAlpha = 0.88 * puffEase;
          smokeContext.translate(x, y);
          smokeContext.scale(1, 0.8);
          smokeContext.drawImage(puffSprite, -radius, -radius, radius * 2, radius * 2);
          smokeContext.restore();
        });
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
            ease: "power2.inOut",
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
