import { useEffect, useState } from "react";
import styles from "../styles/Preloader.module.scss";

// Adjust these paths to wherever your flash images actually live
import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg";
import flashImage1 from "../assets/camel1.svg";
import flashImage2 from "../assets/camel2.svg";
import flashImage3 from "../assets/camel3.svg";
import flashImage4 from "../assets/camel4.svg";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

const FLASH_IMAGES: string[] = [
  flashImage1,
  flashImage2,
  flashImage3,
  flashImage4,
];

// Timings (ms) — tune these to taste
const FLASH_IN = 250;
const FLASH_HOLD = 350;
const FLASH_OUT = 250;
const FLASH_GAP = 100;

type Phase = "in" | "hold" | "out" | "done";

export default function Preloader({ assets = [], onEnter }: PreloaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");
  const [sequenceDone, setSequenceDone] = useState(false);

  // Preload external assets AND the flash images themselves
  useEffect(() => {
    const allAssets = [...assets, ...FLASH_IMAGES];

    if (allAssets.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;

    const handleLoaded = () => {
      loadedCount++;
      if (loadedCount === allAssets.length) {
        setLoaded(true);
      }
    };

    allAssets.forEach((src) => {
      const img = new Image();
      img.onload = handleLoaded;
      img.onerror = handleLoaded;
      img.src = src;
    });
  }, [assets]);

  // Flash sequence: images appear one-by-one
  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });

    const run = async () => {
      for (let i = 0; i < FLASH_IMAGES.length; i++) {
        if (cancelled) return;
        setActiveImage(i);
        setPhase("in");

        await wait(FLASH_IN);
        if (cancelled) return;
        setPhase("hold");

        await wait(FLASH_HOLD);
        if (cancelled) return;
        setPhase("out");

        await wait(FLASH_OUT);
        if (cancelled) return;

        if (i < FLASH_IMAGES.length - 1) {
          await wait(FLASH_GAP);
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

  // Once assets are loaded and the flash sequence has finished, move on.
  useEffect(() => {
    if (loaded && sequenceDone) {
      const t = setTimeout(() => {
        onEnter();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [loaded, sequenceDone, onEnter]);

  return (<>
    
    <div className={styles.preloader}>
      <div
       className={styles.background}
       style={{ backgroundImage: `url(${bg})`}}>
       </div>
      <div className={styles.vignette} />

      <div className={styles.content}>
        {FLASH_IMAGES.map((src, index) => {
          const isActive = index === activeImage && phase !== "done";

          return (
            <img
              key={index}
              src={src}
              alt=""
              className={`${styles.flashImage} ${
                isActive ? styles[`phase-${phase}`] : ""
              }`}
              style={{ display: index === activeImage ? "block" : "none" }}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}