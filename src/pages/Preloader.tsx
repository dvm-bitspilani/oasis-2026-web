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

// How long the underlying SMIL reveal animation technically runs for.
// Kept at 8000 so the paint motion itself still looks the same speed.
const PAINT_DURATION = 8000;

// How long it takes, in practice, for the line to LOOK fully painted —
// well before PAINT_DURATION elapses, because the threshold's steep
// slope + ease curve reveal almost everything early and then barely
// change for the rest of the animation. All scheduling (hold/fade)
// is based on THIS, not PAINT_DURATION, so lines don't sit around
// fully-formed for several extra seconds before anything happens.
// Tune this by eye: lower it if lines still linger, raise it if they
// start fading while visibly still filling in.
const PAINT_VISUAL_COMPLETE = 4500;

// Delay between line 1 starting and line 2 starting, within a group.
const PAINT_STAGGER = 50;
const STAGGER_RANDOM = 50;

// How long a fully-painted group holds before fading out, measured
// from PAINT_VISUAL_COMPLETE (not PAINT_DURATION).
const GROUP_HOLD = 400;

// How long the group-fade-out transition itself takes.
const GROUP_FADE_OUT = 400;

// Pause after a group has fully faded out before the next group starts.
const GROUP_GAP = 200;

// Wait after the FINAL group has visually finished + held, before
// auto-advancing to home.
const LAST_LINE_DELAY = 1000;

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
    let cancelled = false;

    if (assets.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;

    const handleLoaded = () => {
      loadedCount++;

      if (loadedCount >= assets.length && !cancelled) {
        setLoaded(true);
      }
    };

    assets.forEach((src) => {
      const img = new Image();

      img.onload = handleLoaded;
      img.onerror = handleLoaded;

      img.src = src;
    });

    return () => {
      cancelled = true;
    };
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
     * Reveals a line and starts its paint animation. The glow is
     * baked into .pathText permanently — nothing to schedule for it.
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
        // Hold once line 2 LOOKS fully painted — based on
        // PAINT_VISUAL_COMPLETE, not the animation's technical
        // PAINT_DURATION, so there's no dead time where the fully-
        // formed text just sits there before anything happens.
        // -----------------------------------------------------

        await wait(PAINT_VISUAL_COMPLETE + GROUP_HOLD);

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
  //
  // NOTE: `fadingOut` must NOT be in the dependency array here.
  // The old version had [ready, fadingOut, onEnter] as deps, which
  // caused this exact bug:
  //
  //   1. ready flips true -> effect runs -> setFadingOut(true) is
  //      called and a 400ms setTimeout(onEnter) is scheduled.
  //   2. Because fadingOut is a dependency, React re-runs this
  //      effect as soon as fadingOut changes. Before re-running,
  //      it fires the previous cleanup: clearTimeout(timer).
  //   3. That cancels the onEnter() timer almost immediately —
  //      long before the 400ms elapses.
  //   4. The effect re-runs with fadingOut now true, so the guard
  //      `if (!ready || fadingOut) return;` bails out immediately.
  //      No new timer is ever scheduled.
  //
  //   Net effect: onEnter() never fires. `entered` in the parent
  //   never flips true. <Preloader /> stays mounted forever —
  //   the CSS .fadeOut animation still finishes on its own (it's
  //   a plain CSS keyframe, not tied to the cancelled JS timer),
  //   so it visually disappears, but the position:fixed,
  //   inset: 0, z-index: 99999 wrapper div is still sitting on
  //   top of the whole page, invisible, eating every click meant
  //   for Nav (or anything else) underneath it.
  //
  // Fix: use a ref as a "has this already started" guard instead
  // of a state dependency, so the effect only ever runs once per
  // `ready` transition and never re-triggers itself.
  // =========================================================

  const hasStartedExit = useRef(false);

  useEffect(() => {
    if (!ready || hasStartedExit.current) return;

    hasStartedExit.current = true;

    setFadingOut(true);

    const timer = setTimeout(() => {
      onEnter();
    }, FADE_OUT);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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