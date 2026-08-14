import { useEffect, useState } from "react";
import styles from "../styles/Preloader.module.scss";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

const TEXT_LINES = [
  "lorem ipsum dolore sel ami",
  "lorem ipsum dolore sel ami",
];

export default function Preloader({
  assets = [],
  onEnter,
}: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>(["", ""]);
  const [typingDone, setTypingDone] = useState(false);

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

  // Typing animation
  useEffect(() => {
    let cancelled = false;

    const typeText = async () => {
      for (let lineIndex = 0; lineIndex < TEXT_LINES.length; lineIndex++) {
        const text = TEXT_LINES[lineIndex];

        for (let i = 0; i <= text.length; i++) {
          if (cancelled) return;

          setTypedLines((prev) => {
            const updated = [...prev];
            updated[lineIndex] = text.slice(0, i);
            return updated;
          });

          await new Promise((resolve) => setTimeout(resolve, 70));
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!cancelled) {
        setTypingDone(true);
      }
    };

    typeText();

    return () => {
      cancelled = true;
    };
  }, []);

  const showEnter = loaded && typingDone;

  return (
    <div className={styles.preloader}>
      <div className={styles.content}>

        <div className={styles.text}>
          {typedLines.map((line, index) => (
            <div className={styles.line} key={index}>
              {line}

              {index === typedLines.length - 1 && !showEnter && (
                <span className={styles.cursor}>|</span>
              )}
            </div>
          ))}
        </div>

        <button
          className={`${styles.enter} ${
            showEnter ? styles.enterVisible : ""
          }`}
          onClick={onEnter}
          disabled={!showEnter}
        >
          ENTER
        </button>

      </div>
    </div>
  );
}