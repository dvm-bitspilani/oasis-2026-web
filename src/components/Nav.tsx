import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import { useTransition } from "../context/TransitionProvider";
import Ham from "./Ham";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "About Us", to: "/aboutUs" },
  { label: "Contact Us", to: "/contactus" },
];

// how long the page takes to zoom out before Ham appears
const ZOOM_MS = 600;

type Phase = "closed" | "zooming" | "open";

// the element that holds the whole app (gets scaled down)
const getRoot = () =>
  (document.getElementById("root") ||
    document.getElementById("__next") ||
    document.body.firstElementChild) as HTMLElement | null;

export default function Nav() {
  const { navigateWithTransition } = useTransition();

  const [phase, setPhase] = useState<Phase>("closed");
  const timer = useRef<number | undefined>(undefined);

  const isOpen = phase !== "closed";

  const openHam = () => {
    setPhase("zooming"); // 1) page zooms out
    timer.current = window.setTimeout(() => setPhase("open"), ZOOM_MS); // 2) Ham mounts (sand, then chest)
  };

  const closeHam = () => {
    window.clearTimeout(timer.current);
    setPhase("closed"); // page zooms back in
  };

  // zoom the whole page out while the menu is active
  useEffect(() => {
    const root = getRoot();
    if (!root) return;

    root.style.transformOrigin = "50% 50%";
    root.style.transition = `transform ${ZOOM_MS}ms cubic-bezier(0.65, 0, 0.35, 1), opacity ${ZOOM_MS}ms ease`;
    root.style.transform = isOpen ? "scale(0.6)" : "";
    root.style.opacity = isOpen ? "0" : "";

    // what shows behind the zoomed-out page
    document.body.style.background = isOpen ? "#000" : "";
  }, [isOpen]);

  // cleanup on unmount (route change, etc.)
  useEffect(() => {
    return () => {
      window.clearTimeout(timer.current);
      const root = getRoot();
      if (root) {
        root.style.transform = "";
        root.style.opacity = "";
        root.style.transition = "";
      }
      document.body.style.background = "";
    };
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string
  ) => {
    e.preventDefault();

    closeHam();
    navigateWithTransition(to);
  };

  return (
    <>
      <div className={styles.container}>
        {/* HAMBURGER / CLOSE BUTTON */}
        <button
          className={`${styles.circle} ${isOpen ? styles.circleOpen : ""}`}
          onClick={() => (isOpen ? closeHam() : openHam())}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <img src={navLine} alt="" />
          <img src={navLine} alt="" />
          <img src={navLine} alt="" />
        </button>

        {/* NORMAL NAVBAR */}
        <div
          className={`${styles.rectangle} ${
            isOpen ? styles.rectangleHidden : ""
          }`}
        >
          <div className={styles.mobileHomeNav}>
            <NavLink
              to="/"
              onClick={(e) => handleNavClick(e, "/")}
              className={`${styles.navLink} ${styles.mobileNavDecoration}`}
              aria-label="Home"
            />

            <NavLink
              to="/"
              onClick={(e) => handleNavClick(e, "/")}
              className={`${styles.navLink} ${styles.homeLink}`}
            >
              Home
            </NavLink>

            <NavLink
              to="/aboutUs"
              onClick={(e) => handleNavClick(e, "/aboutUs")}
              className={`${styles.navLink} ${styles.mobileNavDecoration}`}
              aria-label="About Us"
            />
          </div>

          <div className={styles.desktopLinks}>
            {LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={styles.navLink}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* HAM: rendered in a portal so it isn't scaled with the page */}
      {phase === "open" &&
        createPortal(
          <div className={styles.hamOverlay}>
            <button
              className={styles.hamClose}
              onClick={closeHam}
              aria-label="Close menu"
            >
              ✕
            </button>
            <Ham />
          </div>,
          document.body
        )}
    </>
  );
}