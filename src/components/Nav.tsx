import { NavLink } from "react-router-dom";
import { useState } from "react";

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

export default function Nav() {
  const { navigateWithTransition } = useTransition();

  const [hamOpen, setHamOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string
  ) => {
    e.preventDefault();

    setHamOpen(false);
    navigateWithTransition(to);
  };

  return (
    <>
      <div className={styles.container}>

        {/* HAMBURGER / CLOSE BUTTON */}
        <button
          className={`${styles.circle} ${
            hamOpen ? styles.circleOpen : ""
          }`}
          onClick={() => setHamOpen((prev) => !prev)}
          aria-label={hamOpen ? "Close menu" : "Open menu"}
        >
          <img src={navLine} alt="" />
          <img src={navLine} alt="" />
          <img src={navLine} alt="" />
        </button>

        {/* NORMAL NAVBAR */}
        <div
          className={`${styles.rectangle} ${
            hamOpen ? styles.rectangleHidden : ""
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

      {/* HAM */}
      {hamOpen && (
        <div className={styles.hamOverlay}>
          <Ham />
        </div>
      )}
    </>
  );
}