import { useRef, useState } from "react";

import CharacterMobile from "./CharacterMobile";
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

const VERTICAL_INFO: Record<
  Vertical,
  {
    label: string;
    background: string;
    members: { name: string }[];
  }
> = {
  Frontend: {
    label: "Frontend",
    background: bgPink,
    members: [
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
    ],
  },

  Backend: {
    label: "Backend",
    background: bgBlue,
    members: [
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
    ],
  },

  Ui: {
    label: "UI/UX",
    background: bgPurple,
    members: [
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
      { name: "Name Middle Surname" },
    ],
  },
};

export default function DevPageMobile() {
  const [activeVertical, setActiveVertical] = useState<Vertical | null>(null);

  // While this is non-null, a curtain image of the NEXT vertical is sliding in over
  // the current page. When its CSS animation ends we swap activeVertical and clear it.
  const [transition, setTransition] = useState<{
    to: Vertical;
    direction: Direction;
  } | null>(null);

  // the scrolling layer of the vertical view — we reset it to the top after each swap
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const goToVertical = (name: Vertical) => {
    setActiveVertical(name);
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

        <div className={styles.cushions}>
          <button
            className={styles.frontendCushion}
            onClick={() => goToVertical("Frontend")}
          >
            <img src={Frontend} alt="Frontend" />
          </button>

          <div className={styles.bottomRow}>
            <button
              className={styles.backendCushion}
              onClick={() => goToVertical("Backend")}
            >
              <img src={Backend} alt="Backend" />
            </button>

            <button
              className={styles.uiCushion}
              onClick={() => goToVertical("Ui")}
            >
              <img src={Ui} alt="UI/UX" />
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
      {/* data-lenis-prevent + the stopPropagation handlers stop site-wide smooth-scroll
          libraries (Lenis etc.) from hijacking wheel/touch, so THIS box scrolls natively */}
      <div
        className={styles.wrapper}
        ref={scrollRef}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
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

      {/* key = vertical, so the grid remounts (and fades in) after each swap */}
      <div className={styles.grid} key={activeVertical}>
        {info.members.map((member, i) => (
          <CharacterMobile
            key={`${activeVertical}-${i}`}
            image={image}
            name={member.name}
          />
        ))}
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