import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./BookTransition.module.scss";

import closedBook from "/closedBook.png";
import openBook from "../../assets/registration/reg/book.png";

/* Flip to true to trace the sequence in the console. */
const DEBUG = false;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log("[BookTransition]", ...args);
};

/* =====================================================
   WHY THERE ARE NO @keyframes IN THE STYLESHEET

   CSS Modules renames @keyframes to a hashed name and has
   to rewrite every animation-name that points at it. When
   that rewrite doesn't happen, animation-name refers to a
   keyframe set that no longer exists: the element snaps to
   its end state, no animation runs, and animationend never
   fires — which silently strands any JS sequenced on it.

   Every animation here is built with element.animate()
   instead. The keyframes are plain objects, so there is no
   name to resolve, no scoping to survive, and no custom
   property substitution that can invalidate a declaration.
   Sequencing uses the animations' own .finished promises.
   ===================================================== */

const FLY_DELAY = 350;
const FLY = 900;
const HOLD = 200;
const OPEN = 1000;
const REVEAL = 400;

/* How far into the swing the spread underneath fades up.

   The closed cover and the half-spread are not the same
   aspect ratio, so `contain` fits the artwork by height and
   leaves margin at the sides — no scale value closes all
   four edges, since filling the width would overflow the
   height. Rather than fight that, the spread stays hidden
   until the cover is visibly rotating, by which point the
   movement carries the eye and the mismatched edges never
   sit still long enough to read as wrong. */
const SPREAD_FADE_IN_AT = 110;

const FLY_EASE = "cubic-bezier(0.62, 0.02, 0.24, 1)";
const OPEN_EASE = "cubic-bezier(0.55, 0.05, 0.2, 1)";

/* closedBook.png is drawn on a tilt; this squares it up. */
const COVER_TILT = -11;

/* Squaring the artwork shrinks it inside the page rect,
   because the tilt leaves transparent margins. Nudge until
   the cover just overlaps the page edges — slightly too big
   is correct, it stops the spread peeking out underneath. */
const COVER_FIT = 1.06;

const FLIGHT_MIN_WIDTH = 901;

type Rect = { left: number; top: number; width: number; height: number };
type Geometry = { start: Rect; page: Rect };
type Props = {
  onOpened: () => void;
  onDone: () => void;
};

export default function BookTransition({ onOpened, onDone }: Props) {
  const [geo, setGeo] = useState<Geometry | null>(null);
  /* The only visual state React owns. Everything else is
     driven by the animations themselves. */
  const [spreadVisible, setSpreadVisible] = useState(false);

  const flightRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const sourceRef = useRef<HTMLElement | null>(null);
  const finishedRef = useRef(false);

  /* Keeps the callbacks fresh without re-running the
     animation effect, which would restart the sequence. */
  const callbacksRef = useRef({ onOpened, onDone });
  callbacksRef.current = { onOpened, onDone };

  /* ---------------- SCROLLBAR LOCK ---------------- */

  useEffect(() => {
    const root = document.documentElement;

    const previousBody = document.body.style.overflow;
    const previousRoot = root.style.overflow;

    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBody;
      root.style.overflow = previousRoot;
    };
  }, []);

  /* ---------------- MEASURE ---------------- */

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || window.innerWidth < FLIGHT_MIN_WIDTH) {
      log("skipping flight (reduced motion or narrow viewport)");
      callbacksRef.current.onOpened();
      window.setTimeout(() => callbacksRef.current.onDone(), REVEAL);
      return;
    }

    const source =
      document.querySelector<HTMLElement>("[data-book-start]") ??
      document.querySelector<HTMLElement>('img[alt="Frontend Goated"]');

    if (!source) {
      log("no source book found — add data-book-start to the Instructions img");
    }

    sourceRef.current = source;

    const spreadImage = new Image();
    spreadImage.src = openBook;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const boxWidth = vw * 0.75;
      const boxHeight = boxWidth / 1.4;

      const imageRatio =
        spreadImage.naturalWidth / spreadImage.naturalHeight || 1.4;

      const isWide = imageRatio > boxWidth / boxHeight;

      const spreadWidth = isWide ? boxWidth : boxHeight * imageRatio;
      const spreadHeight = isWide ? boxWidth / imageRatio : boxHeight;

      const spread: Rect = {
        left: vw / 2 - spreadWidth / 2,
        top: vh * 0.52 - spreadHeight / 2,
        width: spreadWidth,
        height: spreadHeight,
      };

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

      if (source) source.style.visibility = "hidden";

      log("measured", { start, page });

      setGeo({ start, page });
    };

    if (spreadImage.complete) measure();
    else spreadImage.onload = measure;

    return () => {
      if (sourceRef.current) sourceRef.current.style.visibility = "";
    };
  }, []);

  /* ---------------- RUN THE SEQUENCE ----------------
     useLayoutEffect so the animations exist before the
     browser paints the elements at their resting position —
     otherwise there is a single frame at the destination. */

  useLayoutEffect(() => {
    if (!geo) return;

    const flight = flightRef.current;
    const flap = flapRef.current;
    const cover = coverRef.current;

    if (!flight || !flap || !cover) return;

    const { start, page } = geo;

    const offsetX = start.left - page.left;
    const offsetY = start.top - page.top;
    const scaleX = start.width / page.width;
    const scaleY = start.height / page.height;

    let cancelled = false;

    /* FLIGHT — the flap is laid out at its destination and
       pushed back to the closed book's rect for frame one. */
    const flightAnimation = flight.animate(
      [
        {
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
        },
        { transform: "none" },
      ],
      { duration: FLY, delay: FLY_DELAY, easing: FLY_EASE, fill: "both" }
    );

    /* STRAIGHTEN — same delay, duration and easing, so the
       book squaring up reads as part of one movement. */
    const coverAnimation = cover.animate(
      [
        { transform: "rotate(0deg) scale(1)" },
        {
          transform: `rotate(${COVER_TILT}deg) scale(${COVER_FIT})`,
        },
      ],
      { duration: FLY, delay: FLY_DELAY, easing: FLY_EASE, fill: "both" }
    );

    let flipAnimation: Animation | null = null;
    let spreadTimer = 0;

    const finish = () => {
      if (finishedRef.current || cancelled) return;
      finishedRef.current = true;

      log("cover open -> revealing Register");

      callbacksRef.current.onOpened();
      window.setTimeout(() => callbacksRef.current.onDone(), REVEAL);
    };

    flightAnimation.finished
      .then(() => {
        if (cancelled) return;

        /* Cover has landed. Nothing is revealed yet — it just
           sits closed for a beat. */
        log("flight complete — holding closed");

        return new Promise((resolve) => window.setTimeout(resolve, HOLD));
      })
      .then(() => {
        if (cancelled) return;

        log("opening cover");

        flipAnimation = flap.animate(
          [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }],
          { duration: OPEN, easing: OPEN_EASE, fill: "forwards" }
        );

        /* Uncover the spread once the swing is visibly under
           way, so the cover's mismatched edges are never seen
           against a stationary page. */
        spreadTimer = window.setTimeout(() => {
          if (cancelled) return;
          log("uncovering spread");
          setSpreadVisible(true);
        }, SPREAD_FADE_IN_AT);

        return flipAnimation.finished;
      })
      .then(() => {
        if (cancelled) return;
        finish();
      })
      .catch(() => {
        /* cancel() on unmount rejects these — nothing to do */
      });

    /* Single safety net. If anything about the environment
       stops the promises resolving, the flow still advances
       rather than stranding the user on a closed book. */
    const watchdog = window.setTimeout(() => {
      if (!finishedRef.current) log("sequence stalled — watchdog");
      finish();
    }, FLY_DELAY + FLY + HOLD + OPEN + 400);

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      window.clearTimeout(spreadTimer);
      flightAnimation.cancel();
      coverAnimation.cancel();
      flipAnimation?.cancel();
    };
  }, [geo]);

  if (!geo) return null;

  const { page } = geo;

  const pageRect = {
    left: `${page.left}px`,
    top: `${page.top}px`,
    width: `${page.width}px`,
    height: `${page.height}px`,
  };

  return (
    <div className={styles.stage} aria-hidden="true">
      {/* THE SPREAD — stays hidden through the flight AND the
          closed beat, and fades up only once the cover is
          already swinging. */}
      <div
        className={styles.rightPage}
        style={{
          ...pageRect,
          backgroundImage: `url(${openBook})`,
          opacity: spreadVisible ? 1 : 0,
        }}
      />

      <div ref={flightRef} className={styles.flight} style={pageRect}>
        <div ref={flapRef} className={styles.flap}>
          <div
            ref={coverRef}
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