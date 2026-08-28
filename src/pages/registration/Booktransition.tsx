import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Booktransition.module.scss";

import closedBook from "/closedBook.png";
import openBook from "../../assets/registration/reg/book.png";

/* =====================================================
   DESKTOP TIMELINE (ms)   —   width >= FLIGHT_MIN_WIDTH

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

/* Shared by both layouts: the cross-fade into the real page. */
const REVEAL = 400;

/* =====================================================
   MOBILE TIMELINE (ms)   —   width < FLIGHT_MIN_WIDTH

   There is no closed book to fly on mobile: Instructions
   hides .book below 1401px, and Register swaps to a single
   page layout, so there is no cover to rotate either. The
   whole transition is one page swinging in instead.

   0            scroll starts sliding up (owned by Registration)
   TURN_DELAY   scroll is clear; the page starts swinging in
                from beyond the right edge of the screen
   +TURN        the page has landed flat, exactly on top of
                where the real .bookContainer will render
   +SETTLE      beat
   +REVEAL      real <Register /> has faded in — the form text
                appears on the page just like it does on desktop
   ===================================================== */

const TURN_DELAY = 540;
const TURN = 1050;
const SETTLE = 120;

/* The page hinges on the spine, which on mobile sits at ~96vw —
   just off the right edge of the screen. Anything past 90deg is
   therefore folded over to the right and out of view, so starting
   a little past it is what makes the page read as coming in from
   outside the screen. Raise this for a longer entrance, but note
   everything above ~120deg is spent off screen. */
const TURN_FROM = 108;

/* At TURN_FROM the page is nearly edge on, which still leaves a
   hairline of the far edge inside the viewport. It is faded in as
   the turn starts so that hairline is never parked on screen
   while the scroll is still leaving. */
const TURN_FADE = 260;

/* closedBook.png has the book drawn ~11deg clockwise inside its own
   frame, with transparent padding around it. Frame one of the
   overlay has to match that raw, uncorrected look exactly (it's
   standing in for the plain <img> on the Instructions page), so the
   correction below is animated in rather than applied instantly.
   SCALING LOGIC: tweak the scale() to close any remaining
   transparent gap at the corners once it's fully rotated.
   DESKTOP ONLY — the mobile path never renders the closed book. */
const CORRECTED_TRANSFORM = "rotate(-11deg) scale(1.2) translate(-8%,-3%)";
const CORRECT = FLY; // how long the correction takes to animate in

/* The desktop flight needs the two-page spread to exist, and it
   stops existing below this width: Register swaps to a completely
   different single-page book layout (@media max-width: 900px), so
   the measured destination rect no longer describes anything real.
   Below this width the mobile page turn runs instead.

   901 is deliberate — it is the first pixel above Register's
   `@media (max-width: 900px)` / MOBILE_BREAKPOINT = 900. If that
   breakpoint ever moves, move this with it.

   Note: Instructions itself hides .book below 1401px. Between
   901px and 1401px there is no source element, so `start` falls
   back to `page` and the flight silently collapses into a
   plain open-in-place. That is intentional. */
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

/* "flight"  desktop — closed book flies across, then opens
   "turn"    mobile  — a single page swings in from the right
   "skip"    reduced motion — no animation, straight to the reveal */
type Mode = "flight" | "turn" | "skip";

type Stage = "armed" | "flying" | "opening" | "turning" | "revealed";

type Props = {
  /* Cover has finished rotating — Registration reveals <Register /> */
  onOpened: () => void;
  /* Reveal has finished — Registration unmounts this overlay */
  onDone: () => void;
};

export default function Booktransition({ onOpened, onDone }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [stage, setStage] = useState<Stage>("armed");

  const sourceRef = useRef<HTMLElement | null>(null);

  /* ---------------- PICK A MODE, THEN MEASURE ----------------
     Only the desktop flight measures anything. It reads both ends
     of the flight off the real DOM / real CSS instead of hardcoding
     percentages, so the many breakpoints in Instructions.module.scss
     keep working.

     The mobile turn measures nothing: its page is positioned by CSS
     that mirrors .bookContainer's own mobile rules (see
     Booktransition.module.scss), which is the only way to land on
     top of an element sized in svh/vh/vw without guessing how the
     browser resolved those units. */

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      setMode("skip");

      onOpened();

      const skip = window.setTimeout(onDone, REVEAL);

      return () => window.clearTimeout(skip);
    }

    /* ---- MOBILE ---- nothing to measure, nothing to hide. */
    if (window.innerWidth < FLIGHT_MIN_WIDTH) {
      setMode("turn");

      return;
    }

    /* ---- DESKTOP ---- */
    setMode("flight");

    let cancelled = false;

    const source =
      document.querySelector<HTMLElement>("[data-book-start]") ??
      document.querySelector<HTMLElement>('img[alt="Frontend Goated"]');

    sourceRef.current = source;

    const spreadImage = new Image();
    spreadImage.src = openBook;

    const measure = () => {
      if (cancelled) return;

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
      cancelled = true;
      spreadImage.onload = null;

      if (sourceRef.current) sourceRef.current.style.visibility = "";
    };
  }, [onOpened, onDone]);

  /* ---------------- RUN THE TIMELINE ---------------- */

  useEffect(() => {
    const timers: number[] = [];

    if (mode === "turn") {
      timers.push(
        window.setTimeout(() => setStage("turning"), TURN_DELAY),
        window.setTimeout(() => {
          setStage("revealed");
          onOpened();
        }, TURN_DELAY + TURN + SETTLE),
        window.setTimeout(onDone, TURN_DELAY + TURN + SETTLE + REVEAL)
      );
    } else if (mode === "flight" && geo) {
      timers.push(
        window.setTimeout(() => setStage("flying"), FLY_DELAY),
        window.setTimeout(() => setStage("opening"), FLY_DELAY + FLY + HOLD),
        window.setTimeout(() => {
          setStage("revealed");
          onOpened();
        }, FLY_DELAY + FLY + HOLD + OPEN),
        window.setTimeout(onDone, FLY_DELAY + FLY + HOLD + OPEN + REVEAL)
      );
    }

    return () => timers.forEach(window.clearTimeout);
  }, [mode, geo, onOpened, onDone]);

  /* =====================================================
     MOBILE — ONE PAGE SWINGING IN FROM THE RIGHT

     .mobilePage is a copy of Register's mobile .bookContainer:
     same rect, same background-size / background-position, so
     when it lands at rotateY(0deg) it is sitting exactly where
     the real one is about to render and the cross-fade has
     nothing to move.

     Its transform-origin (set in the SCSS) is the spine — half
     of the painted spread — which is why the page swings in from
     off the right edge of the screen rather than from the middle.

     translateY(-50%) is part of .bookContainer's own mobile rule
     and has to be re-stated here because an inline transform
     replaces the one from the stylesheet.
     ===================================================== */

  if (mode === "turn") {
    const turning = stage !== "armed";

    return (
      <div
        className={`${styles.stage} ${styles.mobileStage}`}
        aria-hidden="true"
        style={{
          opacity: stage === "revealed" ? 0 : 1,
          transition: `opacity ${REVEAL}ms ease`,
        }}
      >
        <div
          className={styles.mobilePage}
          style={{
            backgroundImage: `url(${openBook})`,
            transform: `translateY(-50%) rotateY(${
              turning ? 0 : TURN_FROM
            }deg)`,
            opacity: turning ? 1 : 0,
            /* transform, opacity — order matches transition-property */
            transitionDuration: `${TURN}ms, ${TURN_FADE}ms`,
          }}
        />
      </div>
    );
  }

  /* =====================================================
     DESKTOP — unchanged
     ===================================================== */

  if (!geo) return null;

  const { start, page } = geo;

  const isOpen = stage === "opening" || stage === "revealed";

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
    <div
      className={styles.stage}
      aria-hidden="true"
      style={{
        /* Cross-fades into the real <Register /> that mounts
           underneath the moment the cover finishes opening. */
        opacity: stage === "revealed" ? 0 : 1,
        transition: `opacity ${REVEAL}ms ease`,
      }}
    >
      {/* RIGHT PAGE — under the cover the whole time, uncovered
          as the flap swings away. Right half of book.png.
          Only switched on once the flap is in place over it,
          so it never flashes at the destination mid-flight. */}
      <div
        className={styles.rightPage}
        style={{
          ...pageRect,
          backgroundImage: `url(${openBook})`,
          opacity: isOpen ? 1 : 0,
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
            closed cover, back face is the left page.

            IMPORTANT: this element's transform is reserved for
            the open/close rotateY animation only. Do not add any
            correction here for closedBook.png's tilted artwork —
            it would rotate .leftPage's back face too. That
            correction lives on .coverImage below instead. */}
        <div
          className={styles.flap}
          style={{
            transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
            transitionDuration: `${OPEN}ms`,
          }}
        >
          <div className={styles.cover}>
            {/* The counter-rotation + scale that corrects
                closedBook.png's tilt live on this inner layer,
                clipped by .cover's overflow: hidden, so they never
                touch .flap's transform. Starts at identity (frame
                one matches the plain source <img>, no pop) and
                animates into CORRECTED_TRANSFORM once the flight
                starts. */}
            <div
              className={styles.coverImage}
              style={{
                backgroundImage: `url(${closedBook})`,
                transform: stage === "armed" ? "none" : CORRECTED_TRANSFORM,
                transitionDuration: `${CORRECT}ms`,
              }}
            />
          </div>
          <div
            className={styles.leftPage}
            style={{ backgroundImage: `url(${openBook})` }}
          />
        </div>
      </div>
    </div>
  );
}