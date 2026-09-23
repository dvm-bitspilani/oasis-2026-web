import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import gsap from "gsap";

import styles from "../styles/Home.module.scss";
import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg";
import sandImg from "../assets/sandfinal.png";
import sandMob from "../assets/maybefinalsorry.png";
import cloudSmall from "../assets/cloudSmall.svg";
import cloudBig from "../assets/cloudBig.svg";
import cloudThree from "../assets/cloudThree.svg";
import Castle from "../assets/castlefinal2.png";
import Moon from "../assets/Moon.png";
import LogoOasis from "../assets/LogoOasisi.png";
/* The register button artwork is split into two layers so the shine can be
   masked to the carpet alone. Both files are expected to be exported on the
   SAME canvas as the old cactuschange.png — that is what lets them stack at
   inset: 0 and line back up into the original composition. */
import RegCactus from "../assets/regCactus.png";
import RegCarpet from "../assets/regCarpet.png";
import Nav from "../components/Nav";
import ShootingStars from "../components/ShootingStars";
import camelLand from "../assets/camel1.svg";
import camelLand2 from "../assets/camel2.svg";

import instagramIcon from "../assets/links/instagram.png";
import twitterIcon from "../assets/links/twitter.png";
import LinkdinIcon from "../assets/links/linkdin.png";
import youtubeIcon from "../assets/links/youtube.png";
import bgPath from "../assets/links/bg.png";

import { useTransition } from "../context/TransitionProvider";

type HomeProps = {
  preloaderDone: boolean;
  preloaderExiting: boolean;
};

type Cloud = {
  src: string;
  top: string;
  left: string;
  width: string;
  duration: number;
};

type Point = {
  x: number;
  y: number;
};

const MOBILE_BREAKPOINT = 650;

const CLOUDS_DESKTOP: Cloud[] = [
  {
    src: cloudSmall,
    top: "35%",
    left: "-20%",
    width: "20%",
    duration: 340,
  },
  {
    src: cloudBig,
    top: "12%",
    left: "10%",
    width: "24%",
    duration: 450,
  },
  {
    src: cloudThree,
    top: "22%",
    left: "40%",
    width: "18%",
    duration: 280,
  },
  {
    src: cloudSmall,
    top: "42%",
    left: "65%",
    width: "15%",
    duration: 250,
  },
  {
    src: cloudBig,
    top: "8%",
    left: "90%",
    width: "22%",
    duration: 530,
  },
];

const CLOUDS_MOBILE: Cloud[] = [
  {
    src: cloudSmall,
    top: "30%",
    left: "-25%",
    width: "50%",
    duration: 200,
  },
  {
    src: cloudBig,
    top: "8%",
    left: "5%",
    width: "60%",
    duration: 270,
  },
  {
    src: cloudThree,
    top: "18%",
    left: "40%",
    width: "45%",
    duration: 170,
  },
  {
    src: cloudSmall,
    top: "38%",
    left: "60%",
    width: "40%",
    duration: 150,
  },
  {
    src: cloudBig,
    top: "5%",
    left: "85%",
    width: "55%",
    duration: 320,
  },
];
const MOON_CLOUD_TINT =
  "brightness(0.35) sepia(0.8) hue-rotate(20deg) saturate(1.5)";

const CASTLE_RISE_START = 0;
const CASTLE_RISE_DURATION = 3;
const CASTLE_PEEK_RATIO = 0.72;

const MOON_RISE_START = 0;
const MOON_RISE_DURATION = 2.0;

const CLOUD_DROP_START = 0.25;
const CLOUD_DROP_STAGGER = 0.22;

const FADE_ELEMENTS_START = 0.45  ;
const FADE_ELEMENTS_DURATION = 1.15;
const FADE_ELEMENTS_STAGGER = 0.12;

export default function Home({
  preloaderDone,
  // preloaderExiting,
}: HomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const camelRef = useRef<HTMLDivElement>(null);
  const camel2Ref = useRef<HTMLDivElement>(null);

  const cloudsRef = useRef<HTMLDivElement>(null);

  const castleRef = useRef<HTMLDivElement>(null);

  const introStringLayerRef = useRef<SVGSVGElement>(null);

  const moonRef = useRef<HTMLDivElement>(null);

  const portholeRef = useRef<HTMLDivElement>(null);

  const portholeInnerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  );

  /* Gates Nav + Register interactivity until the full intro sequence
     (main timeline + every cloud-string retraction) has finished. */
  const [introComplete, setIntroComplete] = useState(false);
  const pendingRetractionsRef = useRef(0);
  const mainTimelineDoneRef = useRef(false);

  const maybeFinishIntro = useCallback(() => {
    if (mainTimelineDoneRef.current && pendingRetractionsRef.current <= 0) {
      setIntroComplete(true);
    }
  }, []);

  const { navigateWithTransition } = useTransition();
  const carpetImgRef = useRef<HTMLImageElement>(null);
  const carpetAlphaRef = useRef<{
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
  } | null>(null);
  const [overCarpet, setOverCarpet] = useState(false);
  const overCarpetRef = useRef(false);
  const pointerRafRef = useRef<number | null>(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = RegCarpet;

    const onLoad = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      carpetAlphaRef.current = { ctx, w: canvas.width, h: canvas.height };
    };

    if (img.complete) onLoad();
    else img.addEventListener("load", onLoad);

    return () => img.removeEventListener("load", onLoad);
  }, []);

  const isOverCarpet = useCallback((clientX: number, clientY: number) => {
    const el = carpetImgRef.current;
    const alpha = carpetAlphaRef.current;

    if (!el) return false;
    /* Canvas not ready yet — treat the whole button as live rather than
       leaving it dead for the first few hundred ms after mount. */
    if (!alpha) return true;

    /* getBoundingClientRect already accounts for the --carpet-* transform,
       so the only thing left to undo is the object-fit: contain letterbox. */
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    const fit = Math.min(rect.width / alpha.w, rect.height / alpha.h);
    const drawnW = alpha.w * fit;
    const drawnH = alpha.h * fit;

    const x = (clientX - rect.left - (rect.width - drawnW) / 2) / fit;
    const y = (clientY - rect.top - (rect.height - drawnH) / 2) / fit;

    if (x < 0 || y < 0 || x >= alpha.w || y >= alpha.h) return false;

    try {
      const px = alpha.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
      /* Small threshold so the drape's soft antialiased edge doesn't
         produce a band of pixels that look solid but don't respond. */
      return px.data[3] > 10;
    } catch {
      /* Cross-origin asset would taint the canvas and make getImageData
         throw. Fall back to the old whole-button behaviour. */
      return true;
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const CLOUDS = isMobile ? CLOUDS_MOBILE : CLOUDS_DESKTOP;

  const bgImg = isMobile ? sandMob : sandImg;

  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const containerEl = containerRef.current;
    const castleEl = castleRef.current;
    const moonEl = moonRef.current;
    const portholeEl = portholeRef.current;
    const stringLayer = introStringLayerRef.current;

    if (!containerEl) return;

    const fadeEls = Array.from(
      containerEl.querySelectorAll<HTMLElement>("[data-transition-fade]"),
    );

    const castleHeight =
      castleEl?.getBoundingClientRect().height || window.innerHeight * 0.4;

    const castleBuriedY = castleHeight * CASTLE_PEEK_RATIO;

    const syncPorthole = () => {
      if (!containerEl || !moonEl || !portholeEl || !portholeInnerRef.current) {
        return;
      }

      const containerBox = containerEl.getBoundingClientRect();
      const moonBox = moonEl.getBoundingClientRect();

      const top = moonBox.top - containerBox.top;
      const left = moonBox.left - containerBox.left;

      gsap.set(portholeEl, {
        top,
        left,
        width: moonBox.width,
        height: moonBox.height,
      });

      gsap.set(portholeInnerRef.current, {
        top: -top,
        left: -left,
        width: containerBox.width,
        height: containerBox.height,
      });
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          overwrite: "auto",
        },
      });

      /* ======================================================
         INITIAL STATES
      ====================================================== */

      if (castleEl) {
        gsap.set(castleEl, {
          y: castleBuriedY,
          x: 0,
          rotation: 0,
          opacity: 0,
        });
      }

      if (moonEl) {
        gsap.set(moonEl, {
          opacity: 0,
          scale: 0.85,
          transformOrigin: "50% 50%",
        });
      }

      if (portholeEl) {
        gsap.set(portholeEl, {
          opacity: 0,
        });
      }

      /* ======================================================
         CLOUD RIGS + STRINGS

         Clouds stay completely stationary during the intro.
         Only the strings animate. Each string uses one fixed
         attachment point on its cloud, so the endpoint never
         moves while the string is dropping or retracting.
      ====================================================== */

      const containerRect = containerEl.getBoundingClientRect();

      const cloudElements = Array.from(
        cloudsRef.current?.querySelectorAll<HTMLDivElement>(
          "[data-cloud]",
        ) ?? [],
      );

      const overlayElements = Array.from(
        portholeInnerRef.current?.querySelectorAll<HTMLDivElement>(
          "[data-overlay-cloud]",
        ) ?? [],
      );

      const cloudRigs = cloudElements.map((el) => {
        const rect = el.getBoundingClientRect();

        return {
          el,
          anchorX: rect.left - containerRect.left + rect.width / 2,
          hookY: rect.top - containerRect.top + rect.height / 2,
        };
      });

      /* Reset the retraction gate for this run of the effect. */
      mainTimelineDoneRef.current = false;
      pendingRetractionsRef.current = cloudRigs.length;

      let paths: SVGPathElement[] = [];

      if (stringLayer) {
        while (stringLayer.firstChild) {
          stringLayer.removeChild(stringLayer.firstChild);
        }

        paths = cloudRigs.map(() => {
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );

          path.setAttribute("fill", "none");

          /* ==================================================
             IMPORTANT:
             Every generated string gets .path
          ================================================== */
          path.setAttribute("class", styles.path);

          path.setAttribute(
            "stroke",
            "rgba(255,255,255,0.55)",
          );

          path.setAttribute("stroke-width", "1.5");

          path.style.opacity = "1";

          stringLayer.appendChild(path);

          return path;
        });
      }

      /* ======================================================
         STRING GEOMETRY

         Same curve/formation as PageTransition.
      ====================================================== */

      const TOP_Y = 0;
      const START_SAG = 120;

      const STRAIGHT_T = 0.55;
      const HOOK_T = 0.85;

      const buildPath = (
        anchorX: number,
        endY: number,
        sag: number,
      ) => {
        const control1Y =
          TOP_Y +
          (endY - TOP_Y) * STRAIGHT_T;

        const control2Y =
          TOP_Y +
          (endY - TOP_Y) * HOOK_T;

        return `M ${anchorX} ${TOP_Y} C ${anchorX} ${control1Y} ${
          anchorX + sag
        } ${control2Y} ${anchorX} ${endY}`;
      };

      const liftDistance = window.innerHeight * 1.3;

      /* ======================================================
         INITIAL CLOUD + STRING POSITION

         The cloud DOES fall during this animation, but there is
         no horizontal cloud movement and no layout measurement
         inside the animation loop.

         The string and cloud share the exact same progress value.
         That means the string always stays attached to the same
         physical point on the cloud while the cloud is falling.
      ====================================================== */

      cloudRigs.forEach((rig, index) => {
        const path = paths[index];
        const overlay = overlayElements[index];

        // Start clouds above their final position.
        // Their X position is never changed during this sequence.
        gsap.set(overlay ? [rig.el, overlay] : rig.el, {
          y: -liftDistance,
          x: 0,
          opacity: 1,
        });

        if (!path) return;

        // Normalize the SVG path so we NEVER need getTotalLength()
        // during the animation. This removes an expensive geometry read.
        path.setAttribute("pathLength", "1");
        path.style.strokeDasharray = "1";
        path.style.strokeDashoffset = "1";
        path.style.opacity = "1";

        // Initial string is attached to the cloud's current position.
        path.setAttribute(
          "d",
          buildPath(
            rig.anchorX,
            rig.hookY - liftDistance,
            START_SAG,
          ),
        );
      });

      /* ======================================================
         CASTLE
      ====================================================== */

      if (castleEl) {
        tl.to(
          castleEl,
          {
            opacity: 1,
            duration: 0.08,
            ease: "none",
          },
          CASTLE_RISE_START,
        );

        const riseState = {
          p: 0,
        };

        tl.to(
          riseState,
          {
            p: 1,
            duration: CASTLE_RISE_DURATION,
            ease: "power2.out",

            onUpdate: () => {
              const p = riseState.p;

              const y =
                castleBuriedY * (1 - p);

              const envelope =
                Math.exp(-3.5 * p);

              const t =
                p * CASTLE_RISE_DURATION;

              const x =
                Math.sin(t * 6) *
                4 *
                envelope;

              const rotation =
                Math.sin(t * 5 + 0.3) *
                0.8 *
                envelope;

              gsap.set(castleEl, {
                y,
                x,
                rotation,
                opacity: 1,
              });
            },

            onComplete: () => {
              gsap.set(castleEl, {
                y: 0,
                x: 0,
                rotation: 0,
                opacity: 1,
              });
            },
          },
          CASTLE_RISE_START,
        );
      }

      /* ======================================================
         MOON
      ====================================================== */

      if (moonEl) {
        tl.to(
          moonEl,
          {
            opacity: 1,
            scale: 1,
            duration: MOON_RISE_DURATION,
            ease: "power3.out",
            onUpdate: syncPorthole,
            onComplete: syncPorthole,
          },
          MOON_RISE_START,
        );
      }

      /* ======================================================
         PORTHOLE
      ====================================================== */

      if (portholeEl) {
        tl.to(
          portholeEl,
          {
            opacity: 1,
            duration: MOON_RISE_DURATION,
            ease: "power3.out",
          },
          MOON_RISE_START,
        );
      }

      /* ======================================================
         CLOUD FALL + STRING DROP

         The important part:

         - Cloud starts above the screen.
         - Cloud falls vertically to y = 0.
         - String endpoint follows the cloud using the SAME `p`.
         - X / attachment point never changes.
         - No getBoundingClientRect() or getTotalLength() runs
           during the animation.

         Visually this is one connected object falling down:

                    string
                      |
                      |
                    [cloud]

         The string then retracts from that SAME cloud point.
      ====================================================== */

      cloudRigs.forEach((rig, index) => {
        const path = paths[index];
        const overlay = overlayElements[index];

        if (!path) return;

        const setCloudY = gsap.quickSetter(
          rig.el,
          "y",
          "px",
        );

        const setOverlayY = overlay
          ? gsap.quickSetter(overlay, "y", "px")
          : null;

        const state = { p: 0 };

        tl.to(
          state,
          {
            p: 1,
            duration: 0.9,
            ease: "power2.out",
            delay: index * 0.045,

            onUpdate: () => {
              const p = state.p;

              // Cloud moves vertically only.
              const cloudY = gsap.utils.interpolate(
                -liftDistance,
                0,
                p,
              );

              setCloudY(cloudY);
              setOverlayY?.(cloudY);

              // EXACT SAME physical point on the cloud.
              const attachmentY =
                rig.hookY + cloudY;

              // Slight initial sag; becomes taut as the cloud lands.
              const sag = gsap.utils.interpolate(
                START_SAG,
                0,
                p,
              );

              path.setAttribute(
                "d",
                buildPath(
                  rig.anchorX,
                  attachmentY,
                  sag,
                ),
              );

              // Reveal the string while the cloud falls.
              path.style.strokeDashoffset = `${
                1 - p
              }`;
            },

            onComplete: () => {
              // Guarantee exact final state.
              setCloudY(0);
              setOverlayY?.(0);

              path.setAttribute(
                "d",
                buildPath(
                  rig.anchorX,
                  rig.hookY,
                  0,
                ),
              );

              path.style.strokeDashoffset = "0";

              /* ==============================================
                 HOLD — STRING REMAINS ATTACHED
              ============================================== */

              gsap.delayedCall(0.8, () => {
                /* ============================================
                   STRING GOES BACK UP

                   Cloud stays exactly where it landed.
                   The attachment point is unchanged.
                ============================================ */

                const retractState = { p: 0 };

                gsap.to(retractState, {
                  p: 1,
                  duration: 0.6,
                  ease: "power2.in",

                  onUpdate: () => {
                    const p = retractState.p;

                    // Same final path, revealed backwards.
                    path.style.strokeDashoffset = `${p}`;
                  },

                  onComplete: () => {
                    path.style.opacity = "0";
                    path.style.strokeDashoffset = "1";

                    pendingRetractionsRef.current = Math.max(
                      0,
                      pendingRetractionsRef.current - 1,
                    );

                    maybeFinishIntro();
                  },
                });
              });
            },
          },
          CLOUD_DROP_START +
            index * CLOUD_DROP_STAGGER,
        );
      });

      /* ======================================================
         PAGE CONTENT

         This does NOT affect .path.
      ====================================================== */

      if (fadeEls.length) {
        gsap.set(fadeEls, {
          opacity: 0,
          y: 18,
        });

        tl.to(
          fadeEls,
          {
            opacity: 1,
            y: 0,
            duration: FADE_ELEMENTS_DURATION,
            ease: "power3.out",
            stagger: FADE_ELEMENTS_STAGGER,
          },
          FADE_ELEMENTS_START,
        );
      }

      /* Main timeline (castle/moon/content fade + string animation) has now
         finished playing. Combined with all string retractions completing,
         this unlocks Nav + Register and only then allows cloud drift to start. */
      tl.eventCallback("onComplete", () => {
        mainTimelineDoneRef.current = true;
        maybeFinishIntro();
      });
    }, containerRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
  if (window.innerWidth > 650) return;

  let resizeTimer: ReturnType<typeof setTimeout>;

  const handleResize = () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
  };
}, []);
  
  useEffect(() => {
    // Keep clouds completely still while the strings are falling/retracting.
    if (!introComplete) return;

    const container = cloudsRef.current;
    if (!container) return;

    const cloudElements = Array.from(
      container.querySelectorAll<HTMLDivElement>("[data-cloud]"),
    );

    const overlayElements = Array.from(
      portholeInnerRef.current?.querySelectorAll<HTMLDivElement>(
        "[data-overlay-cloud]",
      ) ?? [],
    );

    const ctx = gsap.context(() => {
      cloudElements.forEach((cloud, i) => {
        const overlay = overlayElements[i];

        const width = cloud.offsetWidth;
        const left = cloud.offsetLeft;

        const min = -left - width;
        const max = window.innerWidth - left;

        gsap.to(overlay ? [cloud, overlay] : cloud, {
          x: `+=${max - min}`,
          duration: (isMobile
            ? CLOUDS_MOBILE
            : CLOUDS_DESKTOP)[i].duration,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) =>
              gsap.utils.wrap(min, max, parseFloat(x)),
            ),
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [isMobile, introComplete]);

  useEffect(() => {
    if (window.innerWidth <= 650) {
      return;
    }

    const caravan1 = camelRef.current;
    const caravan2 = camel2Ref.current;
    const containerEl = containerRef.current;

    if (!caravan1 || !caravan2 || !containerEl) return;

    const ctx = gsap.context(() => {
      const { width: w, height: h } = containerEl.getBoundingClientRect();

      const CAMEL_1_MIDDLE_PATH = [
        { xPct: 5, yPct: -1 },
        { xPct: 10, yPct: -1.4 },
        { xPct: 15, yPct: -2 },
        { xPct: 20, yPct: -1.8 },
        { xPct: 25, yPct: -0.5 },
      ];

      const CAMEL_1_LOWER_PATH = [
        { xPct: -35, yPct: 15 },
        { xPct: -28, yPct: 17 },
        { xPct: -20, yPct: 17 },
        { xPct: -13, yPct: 17 },
        { xPct: -6, yPct: 17 },
        { xPct: 1, yPct: 17 },
        { xPct: 10, yPct: 17 },
        { xPct: 16, yPct: 15 },
        { xPct: 22, yPct: 13 },
        { xPct: 33, yPct: 12 },
        { xPct: 42, yPct: 12 },
        { xPct: 54, yPct: 15 },
      ];

      const CAMEL_2_MIDDLE_PATH = [
        { xPct: 8, yPct: -2.5 },
        { xPct: 13, yPct: -3.4 },
        { xPct: 18, yPct: -3.8 },
        { xPct: 23, yPct: -2 },
        { xPct: 28, yPct: 1.5 },
      ];

      const CAMEL_2_LOWER_PATH = [
        { xPct: -32, yPct: 14 },
        { xPct: -25, yPct: 15 },
        { xPct: -17, yPct: 16 },
        { xPct: -9, yPct: 16 },
        { xPct: -4, yPct: 16 },
        { xPct: 4, yPct: 15 },
        { xPct: 15, yPct: 14 },
        { xPct: 18, yPct: 13 },
        { xPct: 25, yPct: 12 },
        { xPct: 36, yPct: 12 },
        { xPct: 45, yPct: 13 },
        { xPct: 57, yPct: 14 },
      ];

      const toPx = (
        pts: {
          xPct: number;
          yPct: number;
        }[],
      ): Point[] =>
        pts.map((p) => ({
          x: (p.xPct / 100) * w,
          y: (p.yPct / 100) * h,
        }));

      const camel1MiddlePath = toPx(CAMEL_1_MIDDLE_PATH);
      const camel1LowerPath = toPx(CAMEL_1_LOWER_PATH);

      const camel2MiddlePath = toPx(CAMEL_2_MIDDLE_PATH);
      const camel2LowerPath = toPx(CAMEL_2_LOWER_PATH);

      const FADE_DURATION = 5;
      const HOLD_DURATION = 5;

      const FADE_IN_EASE = "sine.inOut";
      const FADE_OUT_EASE = "power1.in";

      const tl = gsap.timeline({
        repeat: -1,
      });

      const addSteppedRoad = (camel1Path: Point[], camel2Path: Point[]) => {
        const steps = Math.max(camel1Path.length, camel2Path.length);

        for (let i = 0; i < steps; i++) {
          const point1 = camel1Path[i];
          const point2 = camel2Path[i];

          if (point1) {
            tl.set(caravan1, {
              x: point1.x,
              y: point1.y,
              opacity: 0,
            });
          }

          if (point2) {
            tl.set(caravan2, {
              x: point2.x,
              y: point2.y,
              opacity: 0,
            });
          }

          tl.to([caravan1, caravan2], {
            opacity: 1,
            duration: FADE_DURATION,
            ease: FADE_IN_EASE,
          });

          tl.to([caravan1, caravan2], {
            opacity: 1,
            duration: HOLD_DURATION,
          });

          tl.to([caravan1, caravan2], {
            opacity: 0,
            duration: FADE_DURATION,
            ease: FADE_OUT_EASE,
          });
        }
      };

      addSteppedRoad(camel1MiddlePath, camel2MiddlePath);

      addSteppedRoad(camel1LowerPath, camel2LowerPath);
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  const handleCarpetPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!introComplete) return;

      pointerPositionRef.current.x = e.clientX;
      pointerPositionRef.current.y = e.clientY;

      if (pointerRafRef.current !== null) return;

      pointerRafRef.current = window.requestAnimationFrame(() => {
        pointerRafRef.current = null;

        const next = isOverCarpet(
          pointerPositionRef.current.x,
          pointerPositionRef.current.y,
        );

        if (next !== overCarpetRef.current) {
          overCarpetRef.current = next;
          setOverCarpet(next);
        }
      });
    },
    [introComplete, isOverCarpet],
  );

  const handleCarpetPointerLeave = useCallback(() => {
    if (pointerRafRef.current !== null) {
      window.cancelAnimationFrame(pointerRafRef.current);
      pointerRafRef.current = null;
    }

    pointerPositionRef.current.x = 0;
    pointerPositionRef.current.y = 0;

    if (overCarpetRef.current) {
      overCarpetRef.current = false;
      setOverCarpet(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pointerRafRef.current !== null) {
        window.cancelAnimationFrame(pointerRafRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        style={{
          pointerEvents: introComplete ? "auto" : "none",
        }}
        aria-hidden={!introComplete}
      >
        <Nav />
      </div>

      <div
        className={styles.background}
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      <ShootingStars />

      <div className={styles.sand} data-sand-parallax>
        <img src={bgImg} className={styles.sandImg} alt="" />
      </div>

      <div
        className={styles.castle}
        data-castle-drown
        ref={castleRef}
        style={{
          visibility: preloaderDone
            ? // ||
              // preloaderExiting
              "visible"
            : "hidden",
        }}
      >
        <img src={Castle} className={styles.castleImg} alt="" />
      </div>

      <div className={styles.clouds} ref={cloudsRef}>
        {CLOUDS.map((c) => (
          <div
            key={`${c.src}-${c.top}-${c.left}`}
            className={styles.cloud}
            data-cloud
            data-cloud-string
            style={{
              top: c.top,
              left: c.left,
              width: c.width,
              visibility: preloaderDone
                ? //  ||
                  // preloaderExiting
                  "visible"
                : "hidden",
            }}
          >
            <img src={c.src} alt="" />
          </div>
        ))}
      </div>

      <svg
        ref={introStringLayerRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      <div
        className={styles.moon}
        data-moon-shrink
        ref={moonRef}
        style={{
          visibility: preloaderDone
            ? // ||
              // preloaderExiting
              "visible"
            : "hidden",
        }}
      >
        <img src={Moon} className={styles.moonImg} alt="" />
      </div>

      <div
        className={styles.moonCloudOverlay}
        ref={portholeRef}
        style={{
          visibility: preloaderDone
            ? // ||
              // preloaderExiting
              "visible"
            : "hidden",
        }}
      >
        <div className={styles.moonCloudOverlayInner} ref={portholeInnerRef}>
          {CLOUDS.map((c) => (
            <div
              key={`${c.src}-${c.top}-${c.left}-overlay`}
              className={styles.cloud}
              data-overlay-cloud
              style={{
                top: c.top,
                left: c.left,
                width: c.width,
                filter: MOON_CLOUD_TINT,
              }}
            >
              <img src={c.src} alt="" />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.oasisLogo}>
        <img src={LogoOasis} alt="Oasis" />
      </div>

      {/* The shine in Home.module.scss masks itself with the carpet PNG so the
          light is clipped to the fabric and never touches the cacti. The URL is
          only known after the bundler hashes the asset, hence the CSS variable. */}
      <button
        type="button"
        className={`${styles.regBtn} ${overCarpet ? styles.carpetHover : ""}`}
        aria-label="Register"
        aria-disabled={!introComplete}
        tabIndex={introComplete ? 0 : -1}
        style={
          {
            "--reg-carpet-mask": `url(${RegCarpet})`,
            pointerEvents: introComplete ? "auto" : "none",
          } as CSSProperties
        }
        onPointerMove={handleCarpetPointerMove}
        onPointerLeave={handleCarpetPointerLeave}
        onClick={(e) => {
          if (!introComplete) return;
          /* detail === 0 means keyboard activation (Enter/Space), where there
             is no cursor position to test — always allow those through. */
          if (
            e.detail !== 0 &&
            !isOverCarpet(e.clientX, e.clientY)
          ) {
            return;
          }
          navigateWithTransition("/register");
        }}
      >
        {/* Cacti sit behind. The carpet's tied ends drape in front of the arms
            in the original artwork, so the carpet paints second. Swap the two
            lines if your export has the overlap the other way round. */}
        <img className={styles.regCactusLayer} src={RegCactus} alt="" />
        <img
          ref={carpetImgRef}
          className={styles.regCarpetLayer}
          src={RegCarpet}
          alt=""
        />

        <svg
          className={styles.regBtnText}
          viewBox="0 0 220 90"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <path id="curve" d="M -4,4 Q 110,84 224,4" fill="transparent" />

          <text textLength="120" lengthAdjust="spacingAndGlyphs">
            <textPath href="#curve" startOffset="50%" textAnchor="middle">
              REGISTER
            </textPath>
          </text>
        </svg>
      </button>

      <div
        ref={camelRef}
        className={styles.camelLand}
        style={{
          visibility: preloaderDone
            ? // ||
              // preloaderExiting
              "visible"
            : "hidden",
        }}
      >
        <img src={camelLand} alt="" />
      </div>
      <div ref={camel2Ref} className={styles.camelLand2}>
        <img src={camelLand2} alt="" />
      </div>

      {/* SOCIAL LINKS */}
      <div className={styles.links}>
        <svg
          viewBox="0 0 100 100"
          className={styles.linksSvg}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <image
            href={bgPath}
            x="0"
            y="0"
            width="110"
            height="100"
            className={styles.socialLink}
          />

          <a
            href="https://www.instagram.com/bitsoasis/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={instagramIcon}
              x="43"
              y="68"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          <a
            href="https://www.linkedin.com/company/oasis24-bits-pilani/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={LinkdinIcon}
              x="87"
              y="46"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          <a
            href="https://www.youtube.com/@oasisbitspilani6375"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={youtubeIcon}
              x="53"
              y="25"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          <a
            href="https://x.com/bitsoasis"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={twitterIcon}
              x="1"
              y="23"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>
        </svg>
      </div>
    </div>
  );
}