import { useEffect, useState } from "react";
import styles from "../styles/Preloader.module.scss";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

// Each entry is a "beat" in the sequence; each sub-string renders as its
// own line, each riding its own gently curved path.
const TEXT_LINES: string[][] = [
  ["The desert has one rule.", "It does not open for everyone."],
  ["But the lamps are lit tonight,", "and the oasis is expecting you."],
];

// Timings (ms) — tune these to taste
const FADE_IN = 1600;
const GLOW_DELAY = 300; // pause after text settles, before glow blooms
const GLOW_IN = 900;
const HOLD = 1400;
const FADE_OUT = 1200;
const GAP = 400;

type Phase = "in" | "glow" | "hold" | "out" | "done";

// Builds a gentle arc path, offset vertically by `yOffset`.
// Increase `curve` for a more pronounced bend.
const buildArcPath = (yOffset: number, curve = 45) => {
  const y = yOffset;
  const controlY = yOffset - curve;
  return `M -450 ${y} Q 0 ${controlY} 450 ${y}`;
};

export default function Preloader({
  assets = [],
  onEnter,
}: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
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

  // Cinematic line-by-line fade + glow sequence
  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });

    const run = async () => {
      for (let i = 0; i < TEXT_LINES.length; i++) {
        if (cancelled) return;
        setActiveLine(i);
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

        if (i < TEXT_LINES.length - 1) {
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
        {TEXT_LINES.map((subLines, index) => {
          const isActive = index === activeLine && phase !== "done";

          // Vertically center the stack of curved lines around y=0.
          const lineHeight = 70;
          const startY = -((subLines.length - 1) * lineHeight) / 2;

          return (
            <svg
              key={index}
              className={`${styles.lineSvg} ${
                isActive ? styles[`phase-${phase}`] : ""
              }`}
              viewBox="-500 -160 1000 320"
              style={{ display: index === activeLine ? "block" : "none" }}
            >
              <defs>
                {subLines.map((_, subIndex) => (
                  <path
                    key={subIndex}
                    id={`preloader-arc-${index}-${subIndex}`}
                    d={buildArcPath(startY + subIndex * lineHeight)}
                    fill="none"
                  />
                ))}
              </defs>

              {/* Glow layer: blurred duplicate riding the same curves */}
              <g className={styles.glowText}>
                {subLines.map((sub, subIndex) => (
                  <text key={subIndex} textAnchor="middle">
                    <textPath
                      href={`#preloader-arc-${index}-${subIndex}`}
                      startOffset="50%"
                    >
                      {sub}
                    </textPath>
                  </text>
                ))}
              </g>

              {/* Crisp foreground text */}
              <g className={styles.pathText}>
                {subLines.map((sub, subIndex) => (
                  <text key={subIndex} textAnchor="middle">
                    <textPath
                      href={`#preloader-arc-${index}-${subIndex}`}
                      startOffset="50%"
                    >
                      {sub}
                    </textPath>
                  </text>
                ))}
              </g>
            </svg>
          );
        })}
      </div>
    </div>
  );
}