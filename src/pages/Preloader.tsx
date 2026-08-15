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

// Lines are revealed in two groups: [0,1] first, then [2,3].
// Within a group, line 1 paints, then line 2 paints after a stagger —
// they are NOT simultaneous. Once a (non-final) group has fully
// painted and held, the whole group fades out before the next mounts.
const LINE_GROUPS: number[][] = [
  [0, 1],
  [2, 3],
];

// ---------------------------------------------------------
// TIMINGS
// ---------------------------------------------------------

// How long a single line takes to fully paint in.
const PAINT_DURATION = 8000;

// Delay between line 1 starting and line 2 starting, within a group.
const PAINT_STAGGER = 50;
const STAGGER_RANDOM = 50;

// How long a fully-painted group holds before fading out.
const GROUP_HOLD = 800;

// How long the group-fade-out transition itself takes.
const GROUP_FADE_OUT = 400;

// Pause after a group has fully faded out before the next group starts.
const GROUP_GAP = 200;

// Wait after the FINAL group has held, before auto-advancing to home.
const LAST_LINE_DELAY = 2000;

// Whole-preloader fade-out duration before onEnter() fires.
const FADE_OUT = 400;

export default function Preloader({ assets = [], onEnter }: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);

  // Per-line visibility (opacity 1/0), independent of group fade.
  const [lineVisible, setLineVisible] = useState<boolean[]>(
    TEXT_LINES.map(() => false)
  );

  // Per-group fade-out flag — toggles a CSS transition on the group's
  // wrapper div, fading BOTH lines in that group out together.
  const [groupFading, setGroupFading] = useState<boolean[]>(
    LINE_GROUPS.map(() => false)
  );

  /*
   * Starts false.
   *
   * Becomes true LAST_LINE_DELAY after the last group has held.
   */
  const [lastLineDone, setLastLineDone] = useState(false);

  const [fadingOut, setFadingOut] = useState(false);

  /*
   * Ready to leave only when BOTH:
   *
   * 1. Assets are loaded
   * 2. LAST_LINE_DELAY has passed after the last group finished holding
   */
  const ready = loaded && lastLineDone;

  const paintAnimRefs = useRef<(SVGAnimateElement | null)[]>([]);

  const seedsRef = useRef<number[]>(
    TEXT_LINES.map(() => Math.floor(Math.random() * 1000))
  );

  /*
   * Randomized stagger between line 1 and line 2 within each group.
   */
  const staggerRefs = useRef<number[]>(
    LINE_GROUPS.map(
      () =>
        PAINT_STAGGER +
        (Math.random() * STAGGER_RANDOM * 2 - STAGGER_RANDOM)
    )
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

  const showLine = (index: number) => {
    setLineVisible((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const hideLine = (index: number) => {
    setLineVisible((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  // =========================================================
  // GROUPED, SEQUENTIAL-WITHIN-GROUP ANIMATION
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms);

        timers.push(timer);
      });

    const startPaint = (index: number) => {
      const animation = paintAnimRefs.current[index];

      if (!animation) return;

      try {
        animation.beginElement();
      } catch {
        // Safe to ignore if SMIL isn't supported.
      }
    };

    /*
     * Reveals a line and starts its paint animation. The glow is no
     * longer tied to paint completion at all — .pathText glows the
     * whole time a line is visible, including while it's still being
     * painted in, so there's nothing left to time here.
     */
    const revealAndPaint = async (index: number) => {
      showLine(index);

      await wait(50); // let React mount/update the SVG before beginElement()

      if (cancelled) return;

      startPaint(index);
    };

    const run = async () => {
      for (let groupIndex = 0; groupIndex < LINE_GROUPS.length; groupIndex++) {
        if (cancelled) return;

        const [first, second] = LINE_GROUPS[groupIndex];
        const isLastGroup = groupIndex === LINE_GROUPS.length - 1;

        // -----------------------------------------------------
        // LINE 1 of this group
        // -----------------------------------------------------

        await revealAndPaint(first);

        if (cancelled) return;

        // -----------------------------------------------------
        // LINE 2 of this group, after a stagger
        // -----------------------------------------------------

        await wait(staggerRefs.current[groupIndex]);

        if (cancelled) return;

        await revealAndPaint(second);

        if (cancelled) return;

        // -----------------------------------------------------
        // Hold once line 2 has fully painted
        // -----------------------------------------------------

        await wait(PAINT_DURATION + GROUP_HOLD);

        if (cancelled) return;

        if (isLastGroup) {
          /*
           * Final group: don't fade it out — just start the
           * independent countdown to auto-advance to home.
           */
          await wait(LAST_LINE_DELAY);

          if (!cancelled) {
            setLastLineDone(true);
          }
        } else {
          // -----------------------------------------------------
          // Fade this whole group out, then move to the next
          // -----------------------------------------------------

          setGroupFading((prev) => {
            const next = [...prev];
            next[groupIndex] = true;
            return next;
          });

          await wait(GROUP_FADE_OUT);

          if (cancelled) return;

          hideLine(first);
          hideLine(second);

          setGroupFading((prev) => {
            const next = [...prev];
            next[groupIndex] = false;
            return next;
          });

          await wait(GROUP_GAP);
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
  // AUTO-ADVANCE TO HOME
  // =========================================================

  useEffect(() => {
    if (!ready || fadingOut) return;

    setFadingOut(true);

    const timer = setTimeout(() => {
      onEnter();
    }, FADE_OUT);

    return () => clearTimeout(timer);
  }, [ready, fadingOut, onEnter]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className={`${styles.preloader} ${fadingOut ? styles.fadeOut : ""}`}>
      {/* =====================================================
          ARABIAN NIGHT BACKGROUND
      ===================================================== */}

      <div className={styles.nightSky} />

      <div className={styles.stars}>
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className={styles.moon} />

      <div className={styles.dust}>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className={styles.vignette} />

      {/* =====================================================
          TEXT
      ===================================================== */}

      <div className={styles.content}>
        {LINE_GROUPS.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={`${styles.lineGroup} ${
              groupFading[groupIdx] ? styles.lineGroupFading : ""
            }`}
          >
            {group.map((index) => {
              const line = TEXT_LINES[index];
              const pathId = `preloader-path-${index}`;
              const filterId = `preloader-paint-${index}`;

              return (
                <svg
                  key={index}
                  className={styles.lineSvg}
                  viewBox="0 0 1000 120"
                  style={{ opacity: lineVisible[index] ? 1 : 0 }}
                >
                  <defs>
                    <path
                      id={pathId}
                      d="M 50 80 Q 500 20 950 80"
                      fill="none"
                    />

                    <filter
                      id={filterId}
                      x="-30%"
                      y="-100%"
                      width="160%"
                      height="300%"
                      filterUnits="objectBoundingBox"
                    >
                      <feTurbulence
                        type="turbulence"
                        baseFrequency="0.05 0.09"
                        numOctaves={4}
                        seed={seedsRef.current[index]}
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

                      <feComponentTransfer in="noiseAlpha" result="thresholded">
                        <feFuncA type="linear" slope="26" intercept="-26">
                          <animate
                            ref={(el) => {
                              paintAnimRefs.current[index] =
                                el as SVGAnimateElement | null;
                            }}
                            attributeName="intercept"
                            from="-26"
                            to="13"
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

                  <g style={{ filter: `url(#${filterId})` }}>
                    {/* .pathText always carries the glow now — it's on
                        the whole time the line is visible, including
                        while the paint filter is still revealing it. */}
                    <text className={styles.pathText} textAnchor="middle">
                      <textPath href={`#${pathId}`} startOffset="50%">
                        {line}
                      </textPath>
                    </text>
                  </g>
                </svg>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}