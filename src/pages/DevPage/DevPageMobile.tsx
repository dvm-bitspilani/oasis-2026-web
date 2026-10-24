import { useRef, useState } from "react";
import type { MouseEvent, RefObject } from "react";
import CharacterMobile from "./CharacterMobile";
import { MEMBERS } from "./DevMembers";
import styles from "../../styles/DevPage/Devpagemobile.module.scss";
import bgphone from "../../assets/DevPage/bgphone.png";
import heading from "../../assets/DevPage/heading.png";
import Frontend from "../../assets/DevPage/Frontend.png";
import Backend from "../../assets/DevPage/Backend.png";
import Ui from "../../assets/DevPage/ui.png";
import BackButton from "../../assets/DevPage/BackButton.png";
import bgPink from "../../assets/DevPage/bpPink.png";
import bgPurple from "../../assets/DevPage/bgPurple.png";
import bgBlue from "../../assets/DevPage/bgBlue.png";
import image from "../../assets/DevPage/profile.png";
type Vertical = "Frontend" | "Backend" | "Ui";
type Direction = "left" | "right";
// Fixed cycle order for the ‹ › arrows
const VERTICAL_ORDER: Vertical[] = ["Frontend", "Backend", "Ui"];

// names + Instagram/LinkedIn links live in devMembers.ts (shared with desktop)
const VERTICAL_INFO: Record<
  Vertical,
  {
    label: string;
    background: string;
  }
> = {
  Frontend: { label: "Frontend", background: bgPink },
  Backend: { label: "Backend", background: bgBlue },
  Ui: { label: "UI/UX", background: bgPurple },
};

// ───────── CLICK ONLY ON THE VISIBLE CUSHION ─────────
// The cushion images overlap and have transparent corners, so a plain onClick fires for the
// whole rectangle. Instead ONE click handler asks, for each cushion (top-most first):
// "is the pixel under your finger actually part of the picture?"  Works with any rotation or size.
const ALPHA_MIN = 30; // 0-255. Pixels fainter than this count as empty (soft shadows etc.)
const pixelCache = new WeakMap<HTMLImageElement, ImageData>();

const readPixels = (img: HTMLImageElement): ImageData | null => {
  const cached = pixelCache.get(img);
  if (cached) return cached;
  if (!img.complete || img.naturalWidth === 0) return null; // not loaded yet: try again next tap
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixelCache.set(img, data);
    return data;
  } catch {
    return null;
  }
};

// x, y = screen position of the tap. Undo the image's rotation around its centre, convert to
// the picture's own pixel grid, and read that pixel's transparency.
const isOpaqueAt = (img: HTMLImageElement | null, x: number, y: number): boolean => {
  if (!img) return false;
  const pixels = readPixels(img);
  if (!pixels) return false;

  const box = img.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const t = getComputedStyle(img).transform;
  const m = t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
  const angle = Math.atan2(m.b, m.a);

  const w = img.offsetWidth;
  const h = img.offsetHeight;
  const dx = x - cx;
  const dy = y - cy;
  const lx = dx * Math.cos(angle) + dy * Math.sin(angle) + w / 2;
  const ly = -dx * Math.sin(angle) + dy * Math.cos(angle) + h / 2;
  if (lx < 0 || ly < 0 || lx >= w || ly >= h) return false;

  const px = Math.floor((lx / w) * pixels.width);
  const py = Math.floor((ly / h) * pixels.height);
  return pixels.data[(py * pixels.width + px) * 4 + 3] > ALPHA_MIN;
};

export default function DevPageMobile() {
  const [activeVertical, setActiveVertical] = useState<Vertical | null>(null);

  // While this is non-null, a curtain image of the NEXT vertical is sliding in over
  // the current page. When its CSS animation ends we swap activeVertical and clear it.
  const [transition, setTransition] = useState<{
    to: Vertical;
    direction: Direction;
  } | null>(null);

  // the scrolling box that holds ONLY the member cards — we reset it to the top after
  // each swap
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const goToVertical = (name: Vertical) => {
    setActiveVertical(name);
  };

  // the three cushion pictures, used to test which one was really tapped
  const frontendImgRef = useRef<HTMLImageElement | null>(null);
  const backendImgRef = useRef<HTMLImageElement | null>(null);
  const uiImgRef = useRef<HTMLImageElement | null>(null);

  const onCushionsClick = (e: MouseEvent<HTMLDivElement>) => {
    // keyboard / screen-reader activation (Enter on a focused button) has no tap position
    const btn = (e.target as HTMLElement).closest("button[data-vertical]") as HTMLElement | null;
    if (e.detail === 0 && btn) {
      goToVertical(btn.dataset.vertical as Vertical);
      return;
    }
    // top-most cushion first (the one drawn last is the one on top)
    const stack: [Vertical, RefObject<HTMLImageElement | null>][] = [
      ["Ui", uiImgRef],
      ["Backend", backendImgRef],
      ["Frontend", frontendImgRef],
    ];
    const hit = stack.find(([, ref]) => isOpaqueAt(ref.current, e.clientX, e.clientY));
    if (hit) goToVertical(hit[0]);
  };

  const goHome = () => {
    setTransition(null);
    setActiveVertical(null);
  };

  const step = (direction: -1 | 1) => {
    if (!activeVertical || transition) return; // ignore taps mid-transition

    const currentIndex = VERTICAL_ORDER.indexOf(activeVertical);
    const nextIndex =
      (currentIndex + direction + VERTICAL_ORDER.length) % VERTICAL_ORDER.length;

    setTransition({
      to: VERTICAL_ORDER[nextIndex],
      // › (next) -> curtain enters from the right, ‹ (previous) -> from the left
      direction: direction === 1 ? "right" : "left",
    });
  };

  const finishTransition = () => {
    if (!transition) return;
    setActiveVertical(transition.to);
    setTransition(null);
    scrollRef.current?.scrollTo({ top: 0 }); // next page starts at the top
  };

  // ---------------------------------------
  // HOME
  // ---------------------------------------

  if (!activeVertical) {
    return (
      <div className={styles.stage}>
        <img className={styles.backdrop} src={bgphone} alt="" />
        <div className={styles.wrapper}>
          <div className={styles.back}>
            <button className={styles.backButton} onClick={goHome} aria-hidden />
          </div>

          <div className={styles.heading}>
            <img src={heading} alt="Developers" />
          </div>

          {/* No onClick on the buttons: the ONE handler on this wrapper decides which cushion
              was really tapped (see isOpaqueAt above). */}
          <div className={styles.cushions} onClick={onCushionsClick}>
            <button className={styles.frontendCushion} data-vertical="Frontend">
              <img ref={frontendImgRef} src={Frontend} alt="Frontend" />
            </button>

            <div className={styles.bottomRow}>
              <button className={styles.backendCushion} data-vertical="Backend">
                <img ref={backendImgRef} src={Backend} alt="Backend" />
              </button>

              <button className={styles.uiCushion} data-vertical="Ui">
                <img ref={uiImgRef} src={Ui} alt="UI/UX" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // SINGLE VERTICAL
  // ---------------------------------------

  const info = VERTICAL_INFO[activeVertical];

  return (
    <div className={styles.stage}>
      <img className={styles.backdrop} src={info.background} alt="" />

      {/* pageFixed = this layer never scrolls. Back button, heading and the
          ‹ title › row stay put; only .gridScroll below scrolls. */}
      <div className={`${styles.wrapper} ${styles.pageFixed}`}>
        <div className={styles.back}>
          <button className={styles.backButton} onClick={goHome}>
            <img src={BackButton} alt="Back" />
          </button>
        </div>

        <div className={styles.heading}>
          <img src={heading} alt="Developers" />
        </div>

        <div className={styles.navRow}>
          <button
            className={styles.navArrow}
            onClick={() => step(-1)}
            disabled={!!transition}
            aria-label="Previous vertical"
          >
            ‹
          </button>

          <h2 className={styles.navTitle}>{info.label}</h2>

          <button
            className={styles.navArrow}
            onClick={() => step(1)}
            disabled={!!transition}
            aria-label="Next vertical"
          >
            ›
          </button>
        </div>

        {/* data-lenis-prevent + the stopPropagation handlers stop site-wide smooth-scroll
            libraries (Lenis etc.) from hijacking wheel/touch, so THIS box scrolls natively.
            It fills the space under the nav row and is the ONLY thing that scrolls. */}
        <div
          className={styles.gridScroll}
          ref={scrollRef}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* key = vertical, so the grid remounts (and fades in) after each swap */}
          <div className={styles.grid} key={activeVertical}>
            {MEMBERS[activeVertical].map((member) => (
              <CharacterMobile
                key={`${activeVertical}-${member.name}`}
                image={image}
                name={member.name}
                instagram={member.instagram}
                linkedin={member.linkedin}
              />
            ))}
          </div>
        </div>
      </div>

      {/* The sliding curtain. Same image + same sizing as the backdrop of the page it's
          about to become, so when it lands and the real page swaps in underneath,
          there's no visible jump. */}
      {transition && (
        <img
          src={VERTICAL_INFO[transition.to].background}
          alt=""
          className={`${styles.curtainOverlay} ${
            transition.direction === "right" ? styles.fromRight : styles.fromLeft
          }`}
          onAnimationEnd={finishTransition}
        />
      )}
    </div>
  );
}