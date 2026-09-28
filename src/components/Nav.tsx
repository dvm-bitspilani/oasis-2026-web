import { NavLink } from "react-router-dom";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import { useTransition } from "../context/TransitionProvider";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "About Us", to: "/aboutUs" },
  { label: "Contact Us", to: "/contactus" },
];

export default function Nav() {
  const { navigateWithTransition } = useTransition();

  const handleNavClick = (e, to) => {
    e.preventDefault();
    navigateWithTransition(to);
  };

  return (
    <div className={styles.container}>

      {/* Hamburger / Ham button */}
      <NavLink
        to="/ham"
        onClick={(e) => handleNavClick(e, "/ham")}
        className={styles.circle}
        aria-label="Open menu"
      >
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
      </NavLink>

      <div className={styles.rectangle}>

        {/* Mobile navigation */}
        <div className={styles.mobileHomeNav}>

          <NavLink
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={`${styles.navLink} ${styles.mobileNavDecoration}`}
            aria-label="Home"
          >
          </NavLink>

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
          >
          </NavLink>

        </div>

        {/* Desktop navigation */}
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
  );
}