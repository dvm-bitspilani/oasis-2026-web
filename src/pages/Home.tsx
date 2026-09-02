import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import RegBtn from "../assets/cactuschange1.png";
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

const CLOUD_DROP_START = 0.15;
const CLOUD_DROP_STAGGER = 0.22;

const FADE_ELEMENTS_START = 2.6;
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

  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const castleRef = useRef<HTMLDivElement>(null);

  const sandRef = useRef<HTMLDivElement>(null);

  const introStringLayerRef = useRef<SVGSVGElement>(null);

  const moonRef = useRef<HTMLDivElement>(null);

  const portholeRef = useRef<HTMLDivElement>(null);

  const portholeInnerRef = useRef<HTMLDivElement>(null);

  const overlayCloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  );

  const { navigateWithTransition } = useTransition();

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

         Clouds start above the viewport.
         Their horizontal animation is handled separately
         and NEVER stops.
      ====================================================== */

      const containerRect = containerEl.getBoundingClientRect();

      const cloudRigs = cloudRefs.current
        .map((el) => {
          if (!el) return null;

          const rect = el.getBoundingClientRect();

          return {
            el,
            anchorX: rect.left - containerRect.left + rect.width / 2,
            hookY: rect.top - containerRect.top + rect.height / 2,
          };
        })
        .filter(Boolean) as {
        el: HTMLDivElement;
        anchorX: number;
        hookY: number;
      }[];

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
      const START_LEN = 30;
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
      ====================================================== */

      cloudRigs.forEach((rig, index) => {
        const path = paths[index];

        gsap.set(rig.el, {
          y: -liftDistance,
          opacity: 1,
        });

        if (!path) return;

        path.setAttribute(
          "d",
          buildPath(
            rig.anchorX,
            START_LEN,
            START_SAG,
          ),
        );

        path.style.opacity = "1";

        const length = path.getTotalLength();

        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
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
         CLOUD + STRING DROP

         The cloud and its string use the SAME progress.

         Cloud:
           -liftDistance -> 0

         String:
           top -> cloud

         The string NEVER fades out.
      ====================================================== */

      cloudRigs.forEach((rig, index) => {
        const path = paths[index];

        if (!path) return;

        const state = {
          p: 0,
        };

        tl.to(
          state,
          {
            p: 1,

            duration: 0.75,

            ease: "power2.out",

            delay: index * 0.045,

            onUpdate: () => {
              const p = state.p;

              /* ==============================================
                 CLOUD DROPS DOWN
              ============================================== */

              const cloudY = gsap.utils.interpolate(
                -liftDistance,
                0,
                p,
              );

              gsap.set(rig.el, {
                y: cloudY,
                opacity: 1,
              });

              /* ==============================================
                 GET CURRENT CLOUD X

                 The clouds are ALSO moving horizontally.
                 This keeps the string attached to the cloud.
              ============================================== */

              const currentRect =
                rig.el.getBoundingClientRect();

              const currentContainerRect =
                containerEl.getBoundingClientRect();

              const currentAnchorX =
                currentRect.left -
                currentContainerRect.left +
                currentRect.width / 2;

              /* ==============================================
                 CURRENT STRING END
              ============================================== */

              const currentY =
                rig.hookY + cloudY;

              const endY =
                gsap.utils.interpolate(
                  START_LEN,
                  currentY,
                  p,
                );

              /* ==============================================
                 CURVE -> TAUT
              ============================================== */

              const sag =
                gsap.utils.interpolate(
                  START_SAG,
                  0,
                  Math.pow(p, 0.75),
                );

              path.setAttribute(
                "d",
                buildPath(
                  currentAnchorX,
                  endY,
                  sag,
                ),
              );

              /* ==============================================
                 DRAW STRING

                 opacity ALWAYS = 1
              ============================================== */

              const currentLength =
                path.getTotalLength();

              const drawProgress =
                Math.min(p / 0.65, 1);

              path.style.strokeDasharray =
                `${currentLength}`;

              path.style.strokeDashoffset =
                `${currentLength * (1 - drawProgress)}`;

              path.style.opacity = "1";
            },

            onComplete: () => {
  /* ================================================
     CLOUD STAYS AT FINAL POSITION
     ================================================ */

  gsap.set(rig.el, {
    y: 0,
    opacity: 1,
  });

  /* ================================================
     STRING IS NOW FULLY TAUT
     ================================================ */

  path.setAttribute(
    "d",
    buildPath(
      rig.anchorX,
      rig.hookY,
      0
    )
  );

  path.style.strokeDasharray = "none";
  path.style.strokeDashoffset = "0";
  path.style.opacity = "1";

  /* ================================================
     HOLD STRING FOR A MOMENT
     ================================================ */

  gsap.delayedCall(0.8, () => {
    const retractState = {
      p: 0,
    };

    gsap.to(retractState, {
      p: 1,

      duration: 0.55,

      ease: "power2.in",

      onUpdate: () => {
        const p = retractState.p;

        /*
          hookY -> START_LEN

          The bottom of the string travels
          upward toward the top.
        */
        const endY = gsap.utils.interpolate(
          rig.hookY,
          START_LEN,
          p
        );

        /*
          String becomes more curved while
          retracting upward.
        */
        const sag = gsap.utils.interpolate(
          0,
          START_SAG,
          p
        );

        path.setAttribute(
          "d",
          buildPath(
            rig.anchorX,
            endY,
            sag
          )
        );

        /*
          Draw direction is reversed so the
          visible string retracts toward the top.
        */
        const length = path.getTotalLength();

        path.style.strokeDasharray =
          `${length}`;

        path.style.strokeDashoffset =
          `${length * p}`;

        path.style.opacity = "1";
      },

      onComplete: () => {
        /*
          Completely gone after retracting.
        */
        path.style.opacity = "0";
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
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
    const ctx = gsap.context(() => {
      cloudRefs.current.forEach((cloud, i) => {
        if (!cloud) return;

        const width = cloud.offsetWidth;

        const left = cloud.offsetLeft;

        const min = -left - width;

        const max = window.innerWidth - left;

        gsap.to(cloud, {
          x: `+=${max - min}`,
          duration: CLOUDS[i].duration,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) =>
              gsap.utils.wrap(min, max, parseFloat(x)),
            ),
          },
        });
      });
    }, cloudsRef);

    return () => ctx.revert();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const containerEl = containerRef.current;

      const moonEl = moonRef.current;

      const porthole = portholeRef.current;

      const portholeInner = portholeInnerRef.current;

      if (containerEl && moonEl && porthole && portholeInner) {
        const containerBox = containerEl.getBoundingClientRect();

        const moonBox = moonEl.getBoundingClientRect();

        const top = moonBox.top - containerBox.top;

        const left = moonBox.left - containerBox.left;

        porthole.style.top = `${top}px`;

        porthole.style.left = `${left}px`;

        porthole.style.width = `${moonBox.width}px`;

        porthole.style.height = `${moonBox.height}px`;

        portholeInner.style.top = `${-top}px`;

        portholeInner.style.left = `${-left}px`;

        portholeInner.style.width = `${containerBox.width}px`;

        portholeInner.style.height = `${containerBox.height}px`;
      }

      cloudRefs.current.forEach((real, i) => {
        const overlay = overlayCloudRefs.current[i];

        if (real && overlay) {
          overlay.style.transform = real.style.transform;
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

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

  return (
    <div className={styles.container} ref={containerRef}>
      <div>
        <Nav />
      </div>

      <div
        className={styles.background}
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      <ShootingStars />

      <div className={styles.sand} data-sand-parallax ref={sandRef}>
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
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={styles.cloud}
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
            ref={(el) => {
              cloudRefs.current[i] = el;
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
          {CLOUDS.map((c, i) => (
            <div
              key={i}
              className={styles.cloud}
              style={{
                top: c.top,
                left: c.left,
                width: c.width,
                filter: MOON_CLOUD_TINT,
              }}
              ref={(el) => {
                overlayCloudRefs.current[i] = el;
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

      <button
        type="button"
        className={styles.regBtn}
        aria-label="Register"
        onClick={() => navigateWithTransition("/register")}
      >
        <img src={RegBtn} alt="" />

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

          <a href="" target="_blank" rel="noreferrer">
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
            href="#"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
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