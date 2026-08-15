import { useEffect, useState } from "react";
import styles from "../styles/Preloader.module.scss";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

const TEXT_LINES = [
  "The Desert has one Rule",
  "It does not open for everyone",
  "But the Lamps are lit Tonight",
  "And the Oasis is expecting You"
];

// Timings (ms) — tune these to taste
const FADE_IN = 1600;
const GLOW_DELAY = 300; // pause after text settles, before glow blooms
const GLOW_IN = 900;
const HOLD = 1400;
const FADE_OUT = 1200;
const GAP = 400;

type Phase = "in" | "glow" | "hold" | "out" | "done";

export default function Preloader({
  assets = [],
  onEnter,
}: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");
  const [sequenceDone, setSequenceDone] = useState(false);

  // Preload assets
  useEffect(() => {
    if (assets.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;

    const handleLoaded = () => {
      loadedCount++;
      if (loadedCount === assets.length) {
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

  // Cinematic 2-line group fade + glow sequence
useEffect(() => {
  let cancelled = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms);
      timeouts.push(t);
    });

  const run = async () => {
    const groups = [
      [0, 1],
      [2, 3],
    ];

    for (let i = 0; i < groups.length; i++) {
      if (cancelled) return;

      setActiveGroup(i);
      setPhase("in");

      await wait(FADE_IN);
      if (cancelled) return;

      await wait(GLOW_DELAY);
      if (cancelled) return;

      setPhase("glow");

      await wait(GLOW_IN);
      if (cancelled) return;

      setPhase("hold");

      await wait(HOLD);
      if (cancelled) return;

      setPhase("out");

      await wait(FADE_OUT);
      if (cancelled) return;

      if (i < groups.length - 1) {
        await wait(GAP);
      }
    }

    if (!cancelled) {
      setPhase("done");
      setSequenceDone(true);
    }
  };

  run();

  return () => {
    cancelled = true;
    timeouts.forEach(clearTimeout);
  };
}, []);
  // Once assets are loaded and the text sequence has finished, move on.
  useEffect(() => {
    if (loaded && sequenceDone) {
      const t = setTimeout(() => {
        onEnter();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [loaded, sequenceDone, onEnter]);

  return (
    <div className={styles.preloader}>
      <div className={styles.vignette} />

      <div className={styles.content}>
        {TEXT_LINES.map((line, index) => {
          const group = Math.floor(index / 2);
          const isActive = group === activeGroup && phase !== "done";
          const pathId = `preloader-path-${index}`;

          return (
            <svg
              key={index}
              className={`${styles.lineSvg} ${
                isActive ? styles[`phase-${phase}`] : ""
              }`}
              viewBox="0 0 1000 120"
              style={{ display: isActive ? "block" : "none" }}              >
              <defs>
                {/* Slight arc for a title-card feel; use
                    "M 50 60 L 950 60" for a dead-straight line instead */}
                <path
                  id={pathId}
                  d="M 50 80 Q 500 20 950 80"
                  fill="none"
                />
              </defs>

              {/* Glow layer: blurred duplicate sitting behind the crisp text.
                  Only opacity is animated — the blur radius itself is static,
                  which is what keeps this reliable across browsers. */}
              <text
                className={styles.glowText}
                textAnchor="middle"
              >
                <textPath href={`#${pathId}`} startOffset="50%">
                  {line}
                </textPath>
              </text>

              {/* Crisp foreground text */}
              <text
                className={styles.pathText}
                textAnchor="middle"
              >
                <textPath href={`#${pathId}`} startOffset="50%">
                  {line}
                </textPath>
              </text>
            </svg>
          );
        })}
      </div>
    </div>
  );
}