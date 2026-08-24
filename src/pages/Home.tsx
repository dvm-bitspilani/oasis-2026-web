import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import styles from "../styles/Home.module.scss";
import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg"
import sandImg from "../assets/sand1.png";
import sandMob from "../assets/sandmobile.png";
import cloudSmall from "../assets/cloudSmall.svg";
import cloudBig from "../assets/cloudBig.svg";
import cloudThree from "../assets/cloudThree.svg";
import Castle from "../assets/Castlehigh.png";
import Moon from "../assets/Moon.png";
import LogoOasis from "../assets/LogoOasisi.png";
import RegBtn from "../assets/cactuschange.png";
import Nav from "../components/Nav";
import ShootingStars from "../components/ShootingStars";
import camelLand from "../assets/camel1.svg";

import instagramIcon from "../assets/links/instagram.png";
import twitterIcon from "../assets/links/twitter.png";
import LinkdinIcon from "../assets/links/linkdin.png";
import youtubeIcon from "../assets/links/youtube.png";
import bgPath from "../assets/links/bg.png";

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

type Point = { x: number; y: number };

const MOBILE_BREAKPOINT = 650;

// =========================================================
// CLOUDS
// =========================================================

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
    duration: 340,
  },
  {
    src: cloudBig,
    top: "8%",
    left: "5%",
    width: "60%",
    duration: 450,
  },
  {
    src: cloudThree,
    top: "18%",
    left: "40%",
    width: "45%",
    duration: 280,
  },
  {
    src: cloudSmall,
    top: "38%",
    left: "60%",
    width: "40%",
    duration: 250,
  },
  {
    src: cloudBig,
    top: "5%",
    left: "85%",
    width: "55%",
    duration: 530,
  },
];

const bgImg =
  window.innerWidth < 650
    ? sandMob
    : sandImg;

const MOON_CLOUD_TINT =
  "brightness(0.35) sepia(0.8) hue-rotate(20deg) saturate(1.5)";

// =========================================================
// INTRO TIMING
// =========================================================

const CASTLE_RISE_START = 0.45;
const CASTLE_WOBBLE_DURATION = 0;
const CASTLE_RISE_DURATION = 4.3;
const CASTLE_PEEK_RATIO = 0.72;

const MOON_RISE_START = 0.45;
const MOON_RISE_DURATION = 2.0;

const CLOUD_DROP_START = 0.65;
const CLOUD_DROP_DURATION = 1.1;
const CLOUD_DROP_STAGGER = 0.22;
const CLOUD_OVERSHOOT_DURATION = 0.22;
const CLOUD_SETTLE_DELAY = 0.08;
const CLOUD_SETTLE_DURATION = 0.3;

const FADE_ELEMENTS_START = 2.6;
const FADE_ELEMENTS_DURATION = 1.15;
const FADE_ELEMENTS_STAGGER = 0.12;
// const FADE_ELEMENTS_RISE = 22;

// ========================================================= npx vercel
// HOME
// =========================================================

export default function Home({
  preloaderDone,
  preloaderExiting,
}: HomeProps) {
  const navigate = useNavigate();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const camelRef =
    useRef<HTMLDivElement>(null);

  const cloudsRef =
    useRef<HTMLDivElement>(null);

  const cloudRefs =
    useRef<(HTMLDivElement | null)[]>(
      [],
    );

  const castleRef =
    useRef<HTMLDivElement>(null);

  const sandRef =
    useRef<HTMLDivElement>(null);

  const introStringLayerRef =
    useRef<SVGSVGElement>(null);

  const moonRef =
    useRef<HTMLDivElement>(null);

  const portholeRef =
    useRef<HTMLDivElement>(null);

  const portholeInnerRef =
    useRef<HTMLDivElement>(null);

  const overlayCloudRefs =
    useRef<(HTMLDivElement | null)[]>(
      [],
    );

  const [isMobile, setIsMobile] =
    useState(
      () =>
        window.innerWidth <=
        MOBILE_BREAKPOINT,
    );

  // =======================================================
  // MOBILE DETECTION
  // =======================================================

  useEffect(() => {
    const onResize = () =>
      setIsMobile(
        window.innerWidth <=
          MOBILE_BREAKPOINT,
      );

    window.addEventListener(
      "resize",
      onResize,
    );

    return () =>
      window.removeEventListener(
        "resize",
        onResize,
      );
  }, []);

  const CLOUDS = isMobile
    ? CLOUDS_MOBILE
    : CLOUDS_DESKTOP;

  // =======================================================
  // INTRO SEQUENCE
  // =======================================================

  useLayoutEffect(() => {
    if (!preloaderDone && !preloaderExiting) return;

    const containerEl =
      containerRef.current;

    const castleEl =
      castleRef.current;

    const moonEl =
      moonRef.current;

    const portholeEl =
      portholeRef.current;

    const stringLayer =
      introStringLayerRef.current;

    if (!containerEl) return;

    const fadeEls =
      Array.from(
        containerEl.querySelectorAll<HTMLElement>(
          "[data-transition-fade]",
        ),
      );

    // -------------------------------------------------------
    // CASTLE MEASUREMENT
    // -------------------------------------------------------

    const castleHeight =
      castleEl?.getBoundingClientRect()
        .height ||
      window.innerHeight * 0.4;

    const castleBuriedY =
      castleHeight *
      CASTLE_PEEK_RATIO;

    // -------------------------------------------------------
    // GSAP CONTEXT
    // -------------------------------------------------------

    const ctx = gsap.context(
      () => {
        const tl =
          gsap.timeline({
            defaults: {
              overwrite: "auto",
            },
          });

        // =====================================================
        // INITIAL STATES
        // =====================================================

        // Castle starts completely invisible.
        // It will appear when its animation starts.
        if (castleEl) {
          gsap.set(castleEl, {
            y: castleBuriedY,
            x: 0,
            rotation: 0,
            opacity: 0,
          });
        }

        // Moon starts completely invisible.
        if (moonEl) {
          gsap.set(moonEl, {
            opacity: 0,
            scale: 0.85,
            transformOrigin:
              "50% 50%",
          });
        }

        // Porthole starts hidden together with moon.
        if (portholeEl) {
          gsap.set(portholeEl, {
            opacity: 0,
          });
        }

        // =====================================================
        // CLOUD MEASUREMENT
        // =====================================================

        const containerRect =
          containerEl.getBoundingClientRect();

        const cloudRigs =
          cloudRefs.current
            .map((el) => {
              if (!el) return null;

              const rect =
                el.getBoundingClientRect();

              return {
                el,

                anchorX:
                  rect.left -
                  containerRect.left +
                  rect.width / 2,

                hookY:
                  rect.top -
                  containerRect.top +
                  rect.height / 2,
              };
            })
            .filter(Boolean) as {
            el: HTMLDivElement;
            anchorX: number;
            hookY: number;
          }[];

        const liftDistance =
          window.innerHeight * 1.3;

        // =====================================================
        // STRING SVG
        // =====================================================

        let paths: SVGPathElement[] =
          [];

        if (stringLayer) {
          while (
            stringLayer.firstChild
          ) {
            stringLayer.removeChild(
              stringLayer.firstChild,
            );
          }

          paths =
            cloudRigs.map(() => {
              const path =
                document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path",
                );

              path.setAttribute(
                "fill",
                "none",
              );

              path.setAttribute(
                "stroke",
                "rgba(255,255,255,0.55)",
              );

              path.setAttribute(
                "stroke-width",
                "1.5",
              );

              path.style.opacity =
                "0";

              stringLayer.appendChild(
                path,
              );

              return path;
            });
        }

        // Clouds begin above the screen.
        cloudRigs.forEach(
          (rig) => {
            gsap.set(rig.el, {
              y: -liftDistance,
              opacity: 0,
            });
          },
        );

        const buildStringPath = (
          anchorX: number,
          currentY: number,
          sag: number,
        ) => {
          const midY =
            currentY * 0.6;

          return `M ${anchorX} 0 Q ${
            anchorX + sag
          } ${midY} ${anchorX} ${currentY}`;
        };

        // =====================================================
        // 1. CASTLE
        // =====================================================

        if (castleEl) {
          // Castle appears as the wobble begins.
          tl.to(
            castleEl,
            {
              opacity: 1,
              duration: 0.08,
              ease: "none",
            },
            CASTLE_RISE_START,
          );

          // Castle wobble
          tl.to(
            {},
            {
              duration:
                CASTLE_WOBBLE_DURATION,

              ease: "none",

              onUpdate:
                function () {
                  const p =
                    this.progress();

                  const envelope =
                    Math.sin(
                      p * Math.PI,
                    );

                  const t =
                    p *
                    CASTLE_WOBBLE_DURATION;

                  const x =
                    Math.sin(t * 10) *
                    5 *
                    envelope;

                  const rotation =
                    Math.sin(
                      t * 8 + 0.4,
                    ) *
                    1.1 *
                    envelope;

                  gsap.set(
                    castleEl,
                    {
                      x,
                      rotation,
                      opacity: 1,
                    },
                  );
                },
            },
            CASTLE_RISE_START,
          );

          // Castle rise
          const riseState = {
            p: 0,
          };

          tl.to(
            riseState,
            {
              p: 1,

              duration:
                CASTLE_RISE_DURATION,

              ease: "power2.out",

              onUpdate: () => {
                const p =
                  riseState.p;

                const y =
                  castleBuriedY *
                  (1 - p);

                const envelope =
                  Math.exp(
                    -3.5 * p,
                  );

                const t =
                  p *
                  CASTLE_RISE_DURATION;

                const x =
                  Math.sin(
                    t * 6,
                  ) *
                  4 *
                  envelope;

                const rotation =
                  Math.sin(
                    t * 5 + 0.3,
                  ) *
                  0.8 *
                  envelope;

                gsap.set(
                  castleEl,
                  {
                    y,
                    x,
                    rotation,
                    opacity: 1,
                  },
                );
              },

              onComplete: () => {
                gsap.set(
                  castleEl,
                  {
                    y: 0,
                    x: 0,
                    rotation: 0,
                    opacity: 1,
                  },
                );
              },
            },

            CASTLE_RISE_START +
              CASTLE_WOBBLE_DURATION *
                0.7,
          );
        }

        // =====================================================
        // 2. MOON
        // =====================================================

        if (moonEl) {
          tl.to(
            moonEl,
            {
              opacity: 1,
              scale: 1,
              duration:
                MOON_RISE_DURATION,
              ease: "power3.out",
            },
            MOON_RISE_START,
          );
        }

        if (portholeEl) {
          tl.to(
            portholeEl,
            {
              opacity: 1,
              duration:
                MOON_RISE_DURATION,
              ease: "power3.out",
            },
            MOON_RISE_START,
          );
        }

        // =====================================================
        // 3. CLOUDS
        // =====================================================

        cloudRigs.forEach(
          (rig, idx) => {
            const path =
              paths[idx];

            const startAt =
              CLOUD_DROP_START +
              idx *
                CLOUD_DROP_STAGGER;

            const state = {
              p: 0,
            };

            tl.to(
              state,
              {
                p: 1,

                duration:
                  CLOUD_DROP_DURATION,

                ease: "sine.in",

                onStart: () => {
                  if (path) {
                    path.style.opacity =
                      "1";
                  }
                },

                onUpdate: () => {
                  const p =
                    state.p;

                  const y =
                    -liftDistance *
                    (1 - p);

                  gsap.set(
                    rig.el,
                    {
                      y,
                      opacity:
                        Math.min(
                          p / 0.25,
                          1,
                        ),
                    },
                  );

                  if (path) {
                    const currentY =
                      rig.hookY + y;

                    const sag =
                      Math.sin(
                        p * Math.PI,
                      ) * 40;

                    path.setAttribute(
                      "d",
                      buildStringPath(
                        rig.anchorX,
                        currentY,
                        sag,
                      ),
                    );
                  }
                },
              },
              startAt,
            )
              .to(
                {},
                {
                  duration:
                    CLOUD_OVERSHOOT_DURATION,

                  ease:
                    "sine.inOut",

                  onUpdate:
                    function () {
                      const overshoot =
                        Math.sin(
                          this.progress() *
                            Math.PI,
                        ) * 14;

                      gsap.set(
                        rig.el,
                        {
                          y: overshoot,
                        },
                      );

                      if (path) {
                        path.setAttribute(
                          "d",
                          buildStringPath(
                            rig.anchorX,
                            rig.hookY +
                              overshoot,
                            0,
                          ),
                        );
                      }
                    },
                },
                `>-${
                  CLOUD_OVERSHOOT_DURATION *
                  0.4
                }`,
              )
              .to(
                {},
                {
                  duration:
                    CLOUD_SETTLE_DELAY,
                },
              )
              .to(
                {},
                {
                  duration:
                    CLOUD_SETTLE_DURATION,

                  ease:
                    "power3.out",

                  onUpdate:
                    function () {
                      const settle =
                        gsap.utils.interpolate(
                          14,
                          0,
                          this.progress(),
                        );

                      gsap.set(
                        rig.el,
                        {
                          y: settle,
                        },
                      );

                      if (path) {
                        path.setAttribute(
                          "d",
                          buildStringPath(
                            rig.anchorX,
                            rig.hookY +
                              settle,
                            0,
                          ),
                        );
                      }
                    },

                  onComplete: () => {
                    gsap.set(
                      rig.el,
                      {
                        y: 0,
                        opacity: 1,
                      },
                    );

                    if (path) {
                      path.style.opacity =
                        "0";
                    }
                  },
                },
              );
          },
        );

        // =====================================================
        // 4. UI ELEMENTS
        // =====================================================

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
      },
      containerRef,
    );

    return () =>
      ctx.revert();
  }, [preloaderDone, preloaderExiting]);

  useEffect(() => {
    const ctx = gsap.context(
      () => {
        cloudRefs.current.forEach(
          (cloud, i) => {
            if (!cloud) return;

            const width =
              cloud.offsetWidth;

            const left =
              cloud.offsetLeft;

            const min =
              -left - width;

            const max =
              window.innerWidth -
              left;

            gsap.to(cloud, {
              x: `+=${max - min}`,

              duration:
                CLOUDS[i].duration,

              ease: "none",

              repeat: -1,

              modifiers: {
                x: gsap.utils.unitize(
                  (x) =>
                    gsap.utils.wrap(
                      min,
                      max,
                      parseFloat(x),
                    ),
                ),
              },
            });
          },
        );
      },
      cloudsRef,
    );

    return () =>
      ctx.revert();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // =======================================================
  // MOON + CLOUD OVERLAY
  // =======================================================

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const containerEl =
        containerRef.current;

      const moonEl =
        moonRef.current;

      const porthole =
        portholeRef.current;

      const portholeInner =
        portholeInnerRef.current;

      if (
        containerEl &&
        moonEl &&
        porthole &&
        portholeInner
      ) {
        const containerBox =
          containerEl.getBoundingClientRect();

        const moonBox =
          moonEl.getBoundingClientRect();

        const top =
          moonBox.top -
          containerBox.top;

        const left =
          moonBox.left -
          containerBox.left;

        porthole.style.top =
          `${top}px`;

        porthole.style.left =
          `${left}px`;

        porthole.style.width =
          `${moonBox.width}px`;

        porthole.style.height =
          `${moonBox.height}px`;

        portholeInner.style.top =
          `${-top}px`;

        portholeInner.style.left =
          `${-left}px`;

        portholeInner.style.width =
          `${containerBox.width}px`;

        portholeInner.style.height =
          `${containerBox.height}px`;
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
  const caravan = camelRef.current;
  const containerEl = containerRef.current;

  if (!caravan || !containerEl) return;

  const ctx = gsap.context(() => {
    const { width: w, height: h } =
      containerEl.getBoundingClientRect();

    const MIDDLE_ROAD_PCT = [
      { xPct: 5, yPct: -1 },
      { xPct: 10, yPct: -1.4 },
      { xPct: 15, yPct: -2 },
      { xPct: 20, yPct: -1.3 },
      { xPct: 25, yPct: -0.5 },
    ];

    const LOWER_ROAD_PCT = [
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
      { xPct: 54, yPct: 16 },
    ];

    const toPx = (
      pts: { xPct: number; yPct: number }[]
    ): Point[] =>
      pts.map((p) => ({
        x: (p.xPct / 100) * w,
        y: (p.yPct / 100) * h,
      }));

    const middlePath = toPx(MIDDLE_ROAD_PCT);
    const lowerPath = toPx(LOWER_ROAD_PCT);

    const FADE_DURATION = 1.5;
    const HOLD_DURATION = 1.5;

    const FADE_IN_EASE = "sine.inout";
    const FADE_OUT_EASE = "power1.in";

    const addSteppedRoad = (
      tl: gsap.core.Timeline,
      path: Point[]
    ) => {
      path.forEach((point) => {

        // Move instantly to the new position
        // and start invisible
        tl.set(caravan, {
          x: point.x,
          y: point.y,
          opacity: 0,
        });

        // Fade IN
        tl.to(caravan, {
          opacity: 1,
          duration: FADE_DURATION,
          ease: FADE_IN_EASE,
        });

        // Stay visible
        tl.to(caravan, {
          opacity: 1,
          duration: HOLD_DURATION,
        });

        // Fade OUT
        tl.to(caravan, {
          opacity: 0,
          duration: FADE_DURATION,
          ease: FADE_OUT_EASE,
        });
      });
    };

    const tl = gsap.timeline({
      repeat: -1,
    });

    addSteppedRoad(tl, middlePath);
    addSteppedRoad(tl, lowerPath);

  }, containerRef);

  return () => ctx.revert();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isMobile]);

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      {/* NAV */}
      <div>
        <Nav />
      </div>

      {/* BACKGROUND */}
      <div
        className={styles.background}
        style={{
          backgroundImage:
            `url(${bg})`,
        }}
      />

      {/* SHOOTING STARS */}
      <ShootingStars />

      {/* SAND */}
      <div
        className={styles.sand}
        data-sand-parallax
        ref={sandRef}
      >
        <img
          src={bgImg}
          className={
            styles.sandImg
          }
          alt=""
        />
      </div>

      {/* CASTLE */}
      <div
        className={styles.castle}
        data-castle-drown
        ref={castleRef}
        style={{
          visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
        }}
      >
        <img
          src={Castle}
          className={
            styles.castleImg
          }
          alt=""
        />
      </div>

      {/* CLOUDS */}
      <div
        className={styles.clouds}
        ref={cloudsRef}
      >
        {CLOUDS.map(
          (c, i) => (
            <div
              key={i}
              className={
                styles.cloud
              }
              data-cloud-string
              style={{
                top: c.top,
                left: c.left,
                width: c.width,
                visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
              }}
              ref={(el) => {
                cloudRefs.current[
                  i
                ] = el;
              }}
            >
              <img
                src={c.src}
                alt=""
              />
            </div>
          ),
        )}
      </div>

      {/* CLOUD STRINGS */}
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

      {/* MOON */}
      <div
        className={
          styles.moon
        }
        data-moon-shrink
        ref={moonRef}
        style={{
          visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
        }}
      >
        <img
          src={Moon}
          className={
            styles.moonImg
          }
          alt=""
        />
      </div>

      {/* MOON CLOUD OVERLAY */}
      <div
        className={
          styles.moonCloudOverlay
        }
        ref={portholeRef}
        style={{
          visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
        }}
      >
        <div
          className={
            styles.moonCloudOverlayInner
          }
          ref={
            portholeInnerRef
          }
        >
          {CLOUDS.map(
            (c, i) => (
              <div
                key={i}
                className={
                  styles.cloud
                }
                style={{
                  top: c.top,
                  left: c.left,
                  width: c.width,
                  filter:
                    MOON_CLOUD_TINT,
                }}
                ref={(el) => {
                  overlayCloudRefs.current[
                    i
                  ] = el;
                }}
              >
                <img
                  src={c.src}
                  alt=""
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* OASIS LOGO */}
      <div
        className={
          styles.oasisLogo
        }
        // data-transition-fade
        // style={{
        //   visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
        // }}
      >
        <img
          src={LogoOasis}
          alt="Oasis"
        />
      </div>

      {/* REGISTER BUTTON */}

<div className={styles.regBtn}>
  <img src={RegBtn} alt="Register" />
  <svg
    className={styles.regBtnText}
    viewBox="0 0 220 90"
    preserveAspectRatio="xMidYMid meet"
    // data-transition-fade
  >
    <path id="curve" d="M -4,4 Q 110,84 224,4" fill="transparent" />
    <text
  textLength="120"
  lengthAdjust="spacingAndGlyphs"
  onClick={() => navigate("/register")}
>
  <textPath href="#curve" startOffset="50%" textAnchor="middle">
    REGISTER
  </textPath>
</text>
  </svg>

        <img
          src={RegBtn}
          alt="Register"
        />
      </div>

      {/* CAMEL */}
      <div
        ref={camelRef}
        className={
          styles.camelLand
        }
        data-transition-fade
        style={{
          visibility: preloaderDone || preloaderExiting ? "visible" : "hidden",
        }}
      >
        <img
          src={camelLand}
          alt=""
        />
      </div>

      {/* SOCIAL LINKS */}
      <div
        className={
          styles.links
        }
      >
        <svg
          viewBox="0 0 100 100"
          className={
            styles.linksSvg
          }
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <image
            href={bgPath}
            x="0"
            y="0"
            width="110"
            height="100"
            className={
              styles.socialLink
            }
          />

          <a
            href="https://www.instagram.com/bitsoasis/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={
                instagramIcon
              }
              x="43"
              y="68"
              width="12"
              height="12"
              className={
                styles.socialLink
              }
            />
          </a>

          <a
            href="https://www.linkedin.com/company/oasis24-bits-pilani/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={
                LinkdinIcon
              }
              x="87"
              y="46"
              width="12"
              height="12"
              className={
                styles.socialLink
              }
            />
          </a>

          <a
            href=""
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={
                youtubeIcon
              }
              x="53"
              y="25"
              width="12"
              height="12"
              className={
                styles.socialLink
              }
            />
          </a>

          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            onClick={(e) =>
              e.preventDefault()
            }
          >
            <image
              href={
                twitterIcon
              }
              x="1"
              y="23"
              width="12"
              height="12"
              className={
                styles.socialLink
              }
            />
          </a>
        </svg>
      </div>
    </div>
  );
}