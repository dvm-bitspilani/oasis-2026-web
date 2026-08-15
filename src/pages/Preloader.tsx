import { useEffect, useRef, useState } from "react";
import styles from "../styles/Preloader.module.scss";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

const TEXT_LINES = [
  "The Desert has one Rule",
  "It does not open for everyone",
  "But the Lamps are lit Tonight",
  "And the Oasis is expecting You",
];

// ---------------------------------------------------------
// TIMINGS
// ---------------------------------------------------------

const PAINT_DURATION = 7000;

const PAINT_STAGGER = 500;
const STAGGER_RANDOM = 50;

const LAST_LINE_DELAY = 3000;

const FADE_OUT = 400;

export default function Preloader({
  assets = [],
  onEnter,
}: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  /*
   * Starts false.
   *
   * Becomes true 3 seconds after the 4th line mounts.
   */
  const [lastLineDone, setLastLineDone] =
    useState(false);

  const [fadingOut, setFadingOut] =
    useState(false);

  /*
   * Enter appears only when BOTH:
   *
   * 1. Assets are loaded
   * 2. 3 seconds have passed after line 4 mounted
   */
  const ready = loaded && lastLineDone;

  const paintAnimRefs = useRef<
    (SVGAnimateElement | null)[]
  >([]);

  const seedsRef = useRef<number[]>(
    TEXT_LINES.map(() =>
      Math.floor(Math.random() * 1000),
    ),
  );

  /*
   * Randomized stagger between lines.
   */
  const staggerRefs = useRef<number[]>(
    TEXT_LINES.slice(0, -1).map(
      () =>
        PAINT_STAGGER +
        (Math.random() * STAGGER_RANDOM * 2 -
          STAGGER_RANDOM),
    ),
  );

  // =========================================================
  // ASSET LOADING
  // =========================================================

  useEffect(() => {
    if (assets.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;

    const handleLoaded = () => {
      loadedCount++;

      if (loadedCount >= assets.length) {
        setLoaded(true);
      }
    };

    assets.forEach((src) => {
      const img = new Image();

      img.onload = handleLoaded;
      img.onerror = handleLoaded;

      img.src = src;
    });
  }, [assets]);

  // =========================================================
  // START PAINT ANIMATION
  // =========================================================

  const startPaint = (index: number) => {
    const animation =
      paintAnimRefs.current[index];

    if (!animation) return;

    try {
      animation.beginElement();
    } catch {
      // Safe to ignore if SMIL isn't supported.
    }
  };

  // =========================================================
  // SEQUENTIAL TEXT ANIMATION
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const timers: ReturnType<typeof setTimeout>[] =
      [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms);

        timers.push(timer);
      });

    const run = async () => {
      // -----------------------------------------------------
      // LINE 1
      // -----------------------------------------------------

      setVisibleLines(1);

      /*
       * Give React time to mount line 1.
       */
      await wait(50);

      if (cancelled) return;

      startPaint(0);

      // -----------------------------------------------------
      // LINES 2, 3, 4
      // -----------------------------------------------------

      for (
        let index = 1;
        index < TEXT_LINES.length;
        index++
      ) {
        if (cancelled) return;

        /*
         * Wait only for the stagger.
         *
         * This does NOT wait for PAINT_DURATION.
         */
        await wait(
          staggerRefs.current[index - 1],
        );

        if (cancelled) return;

        /*
         * Mount the next line.
         */
        setVisibleLines(index + 1);

        /*
         * Give React time to mount the SVG
         * and its animation.
         */
        await wait(50);

        if (cancelled) return;

        /*
         * Start paint animation.
         */
        startPaint(index);

        // ---------------------------------------------------
        // LINE 4
        // ---------------------------------------------------

        if (
          index ===
          TEXT_LINES.length - 1
        ) {
          /*
           * The 4th line has now mounted.
           *
           * Start the independent 3-second countdown.
           *
           * PAINT_DURATION has NO involvement here.
           */
          const timer = setTimeout(() => {
            if (!cancelled) {
              setLastLineDone(true);
            }
          }, LAST_LINE_DELAY);

          timers.push(timer);
        }
      }
    };

    run();

    return () => {
      cancelled = true;

      timers.forEach(clearTimeout);
    };
  }, []);

  // =========================================================
  // ENTER
  // =========================================================

  const handleEnter = () => {
    if (!ready || fadingOut) return;

    setFadingOut(true);

    setTimeout(() => {
      onEnter();
    }, FADE_OUT);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className={`${styles.preloader} ${
        fadingOut
          ? styles.fadeOut
          : ""
      }`}
    >
      {/* =====================================================
          ARABIAN NIGHT BACKGROUND
      ===================================================== */}

      <div className={styles.nightSky} />

      <div className={styles.stars}>
        {Array.from({
          length: 25,
        }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className={styles.moon} />

      <div className={styles.dust}>
        {Array.from({
          length: 14,
        }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className={styles.vignette} />

      {/* =====================================================
          TEXT
      ===================================================== */}

      <div className={styles.content}>
        {TEXT_LINES.map(
          (line, index) => {
            const pathId =
              `preloader-path-${index}`;

            const filterId =
              `preloader-paint-${index}`;

            return (
              <svg
                key={index}
                className={styles.lineSvg}
                viewBox="0 0 1000 120"
                style={{
                  opacity:
                    index <
                    visibleLines
                      ? 1
                      : 0,
                }}
              >
                <defs>
                  {/* -----------------------------------------
                      TEXT PATH
                  ----------------------------------------- */}

                  <path
                    id={pathId}
                    d="M 50 80 Q 500 20 950 80"
                    fill="none"
                  />

                  {/* -----------------------------------------
                      PAINT FILTER
                  ----------------------------------------- */}

                  <filter
                    id={filterId}
                    x="-30%"
                    y="-100%"
                    width="160%"
                    height="300%"
                    filterUnits="objectBoundingBox"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.012 0.07"
                      numOctaves={3}
                      seed={
                        seedsRef.current[
                          index
                        ]
                      }
                      result="noise"
                    />

                    <feColorMatrix
                      in="noise"
                      type="matrix"
                      values="
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0.33 0.33 0.33 0 0
                      "
                      result="noiseAlpha"
                    />

                    <feComponentTransfer
                      in="noiseAlpha"
                      result="thresholded"
                    >
                      <feFuncA
                        type="linear"
                        slope="18"
                        intercept="-18"
                      >
                        <animate
                          ref={(el) => {
                            /*
                             * React gives SVGElement | null,
                             * while our ref expects
                             * SVGAnimateElement | null.
                             */
                            paintAnimRefs.current[
                              index
                            ] =
                              el as
                                | SVGAnimateElement
                                | null;
                          }}
                          attributeName="intercept"
                          from="-18"
                          to="9"
                          dur={`${PAINT_DURATION}ms`}
                          begin="indefinite"
                          fill="freeze"
                          calcMode="spline"
                          keySplines="0.22 0.05 0.2 1"
                          keyTimes="0;1"
                        />
                      </feFuncA>
                    </feComponentTransfer>

                    <feComposite
                      in="SourceGraphic"
                      in2="thresholded"
                      operator="in"
                    />
                  </filter>
                </defs>

                {/* -----------------------------------------
                    TEXT
                ----------------------------------------- */}

                <g
                  style={{
                    filter: `url(#${filterId})`,
                  }}
                >
                  <text
                    className={
                      styles.pathText
                    }
                    textAnchor="middle"
                  >
                    <textPath
                      href={`#${pathId}`}
                      startOffset="50%"
                    >
                      {line}
                    </textPath>
                  </text>
                </g>
              </svg>
            );
          },
        )}
      </div>

      {/* =====================================================
          ENTER BUTTON
      ===================================================== */}

      <button
        type="button"
        className={`${styles.enterButton} ${
          ready
            ? styles.enterButtonVisible
            : ""
        }`}
        onClick={handleEnter}
        disabled={!ready}
      >
        Enter
      </button>
    </div>
  );
}