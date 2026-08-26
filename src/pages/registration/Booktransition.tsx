import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./BookTransition.module.scss";

import closedBook from "/closedBook.png";
import openBook from "../../assets/registration/reg/book.png";

/* =====================================================
   TIMELINE (ms)

   0            scroll starts sliding up (owned by Registration)
   FLY_DELAY    book lifts off from its Instructions position
   +FLY         book has landed on the right half of the spread
   +HOLD        beat
   +OPEN        cover has rotated 180deg into the left page
   +REVEAL      real <Register /> has faded in, overlay unmounts
   ===================================================== */

const FLY_DELAY = 350;
const FLY = 900;
const HOLD = 180;
const OPEN = 1000;
const REVEAL = 400;

/* Below this width Instructions hides .book entirely and
   Register uses a completely different single-page layout,
   so the flight has nothing to fly between. */
const FLIGHT_MIN_WIDTH = 901;

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Geometry = {
  /* Where the closed book currently sits on the Instructions page */
  start: Rect;
  /* Right half of the final open spread — the flap's resting place */
  page: Rect;
};

type Props = {
  /* Cover has finished rotating — Registration reveals <Register /> */
  onOpened: () => void;
  /* Reveal has finished — Registration unmounts this overlay */
  onDone: () => void;
};

export default function BookTransition({ onOpened, onDone }: Props) {
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [stage, setStage] = useState<"armed" | "flying" | "opening">("armed");

  const sourceRef = useRef<HTMLElement | null>(null);

  /* ---------------- MEASURE ----------------
     Read both ends of the flight off the real DOM / real CSS
     instead of hardcoding percentages, so the many breakpoints
     in Instructions.module.scss keep working. */

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || window.innerWidth < FLIGHT_MIN_WIDTH) {
      onOpened();
      window.setTimeout(onDone, REVEAL);
      return;
    }

    const source =
      document.querySelector<HTMLElement>("[data-book-start]") ??
      document.querySelector<HTMLElement>('img[alt="Frontend Goated"]');

    sourceRef.current = source;

    const spreadImage = new Image();
    spreadImage.src = openBook;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      /* .bookContainer in Register.module.scss:
         width 75vw, aspect-ratio 1.4, centred at (50%, 52%),
         background-size: contain — so the painted spread is
         letterboxed inside that box. */
      const boxWidth = vw * 0.75;
      const boxHeight = boxWidth / 1.4;

      const imageRatio =
        spreadImage.naturalWidth / spreadImage.naturalHeight || 1.4;

      const isWide = imageRatio > boxWidth / boxHeight;

      const spreadWidth = isWide ? boxWidth : boxHeight * imageRatio;
      const spreadHeight = isWide ? boxWidth / imageRatio : boxHeight;

      const centreX = vw / 2;
      const centreY = vh * 0.52;

      const spread: Rect = {
        left: centreX - spreadWidth / 2,
        top: centreY - spreadHeight / 2,
        width: spreadWidth,
        height: spreadHeight,
      };

      /* The closed book sits where the RIGHT half of the spread
         will be — that is what the cover swings off of. */
      const page: Rect = {
        left: spread.left + spread.width / 2,
        top: spread.top,
        width: spread.width / 2,
        height: spread.height,
      };

      const box = source?.getBoundingClientRect();

      const start: Rect =
        box && box.width > 0
          ? {
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
            }
          : page;

      /* Hand the book over to the overlay in the same frame it
         appears, so there is never two of them on screen. */
      if (source) source.style.visibility = "hidden";

      setGeo({ start, page });
    };

    if (spreadImage.complete) measure();
    else spreadImage.onload = measure;

    return () => {
      if (sourceRef.current) sourceRef.current.style.visibility = "";
    };
  }, [onOpened, onDone]);

  /* ---------------- RUN THE TIMELINE ---------------- */

  useEffect(() => {
    if (!geo) return;

    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => setStage("flying"), FLY_DELAY),
      window.setTimeout(() => setStage("opening"), FLY_DELAY + FLY + HOLD),
      window.setTimeout(onOpened, FLY_DELAY + FLY + HOLD + OPEN),
      window.setTimeout(onDone, FLY_DELAY + FLY + HOLD + OPEN + REVEAL)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [geo, onOpened, onDone]);

  if (!geo) return null;

  const { start, page } = geo;

  /* FLIP: the flap is laid out at its final rect, then pushed
     back to the closed book's rect for frame one. Origin is
     top-left so translate + scale compose predictably. */
  const flightTransform =
    stage === "armed"
      ? `translate(${start.left - page.left}px, ${start.top - page.top}px)` +
        ` scale(${start.width / page.width}, ${start.height / page.height})`
      : "none";

  const pageRect = {
    left: `${page.left}px`,
    top: `${page.top}px`,
    width: `${page.width}px`,
    height: `${page.height}px`,
  };

  return (
    <div className={styles.stage} aria-hidden="true">
      {/* RIGHT PAGE — under the cover the whole time, uncovered
          as the flap swings away. Right half of book.png. */}
      <div
        className={styles.rightPage}
        style={{
          ...pageRect,
          backgroundImage: `url(${openBook})`,
          opacity: stage === "armed" ? 0 : 1,
        }}
      />

      {/* FLIGHT — carries the flap from the Instructions position
          to the right half of the spread. */}
      <div
        className={styles.flight}
        style={{
          ...pageRect,
          transform: flightTransform,
          transitionDuration: `${FLY}ms`,
        }}
      >
        {/* FLAP — hinges on its left edge. Front face is the
            closed cover, back face is the left page. */}
        <div
          className={styles.flap}
          style={{
            transform:
              stage === "opening" ? "rotateY(-180deg)" : "rotateY(0deg)",
            transitionDuration: `${OPEN}ms`,
          }}
        >
          <div
            className={styles.cover}
            style={{ backgroundImage: `url(${closedBook})` }}
          />
          <div
            className={styles.leftPage}
            style={{ backgroundImage: `url(${openBook})` }}
          />
        </div>
      </div>
    </div>
  );
}