import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import LogoOasis from "../assets/LogoOasisi.png";

type Particle = {
  x: number;
  y: number;

  ox: number;
  oy: number;

  vx: number;
  vy: number;
  vz: number;

  z: number;

  size: number;
  alpha: number;

  burst: boolean;
};

type Props = {
  assets?: string[];
  onEnter?: () => void;
};

/* ======================================================
   TIMING
====================================================== */

/*
  No separate filled-logo hold.

  The animation starts immediately with:
  FILLED OASIS -> PARTICLES
*/
const DOTS_DURATION = 900;

/*
  Part-by-part disintegration.

  This phase cannot finish before this duration.
*/
const PARTIAL_MIN_DURATION = 2200;

/*
  Time between each partial packet.
*/
const PARTIAL_GROUP_INTERVAL = 380;

/*
  Size of each partial packet.
*/
const PARTIAL_GROUP_FRACTION = 0.08;

/*
  While waiting for assets, only allow 70%
  of the logo to disintegrate.

  This leaves 30% intact for the final burst.
*/
const PARTIAL_MAX_RELEASE_FRACTION = 0.70;

/*
  Final complete Oasis explosion.
*/
const FINAL_BURST_DURATION = 1400;

/*
  Fade only AFTER the complete burst.
*/
const FADE_DURATION = 0.45;


/* ======================================================
   COMPONENT
====================================================== */

export default function Preloader({
  assets = [],
  onEnter,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const assetsReady =
    useRef(false);

  const animationReady =
    useRef(false);

  const entered =
    useRef(false);


  /* ======================================================
     ENTER ONLY WHEN EVERYTHING IS COMPLETE
  ====================================================== */

  const tryEnter = () => {
    if (
      assetsReady.current &&
      animationReady.current &&
      !entered.current
    ) {
      entered.current = true;

      onEnter?.();
    }
  };


  /* ======================================================
     ASSET LOADING
  ====================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = (src: string) =>
      new Promise<void>((resolve) => {
        const image = new Image();

        image.onload = () => resolve();

        /*
          Don't permanently block the preloader
          if one optional asset fails.
        */
        image.onerror = () => resolve();

        image.src = src;
      });

    Promise.all(
      Array.from(
        new Set([
          ...assets,
          LogoOasis,
        ]),
      ).map(load),
    ).then(() => {
      if (cancelled) return;

      assetsReady.current = true;

      tryEnter();
    });

    return () => {
      cancelled = true;
    };
  }, [assets]);


  /* ======================================================
     ANIMATION
  ====================================================== */

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    let particles: Particle[] = [];

    let renderRaf = 0;
    let animateRaf = 0;

    let destroyed = false;


    type Phase =
      | "dots"
      | "partialBursts"
      | "finalBurst"
      | "done";

    /*
      IMPORTANT:

      We no longer have a "logo" phase.

      The animation starts immediately
      with the filled logo transforming
      into dots.
    */
    let phase: Phase = "dots";

    let phaseStart =
      performance.now();

    let nextGroupBurstAt = 0;


    /* ======================================================
       RESIZE
    ====================================================== */

    const resize = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      canvas.width =
        window.innerWidth * dpr;

      canvas.height =
        window.innerHeight * dpr;

      canvas.style.width =
        `${window.innerWidth}px`;

      canvas.style.height =
        `${window.innerHeight}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );
    };

    resize();

    window.addEventListener(
      "resize",
      resize,
    );


    /* ======================================================
       LOAD LOGO
    ====================================================== */

    const img = new Image();

    img.onload = () => {
      if (destroyed) return;

      const centerX =
        window.innerWidth / 2;

      const centerY =
        window.innerHeight / 2;


      /* ==================================================
         LOGO SIZE
      ================================================== */

      const maxWidth =
        Math.min(
          window.innerWidth * 0.48,
          650,
        );

      const scale =
        maxWidth / img.width;

      const width =
        Math.floor(
          img.width * scale,
        );

      const height =
        Math.floor(
          img.height * scale,
        );

      const logoX =
        (window.innerWidth -
          width) /
        2;

      const logoY =
        (window.innerHeight -
          height) /
        2;


      /* ==================================================
         TEMP CANVAS
      ================================================== */

      const temp =
        document.createElement(
          "canvas",
        );

      temp.width = width;
      temp.height = height;

      const tctx =
        temp.getContext("2d");

      if (!tctx) return;

      tctx.drawImage(
        img,
        0,
        0,
        width,
        height,
      );

      const pixels =
        tctx.getImageData(
          0,
          0,
          width,
          height,
        ).data;


      /* ==================================================
         CREATE PARTICLES
      ================================================== */

      const step =
        window.innerWidth < 650
          ? 5
          : 6;

      particles = [];

      for (
        let y = 0;
        y < height;
        y += step
      ) {
        for (
          let x = 0;
          x < width;
          x += step
        ) {
          const ix =
            Math.floor(x);

          const iy =
            Math.floor(y);

          const index =
            (iy * width + ix) * 4;

          /*
            Ignore transparent pixels.
          */
          if (
            pixels[index + 3] < 100
          ) {
            continue;
          }

          const ox =
            logoX + x;

          const oy =
            logoY + y;

          particles.push({
            x: ox,
            y: oy,

            ox,
            oy,

            vx: 0,
            vy: 0,
            vz: 0,

            z: 0,

            /*
              Start large enough to look
              like the filled logo.
            */
            size:
              1.4 +
              Math.random() * 0.5,

            alpha: 1,

            burst: false,
          });
        }
      }


      /* ======================================================
         RENDER LOOP
      ====================================================== */

      const render = () => {
        if (destroyed) return;

        ctx.clearRect(
          0,
          0,
          window.innerWidth,
          window.innerHeight,
        );

        particles.forEach((p) => {
          const perspective =
            1 +
            p.z * 0.035;

          const drawX =
            centerX +
            (p.x - centerX) *
              perspective;

          const drawY =
            centerY +
            (p.y - centerY) *
              perspective;

          const size =
            p.size *
            perspective;

          ctx.globalAlpha =
            p.alpha;


          /* ==================================================
             SHOOTING STAR TRAIL
          ================================================== */

          if (
            p.burst &&
            (
              Math.abs(p.vx) > 0.01 ||
              Math.abs(p.vy) > 0.01
            )
          ) {
            const velocity =
              Math.sqrt(
                p.vx * p.vx +
                p.vy * p.vy,
              ) || 1;

            const dx =
              p.vx / velocity;

            const dy =
              p.vy / velocity;

            const trail =
              Math.min(
                100,
                8 + p.z * 0.8,
              );

            const tailX =
              drawX -
              dx * trail;

            const tailY =
              drawY -
              dy * trail;

            const gradient =
              ctx.createLinearGradient(
                tailX,
                tailY,
                drawX,
                drawY,
              );

            gradient.addColorStop(
              0,
              "rgba(255,255,255,0)",
            );

            gradient.addColorStop(
              0.5,
              "rgba(255,255,255,0.25)",
            );

            gradient.addColorStop(
              1,
              "rgba(255,255,255,1)",
            );

            ctx.beginPath();

            ctx.moveTo(
              tailX,
              tailY,
            );

            ctx.lineTo(
              drawX,
              drawY,
            );

            ctx.strokeStyle =
              gradient;

            ctx.lineWidth =
              Math.max(
                0.7,
                size,
              );

            ctx.stroke();
          }


          /* ==================================================
             PARTICLE
          ================================================== */

          ctx.beginPath();

          ctx.arc(
            drawX,
            drawY,
            size,
            0,
            Math.PI * 2,
          );

          ctx.fillStyle =
            "white";

          ctx.fill();
        });

        ctx.globalAlpha = 1;

        renderRaf =
          requestAnimationFrame(
            render,
          );
      };

      render();


      /* ======================================================
         BURST PARTICLES
      ====================================================== */

      const burstParticles = (
        list: Particle[],
      ) => {
        list.forEach((p) => {
          if (p.burst) return;

          const dx =
            p.ox - centerX;

          const dy =
            p.oy - centerY;

          /*
            Particles shoot outward from
            the Oasis center.
          */
          const angle =
            Math.atan2(dy, dx) +
            (Math.random() - 0.5) *
              0.65;

          const speed =
            1.8 +
            Math.random() * 3;

          p.vx =
            Math.cos(angle) *
            speed;

          p.vy =
            Math.sin(angle) *
            speed;

          /*
            Forward movement toward viewer.
          */
          p.vz =
            4 +
            Math.random() * 6;

          p.z = 0;

          p.burst = true;

          p.alpha = 1;

          p.size =
            0.8 +
            Math.random() * 1.4;
        });
      };


      /* ======================================================
         PARTIAL GROUP BURST
      ====================================================== */

      const burstNextGroup = () => {
        const remaining =
          particles.filter(
            (p) => !p.burst,
          );

        if (
          remaining.length === 0
        ) {
          return;
        }

        const groupSize =
          Math.max(
            1,
            Math.floor(
              remaining.length *
                PARTIAL_GROUP_FRACTION,
            ),
          );

        /*
          Pick a random point on the
          remaining Oasis.
        */
        const seed =
          remaining[
            Math.floor(
              Math.random() *
                remaining.length,
            )
          ];

        /*
          Find nearby particles.

          This creates actual chunks/packets
          rather than randomly deleting dots
          from the whole logo.
        */
        const sorted =
          [...remaining].sort(
            (a, b) => {
              const da =
                (a.ox - seed.ox) *
                  (a.ox - seed.ox) +
                (a.oy - seed.oy) *
                  (a.oy - seed.oy);

              const db =
                (b.ox - seed.ox) *
                  (b.ox - seed.ox) +
                (b.oy - seed.oy) *
                  (b.oy - seed.oy);

              return da - db;
            },
          );

        const group =
          sorted.slice(
            0,
            groupSize,
          );

        burstParticles(group);
      };


      /* ======================================================
         BURST PHYSICS
      ====================================================== */

      const advanceBurstPhysics = (
        accel: {
          posMul: number;
          zGrow: number;
          zMul: number;
          velGrow: number;
        },
      ) => {
        particles.forEach((p) => {
          if (!p.burst) return;

          p.x +=
            p.vx *
            accel.posMul;

          p.y +=
            p.vy *
            accel.posMul;

          p.vz *=
            accel.zGrow;

          p.z +=
            p.vz *
            accel.zMul;

          p.vx *=
            accel.velGrow;

          p.vy *=
            accel.velGrow;

          /*
            Fade as particles get very close
            to the viewer.
          */
          if (p.z > 80) {
            p.alpha =
              Math.max(
                0,
                1 -
                  (p.z - 80) /
                    40,
              );
          }
        });
      };


      /* ======================================================
         MAIN ANIMATION LOOP
      ====================================================== */

      const animate = () => {
        if (destroyed) return;

        const now =
          performance.now();

        const elapsed =
          now - phaseStart;


        /* ==================================================
           PHASE 1
           FILLED OASIS -> DOTS

           Starts IMMEDIATELY.
        ================================================== */

        if (
          phase === "dots"
        ) {
          const progress =
            Math.min(
              elapsed /
                DOTS_DURATION,
              1,
            );

          const eased =
            1 -
            Math.pow(
              1 - progress,
              3,
            );

          particles.forEach(
            (p) => {
              /*
                Slowly introduce tiny
                movement as the filled logo
                becomes particles.
              */
              const jitter =
                eased * 2;

              p.x =
                p.ox +
                (Math.random() -
                  0.5) *
                  jitter;

              p.y =
                p.oy +
                (Math.random() -
                  0.5) *
                  jitter;

              /*
                Large filled appearance
                -> tiny dots.
              */
              const fromSize =
                1.5;

              const toSize =
                0.35 +
                Math.random() *
                  0.5;

              p.size =
                fromSize +
                (toSize -
                  fromSize) *
                  eased;
            },
          );

          if (
            progress >= 1
          ) {
            phase =
              "partialBursts";

            phaseStart = now;

            /*
              First partial packet immediately.
            */
            nextGroupBurstAt = 0;
          }
        }


        /* ==================================================
           PHASE 2
           PART-BY-PART DISINTEGRATION
        ================================================== */

        if (
          phase ===
          "partialBursts"
        ) {
          const remaining =
            particles.filter(
              (p) => !p.burst,
            );

          const remainingCount =
            remaining.length;

          const totalCount =
            particles.length;

          const releasedFraction =
            1 -
            remainingCount /
              totalCount;

          /*
            Slowly release chunks while
            assets are loading.
          */
          if (
            elapsed >=
              nextGroupBurstAt &&
            remainingCount > 0 &&
            releasedFraction <
              PARTIAL_MAX_RELEASE_FRACTION
          ) {
            burstNextGroup();

            nextGroupBurstAt =
              elapsed +
              PARTIAL_GROUP_INTERVAL;
          }

          /*
            Existing particles continue flying.
          */
          advanceBurstPhysics({
            posMul: 0.12,
            zGrow: 1.025,
            zMul: 0.1,
            velGrow: 1.003,
          });

          /*
            The partial phase MUST last
            at least 2.2 seconds.

            AND assets must be ready.
          */
          const minimumTimePassed =
            elapsed >=
            PARTIAL_MIN_DURATION;

          if (
            minimumTimePassed &&
            assetsReady.current
          ) {
            /*
              ==========================================
              FINAL RELEASE
              ==========================================

              Release EVERY particle still
              forming the Oasis.
            */
            const remainingParticles =
              particles.filter(
                (p) => !p.burst,
              );

            burstParticles(
              remainingParticles,
            );

            /*
              Start the final burst timer
              NOW.
            */
            phase =
              "finalBurst";

            phaseStart = now;
          }
        }


        /* ==================================================
           PHASE 3
           COMPLETE OASIS BURST
        ================================================== */

        if (
          phase ===
          "finalBurst"
        ) {
          /*
            Every Oasis particle is now flying.
          */
          advanceBurstPhysics({
            posMul: 0.15,
            zGrow: 1.035,
            zMul: 0.13,
            velGrow: 1.004,
          });

          /*
            NEVER exit before the entire
            final burst duration.
          */
          if (
            elapsed >=
            FINAL_BURST_DURATION
          ) {
            /*
              Absolute safety check.

              If anything somehow hasn't burst,
              release it and restart the timer.
            */
            const unfinished =
              particles.filter(
                (p) => !p.burst,
              );

            if (
              unfinished.length > 0
            ) {
              burstParticles(
                unfinished,
              );

              phaseStart = now;

              animateRaf =
                requestAnimationFrame(
                  animate,
                );

              return;
            }

            /*
              Check whether any particles
              are still visible.
            */
            const stillVisible =
              particles.some(
                (p) =>
                  p.alpha > 0.03,
              );

            if (stillVisible) {
              /*
                Don't cut the burst off.
                Give it another frame.
              */
              animateRaf =
                requestAnimationFrame(
                  animate,
                );

              return;
            }

            /*
              ==========================================
              THE ENTIRE OASIS HAS NOW BURST.
              ONLY NOW DO WE EXIT.
              ==========================================
            */
            phase = "done";

            gsap.to(canvas, {
              opacity: 0,

              duration:
                FADE_DURATION,

              ease: "power2.out",

              onComplete: () => {
                if (destroyed)
                  return;

                animationReady.current =
                  true;

                tryEnter();
              },
            });
          }
        }


        /* ==================================================
           KEEP ANIMATING
        ================================================== */

        animateRaf =
          requestAnimationFrame(
            animate,
          );
      };


      /* ======================================================
         START
      ====================================================== */

      animate();
    };

    img.src = LogoOasis;


    /* ======================================================
       CLEANUP
    ====================================================== */

    return () => {
      destroyed = true;

      cancelAnimationFrame(
        renderRaf,
      );

      cancelAnimationFrame(
        animateRaf,
      );

      window.removeEventListener(
        "resize",
        resize,
      );
    };
  }, []);


  /* ======================================================
     JSX
  ====================================================== */

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        overflow: "hidden",
        background:
          "rgb(8, 10, 24)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          background:
            "rgb(8, 10, 24)",
        }}
      />
    </div>
  );
}