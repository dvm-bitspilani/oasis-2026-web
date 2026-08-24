import styles from "./PageTransition.module.scss";
import { gsap } from "gsap";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import curtainVideo from "../../assets/video/curtain.mp4";

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
  resumeCurtain: () => void;
};

type PageTransitionProps = {
  onComplete?: () => void;
  /** Brightness threshold (0-255). Pixels darker than this become transparent. */
  blackThreshold?: number; 
};

const STRING_TAUT_DELAY = 0.05;
const CURTAIN_PAUSE_TIME = 2;

const PageTransition = forwardRef<
  PageTransitionHandle,
  PageTransitionProps
>(function PageTransition(
  { onComplete, blackThreshold = 10 },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<SVGSVGElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const curtainPausedRef = useRef(false);

  // =========================================
  // CHROMA KEY CANVAS LOOP
  // =========================================
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animFrameId: number;

    const renderFrame = () => {
      if (!video.paused && !video.ended) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1920;
          canvas.height = video.videoHeight || 1080;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const len = data.length;

        // Key out dark background pixels
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r < blackThreshold && g < blackThreshold && b < blackThreshold) {
            data[i + 3] = 0; // Alpha channel
          }
        }

        ctx.putImageData(frame, 0, 0);
      }
      animFrameId = requestAnimationFrame(renderFrame);
    };

    animFrameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [blackThreshold]);

  // =========================================
  // RESUME CURTAIN
  // =========================================
  useImperativeHandle(
    ref,
    () => ({
      resumeCurtain: () => {
        const video = videoRef.current;
        if (!video) return;

        curtainPausedRef.current = true;

        video
          .play()
          .catch(() => {
            onCompleteRef.current?.();
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
    const sandEl = document.querySelector<HTMLElement>(SAND_SELECTOR);

    while (layer.firstChild) {
      layer.removeChild(layer.firstChild);
    }

    gsap.killTweensOf(cloudEls);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      video.pause();
      video.currentTime = 0;
      canvas.style.opacity = "0";
      canvas.style.visibility = "hidden";
      curtainPausedRef.current = false;
    }

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
      const STRAIGHT_T = 0.55;
      const HOOK_T = 0.85;

      const buildPath = (r: CloudRig, endY: number, sag: number) => {
        const control1Y = TOP_Y + (endY - TOP_Y) * STRAIGHT_T;
        const control2Y = TOP_Y + (endY - TOP_Y) * HOOK_T;
        return `M ${r.anchorX} ${TOP_Y} C ${r.anchorX} ${control1Y} ${
          r.anchorX + sag
        } ${control2Y} ${r.anchorX} ${endY}`;
      };

      rigs.forEach((r) => {
        r.path.setAttribute(
          "d",
          buildPath(r, START_LEN, START_SAG),
        );
        gsap.set(r.path, { opacity: 0 });
      });

      const tl = gsap.timeline({
        onComplete: () => {
          const transitionVideo = videoRef.current;
          const transitionCanvas = canvasRef.current;

          if (!transitionVideo || !transitionCanvas) {
            onCompleteRef.current?.();
            return;
          }

          transitionCanvas.style.visibility = "visible";
          transitionCanvas.style.opacity = "1";
          transitionVideo.currentTime = 0;
          curtainPausedRef.current = false;

          transitionVideo
            .play()
            .catch(() => {
              onCompleteRef.current?.();
            });
        },
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
      const WOBBLE_AMPLITUDE_X = 10;
      const WOBBLE_AMPLITUDE_ROT = 2;
      const WOBBLE_CYCLES = 5;

      const applyDrownWobble = (
        el: HTMLElement,
        duration: number,
        sinkDistance = SINK_DISTANCE,
        basePercent?: { xPercent?: number; yPercent?: number },
      ) => {
        gsap.set(el, { willChange: "transform", ...(basePercent ?? {}) });
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
              const wobblePhase = p * Math.PI * WOBBLE_CYCLES;
              const wobbleEnvelope = Math.sin(
                Math.min(p / 0.15, 1) * (Math.PI / 2),
              );
              const x =
                Math.sin(wobblePhase) * WOBBLE_AMPLITUDE_X * wobbleEnvelope;
              const rot =
                Math.sin(wobblePhase) * WOBBLE_AMPLITUDE_ROT * wobbleEnvelope;

              gsap.set(el, { y, x, rotation: rot, ...(basePercent ?? {}) });
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
        gsap.set(el, { willChange: "transform", ...(basePercent ?? {}) });
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
              gsap.set(el, { y, x: 0, rotation: 0, ...(basePercent ?? {}) });
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

      if (moonEl) {
        applyDrown(moonEl, MOON_DURATION, SINK_DISTANCE, { xPercent: -50 });
      }

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
    }, rootRef);

    return () => {
      ctx.revert();
      const transitionVideo = videoRef.current;
      const transitionCanvas = canvasRef.current;

      if (transitionVideo) {
        transitionVideo.pause();
        transitionVideo.currentTime = 0;
      }
      if (transitionCanvas) {
        transitionCanvas.style.opacity = "0";
        transitionCanvas.style.visibility = "hidden";
      }

      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }
    };
  }, []);

  // =========================================
  // CURTAIN VIDEO TIME CONTROL
  // =========================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (
        video.currentTime >= CURTAIN_PAUSE_TIME &&
        !curtainPausedRef.current
      ) {
        curtainPausedRef.current = true;
        video.currentTime = CURTAIN_PAUSE_TIME;
        video.pause();
        onCompleteRef.current?.();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
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

      {/* HIDDEN VIDEO SOURCE */}
      <video
        ref={videoRef}
        src={curtainVideo}
        muted
        playsInline
        preload="auto"
        className="hidden"
        style={{ display: "none" }}
        onEnded={() => {
          onCompleteRef.current?.();
        }}
      />

      {/* VISIBLE KEYED CANVAS */}
      <canvas
        ref={canvasRef}
        className={styles.curtainVideo}
      />
    </div>
  );
});

export default PageTransition;