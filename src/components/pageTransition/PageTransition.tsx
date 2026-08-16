import styles from "./PageTransition.module.scss";
import { gsap } from "gsap";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const CLOUD_SELECTOR = "[data-cloud-string]";
const CASTLE_SELECTOR = "[data-castle-drown]";
const MOON_SELECTOR = "[data-moon-shrink]";
const SAND_SELECTOR = "[data-sand-parallax]";
const FADE_SELECTOR = "[data-transition-fade]";

type CloudRig = {
  el: HTMLElement;
  group: SVGGElement;
  path: SVGPathElement;
  anchorX: number;
  hookY: number;
};

export type PageTransitionHandle = {
  openDoors: () => Promise<void>;
};

type TransitionMode = "full" | "doors";

type PageTransitionProps = {
  onComplete?: () => void;
  onOpenComplete?: () => void;
  mode?: TransitionMode;
};

const DOOR_OPEN_DELAY = 0.3;
const DOOR_OPEN_DURATION = 0.8;
const DOOR_CLOSE_DURATION_DOORS_ONLY = 0.5;
const DOOR_START_DELAY_DOORS_ONLY = 0;
const STRING_TAUT_DELAY = 0.05;

const PageTransition = forwardRef<PageTransitionHandle, PageTransitionProps>(
  function PageTransition({ onComplete, onOpenComplete, mode = "full" }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const layerRef = useRef<SVGSVGElement | null>(null);
    const doorLeftRef = useRef<HTMLDivElement | null>(null);
    const doorRightRef = useRef<HTMLDivElement | null>(null);

    const onCompleteRef = useRef(onComplete);
    const onOpenCompleteRef = useRef(onOpenComplete);

    onCompleteRef.current = onComplete;
    onOpenCompleteRef.current = onOpenComplete;

    useImperativeHandle(ref, () => ({
      openDoors: () =>
        new Promise<void>((resolve) => {
          const doorLeft = doorLeftRef.current;
          const doorRight = doorRightRef.current;

          if (!doorLeft || !doorRight) {
            resolve();
            return;
          }

          gsap.delayedCall(DOOR_OPEN_DELAY, () => {
            gsap.to([doorLeft, doorRight], {
              xPercent: (i) => (i === 0 ? -100 : 100),
              duration: DOOR_OPEN_DURATION,
              ease: "power2.inOut",
              onComplete: () => {
                onOpenCompleteRef.current?.();
                resolve();
              },
            });
          });
        }),
    }));

    useEffect(() => {
      const root = rootRef.current;
      const layer = layerRef.current;

      if (!root || !layer) return;

      const cloudEls =
        mode === "full"
          ? Array.from(document.querySelectorAll<HTMLElement>(CLOUD_SELECTOR))
          : [];

      const fadeEls =
        mode === "full"
          ? Array.from(document.querySelectorAll<HTMLElement>(FADE_SELECTOR))
          : [];

      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }

      gsap.killTweensOf(cloudEls);

      const ctx = gsap.context(() => {
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

        // Cubic Bezier instead of quadratic — a single quadratic curve is one
        // continuous arc (same concavity the whole way), so it can't hold a
        // straight run and then hook. Two control points let us fake "hold
        // one end, drop the other": control1 shares the anchor's x, so the
        // line leaves straight/vertical and stays that way for most of its
        // length; control2 sits near the end and is offset by `sag`, so the
        // curl only happens right before the free end — an upward-opening
        // (⌣) hook, not a symmetric bow.
        const STRAIGHT_T = 0.55; // how far down the line stays straight before curling
        const HOOK_T = 0.85; // how close to the end the hook control sits

        const buildPath = (r: CloudRig, endY: number, sag: number) => {
          const control1Y = TOP_Y + (endY - TOP_Y) * STRAIGHT_T;
          const control2Y = TOP_Y + (endY - TOP_Y) * HOOK_T;

          return `M ${r.anchorX} ${TOP_Y} C ${r.anchorX} ${control1Y} ${
            r.anchorX + sag
          } ${control2Y} ${r.anchorX} ${endY}`;
        };

        rigs.forEach((r) => {
          r.path.setAttribute("d", buildPath(r, START_LEN, START_SAG));

          gsap.set(r.path, { opacity: 0 });
        });

        const castleEl =
          mode === "full"
            ? document.querySelector<HTMLElement>(CASTLE_SELECTOR)
            : null;

        const moonEl =
          mode === "full"
            ? document.querySelector<HTMLElement>(MOON_SELECTOR)
            : null;

        const sandEl =
          mode === "full"
            ? document.querySelector<HTMLElement>(SAND_SELECTOR)
            : null;

        if (doorLeftRef.current && doorRightRef.current) {
          gsap.set(doorLeftRef.current, { xPercent: -100 });
          gsap.set(doorRightRef.current, { xPercent: 100 });
        }

        const tl = gsap.timeline({
          onComplete: () => onCompleteRef.current?.(),
        });

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

                  const d = buildPath(r, endY, sag);

                  r.path.setAttribute("d", d);

                  const fadeInP = Math.min(p / 0.25, 1);

                  gsap.set(r.path, {
                    opacity: fadeInP,
                  });

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
                    const overshoot = -Math.sin(this.progress() * Math.PI) * 10;

                    r.path.setAttribute("d", buildPath(r, r.hookY, overshoot));
                  },
                },
                ">-0.03",
              )
              .to(
                {},
                {
                  duration: STRING_TAUT_DELAY,
                },
              )
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

        // Moon is faster than the castle
        const MOON_DURATION = cloudsDuration * 1.2;

        const WOBBLE_AMPLITUDE_X = 10;
        const WOBBLE_AMPLITUDE_ROT = 2;
        const WOBBLE_CYCLES = 5;

        const applyDrownWobble = (
          el: HTMLElement,
          duration: number,
          sinkDistance = SINK_DISTANCE,
          basePercent?: {
            xPercent?: number;
            yPercent?: number;
          },
          wobble = true,
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

                let x = 0;
                let rot = 0;

                if (wobble) {
                  const wobblePhase = p * Math.PI * WOBBLE_CYCLES;

                  const wobbleEnvelope = Math.sin(
                    Math.min(p / 0.15, 1) * (Math.PI / 2),
                  );

                  x =
                    Math.sin(wobblePhase) * WOBBLE_AMPLITUDE_X * wobbleEnvelope;

                  rot =
                    Math.sin(wobblePhase) *
                    WOBBLE_AMPLITUDE_ROT *
                    wobbleEnvelope;
                }

                gsap.set(el, {
                  y,
                  x,
                  rotation: rot,
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
          basePercent?: {
            xPercent?: number;
            yPercent?: number;
          },
          // CHANGED: extra static transform props (e.g. scaleX: -1) that
          // must ride along on every gsap.set call. GSAP writes transforms
          // to the element's inline style, which fully replaces — not
          // merges with — any transform declared in CSS (like the sand's
          // `transform: scaleX(-1)` mirror). Without re-asserting it here
          // on every tick, the first onUpdate call wipes the mirror and
          // the sand visibly "unflips" the instant the transition starts.
          extraTransform?: Record<string, number>,
        ) => {
          gsap.set(el, {
            willChange: "transform",
            ...(basePercent ?? {}),
            ...(extraTransform ?? {}),
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

                const x = 0;
                const rot = 0;

                gsap.set(el, {
                  y,
                  x,
                  rotation: rot,
                  ...(basePercent ?? {}),
                  ...(extraTransform ?? {}),
                });
              },
            },
            0,
          );
        };

        if (castleEl) {
          applyDrownWobble(castleEl, FOREGROUND_DURATION, SINK_DISTANCE, {
            xPercent: -50,
          });
        }

        // Moon moves faster and has NO wobble
        if (moonEl) {
          applyDrown(moonEl, MOON_DURATION, SINK_DISTANCE, {
            xPercent: -50,
          });
        }

        // CHANGED: pass scaleX: -1 through so the sand's CSS mirror
        // (`transform: scaleX(-1)` in Home.module.scss) survives every
        // gsap.set call during the sink — previously this was the one
        // caller with no extraTransform, so the very first onUpdate wrote
        // a transform without the mirror and the sand visibly flipped and
        // jumped the instant a nav link was clicked.
        if (sandEl) {
          applyDrown(sandEl, FOREGROUND_DURATION, SINK_DISTANCE * 0.02);
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

        if (doorLeftRef.current && doorRightRef.current) {
          if (mode === "full") {
            const introEnd = tl.duration();
            const DOOR_START_DELAY = 0.8;

            tl.to(
              doorLeftRef.current,
              {
                xPercent: 0,
                duration: introEnd * 0.5,
                ease: "power2.in",
              },
              DOOR_START_DELAY,
            ).to(
              doorRightRef.current,
              {
                xPercent: 0,
                duration: introEnd * 0.5,
                ease: "power2.in",
              },
              DOOR_START_DELAY,
            );
          } else {
            tl.to(
              doorLeftRef.current,
              {
                xPercent: 0,
                duration: DOOR_CLOSE_DURATION_DOORS_ONLY,
                ease: "power2.in",
              },
              DOOR_START_DELAY_DOORS_ONLY,
            ).to(
              doorRightRef.current,
              {
                xPercent: 0,
                duration: DOOR_CLOSE_DURATION_DOORS_ONLY,
                ease: "power2.in",
              },
              DOOR_START_DELAY_DOORS_ONLY,
            );
          }
        }
      }, rootRef);

      return () => {
        // ctx.revert();

        while (layer.firstChild) {
          layer.removeChild(layer.firstChild);
        }
      };
    }, [mode]);

    return (
      <div ref={rootRef} className={styles.root}>
        <div className={styles.stringLayerWrap}>
          <svg
            ref={layerRef}
            className={styles.stringLayer}
            width="100%"
            height="100%"
          />
        </div>

        <div className={styles.doorLayer}>
          <div
            ref={doorLeftRef}
            className={`${styles.door} ${styles.doorLeft}`}
          />

          <div
            ref={doorRightRef}
            className={`${styles.door} ${styles.doorRight}`}
          />
        </div>
      </div>
    );
  },
);

export default PageTransition;
