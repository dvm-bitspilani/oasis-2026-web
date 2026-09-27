import React, { useState } from "react";

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

// Fixed cycle order for the ‹ › arrows
const VERTICAL_ORDER: Vertical[] = [
  "Frontend",
  "Backend",
  "Ui",
];

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
  const [activeVertical, setActiveVertical] =
    useState<Vertical | null>(null);

  const goToVertical = (name: Vertical) => {
    setActiveVertical(name);
  };

  const goHome = () => {
    setActiveVertical(null);
  };

  const step = (direction: -1 | 1) => {
    if (!activeVertical) return;

    const currentIndex =
      VERTICAL_ORDER.indexOf(activeVertical);

    const nextIndex =
      (currentIndex +
        direction +
        VERTICAL_ORDER.length) %
      VERTICAL_ORDER.length;

    setActiveVertical(VERTICAL_ORDER[nextIndex]);
  };

  // ---------------------------------------
  // HOME
  // ---------------------------------------

  if (!activeVertical) {
    return (
      <div
        className={styles.wrapper}
        style={{
          backgroundImage: `url(${bgphone})`,
        }}
      >
        <div className={styles.back}>
          <button
            className={styles.backButton}
            onClick={goHome}
            aria-hidden
          />
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
    );
  }

  // ---------------------------------------
  // SINGLE VERTICAL
  // ---------------------------------------

  const info = VERTICAL_INFO[activeVertical];

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundImage: `url(${info.background})`,
      }}
    >
      <div className={styles.back}>
        <button
          className={styles.backButton}
          onClick={goHome}
        >
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
          aria-label="Previous vertical"
        >
          ‹
        </button>

        <h2 className={styles.navTitle}>
          {info.label}
        </h2>

        <button
          className={styles.navArrow}
          onClick={() => step(1)}
          aria-label="Next vertical"
        >
          ›
        </button>
      </div>

      <div className={styles.grid}>
        {info.members.map((member, i) => (
          <CharacterMobile
            key={`${activeVertical}-${i}`}
            image={image}
            name={member.name}
          />
        ))}
      </div>
    </div>
  );
}