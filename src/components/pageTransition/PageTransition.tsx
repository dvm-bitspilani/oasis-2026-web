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
const SAND_SELECTOR = "[data-sand-parallax]";

type CloudRig = {
  el: HTMLElement;
  group: SVGGElement;
  path: SVGPathElement;
  anchorX: number;
  hookY: number;
};

export type PageTransitionHandle = {
  /** Call once the next page's content is mounted behind the (closed) doors. */
  openDoors: () => Promise<void>;
};

type PageTransitionProps = {
  /** Fires the instant the doors are fully closed — screen is fully covered. */
  onComplete?: () => void;
  /** Fires once the doors have finished opening again. */
  onOpenComplete?: () => void;
};

const DOOR_OPEN_DURATION = 1.4; // was 0.6 — slower reveal

const PageTransition = forwardRef<PageTransitionHandle, PageTransitionProps>(
  function PageTransition({ onComplete, onOpenComplete }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const layerRef = useRef<SVGSVGElement | null>(null);
    const doorLeftRef = useRef<HTMLDivElement | null>(null);
    const doorRightRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      openDoors: () =>
        new Promise<void>((resolve) => {
          const doorLeft = doorLeftRef.current;
          const doorRight = doorRightRef.current;
          if (!doorLeft || !doorRight) {
            resolve();
            return;
          }

          gsap.to([doorLeft, doorRight], {
            xPercent: (i) => (i === 0 ? -100 : 100),
            duration: DOOR_OPEN_DURATION,
            ease: "power2.inOut",
            onComplete: () => {
              onOpenComplete?.();
              resolve();
            },
          });
        }),
    }));

    useEffect(() => {
      const container = containerRef.current;
      const layer = layerRef.current;
      if (!container || !layer) return;

      const cloudEls = Array.from(
        document.querySelectorAll<HTMLElement>(CLOUD_SELECTOR)
      );
      if (cloudEls.length === 0) return;

      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }

      const ctx = gsap.context(() => {
        const rigs: CloudRig[] = cloudEls.map((el) => {
          const rect = el.getBoundingClientRect();
          const group = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
          );
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
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
        const START_SAG = 90;

        const buildPath = (r: CloudRig, endY: number, sag: number) => {
          const midY = (TOP_Y + endY) / 2;
          return `M ${r.anchorX} ${TOP_Y} Q ${r.anchorX + sag} ${midY} ${r.anchorX} ${endY}`;
        };

        rigs.forEach((r) => {
          r.path.setAttribute("d", buildPath(r, START_LEN, START_SAG));
          gsap.set(r.path, { opacity: 0 });
        });

        const castleEl = document.querySelector<HTMLElement>(CASTLE_SELECTOR);
        const sandEl = document.querySelector<HTMLElement>(SAND_SELECTOR);

        // Doors start fully open (off-screen).
        if (doorLeftRef.current && doorRightRef.current) {
          gsap.set(doorLeftRef.current, { xPercent: -100 });
          gsap.set(doorRightRef.current, { xPercent: 100 });
        }

        const tl = gsap.timeline({ onComplete: () => onComplete?.() });

        // --- Clouds: fall + swing + settle ---
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
                  Math.pow(p, 0.7)
                );
                const d = buildPath(r, endY, sag);
                r.path.setAttribute("d", d);

                const fadeInP = Math.min(p / 0.25, 1);
                gsap.set(r.path, { opacity: fadeInP });

                const currentLen = r.path.getTotalLength();
                const drawP = Math.min(p / 0.6, 1);
                gsap.set(r.path, {
                  strokeDasharray: currentLen,
                  strokeDashoffset: currentLen * (1 - drawP),
                });
              },
            },
            i * 0.045
          )
            .to(
              {},
              {
                duration: 0.05,
                onUpdate: function () {
                  const overshoot = Math.sin(this.progress() * Math.PI) * 10;
                  r.path.setAttribute("d", buildPath(r, r.hookY, overshoot));
                },
              },
              ">-0.03"
            )
            .to(
              {},
              {
                duration: 0.12,
                ease: "power3.out",
                onUpdate: function () {
                  const sag = gsap.utils.interpolate(5, 0, this.progress());
                  r.path.setAttribute("d", buildPath(r, r.hookY, sag));
                  gsap.set(r.path, { strokeDashoffset: 0, opacity: 1 });
                },
              }
            );
        });

        // --- Pull up ---
        const liftDistance = window.innerHeight * 1.3;

        tl.to(
          rigs.map((r) => r.group),
          {
            y: -liftDistance,
            duration: 0.35,
            ease: "power2.in",
            stagger: 0.03,
          },
          "+=0.05"
        ).to(
          rigs.map((r) => r.el),
          {
            y: -liftDistance,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            stagger: 0.03,
          },
          "<"
        );

        const cloudsDuration = tl.duration();

        // --- Castle: drowns into the sand, wobbling like it's sinking ---
        const SINK_DISTANCE = window.innerHeight;
        const SAND_DRIFT = -14;
        const CASTLE_DURATION = cloudsDuration * 1.15;
        const WOBBLE_AMPLITUDE_X = 10;
        const WOBBLE_AMPLITUDE_ROT = 2;
        const WOBBLE_CYCLES = 5;

        if (castleEl) {
          gsap.set(castleEl, { willChange: "transform" });

          const castleState = { p: 0 };
          tl.to(
            castleState,
            {
              p: 1,
              duration: CASTLE_DURATION,
              ease: "power2.in",
              onUpdate: () => {
                const p = castleState.p;
                const y = SINK_DISTANCE * p;

                const wobblePhase = p * Math.PI * WOBBLE_CYCLES;
                const wobbleEnvelope = Math.sin(
                  Math.min(p / 0.15, 1) * (Math.PI / 2)
                );
                const x =
                  Math.sin(wobblePhase) * WOBBLE_AMPLITUDE_X * wobbleEnvelope;
                const rot =
                  Math.sin(wobblePhase) * WOBBLE_AMPLITUDE_ROT * wobbleEnvelope;

                gsap.set(castleEl, { y, x, rotation: rot });
              },
            },
            0
          );
        }

        if (sandEl) {
          tl.to(
            sandEl,
            {
              y: SAND_DRIFT,
              duration: cloudsDuration,
              ease: "power1.in",
            },
            0
          );
        }

        // --- Doors close over the whole sequence, meeting in the middle
        // exactly as the timeline finishes.
        const introEnd = tl.duration();

        if (doorLeftRef.current && doorRightRef.current) {
          tl.to(
            doorLeftRef.current,
            {
              xPercent: 0,
              duration: introEnd,
              ease: "power2.in",
            },
            0
          ).to(
            doorRightRef.current,
            {
              xPercent: 0,
              duration: introEnd,
              ease: "power2.in",
            },
            0
          );
        }
      }, containerRef);

      return () => {
        ctx.revert();
        while (layer.firstChild) {
          layer.removeChild(layer.firstChild);
        }
      };
    }, [onComplete]);

    return (
      <div ref={containerRef} className={styles.container}>
        <svg
          ref={layerRef}
          className={styles.stringLayer}
          width="100%"
          height="100%"
        />
        <div ref={doorLeftRef} className={`${styles.door} ${styles.doorLeft}`} />
        <div
          ref={doorRightRef}
          className={`${styles.door} ${styles.doorRight}`}
        />
      </div>
    );
  }
);

export default PageTransition;