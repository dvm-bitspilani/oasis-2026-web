import styles from "./PageTransition.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const CLOUD_SELECTOR = "[data-cloud-string]";

type CloudRig = {
  el: HTMLElement;
  group: SVGGElement;
  path: SVGPathElement;
  anchorX: number;
  hookY: number;
};

export default function PageTransition({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<SVGSVGElement | null>(null);

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

      // Start fully invisible and with the dash fully hidden — nothing
      // renders until the fall tween below actively draws it in.
      rigs.forEach((r) => {
        r.path.setAttribute("d", buildPath(r, START_LEN, START_SAG));
        gsap.set(r.path, { opacity: 0 });
      });

      const tl = gsap.timeline({ onComplete: () => onComplete?.() });

      // --- Phase 1–3 per cloud: grow+straighten, hook, tighten. ---
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

              // Fade in fast over the first ~25% of the fall, so it
              // eases into view instead of popping.
              const fadeInP = Math.min(p / 0.25, 1);
              gsap.set(r.path, { opacity: fadeInP });

              // Dash-draw: the string appears to trace itself out from
              // the anchor rather than existing as a complete shape
              // instantly. Redraw dasharray each frame against the
              // path's current (growing) length.
              const currentLen = r.path.getTotalLength();
              const drawP = Math.min(p / 0.6, 1); // draws in a bit faster than the fall itself
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
                // fully drawn and visible by this phase
                gsap.set(r.path, { strokeDashoffset: 0, opacity: 1 });
              },
            }
          );
      });

      // --- Phase 4: PULL UP ---
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
    </div>
  );
}