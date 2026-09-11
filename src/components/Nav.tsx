import { NavLink } from "react-router-dom";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import navMob from "../assets/navMobNav.png";
import { useTransition } from "../context/TransitionProvider";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/comingsoon" },
  { label: "About Us", to: "/aboutUs" },
  { label: "Contact Us", to: "/comingsoon" },
   { label: "Reg", to: "/reg" },
];

export default function Nav() {
  const { navigateWithTransition } = useTransition();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string
  ) => {
    e.preventDefault();
    navigateWithTransition(to);
  };

  return (
    <div className={styles.container}>
      <div className={styles.circle}>
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
      </div>

      <div className={styles.rectangle}>
        <div className={styles.mobileHomeNav}>
          <NavLink
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={styles.mobileNavDecoration}
            aria-label="Home"
          >
            <img src={navMob} alt="" />
          </NavLink>

          <NavLink
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={styles.homeLink}
          >
            Home
          </NavLink>

          <NavLink
            to="/aboutUs"
            onClick={(e) => handleNavClick(e, "/aboutUs")}
            className={styles.mobileNavDecoration}
            aria-label="About Us"
          >
            <img src={navMob} alt="" />
          </NavLink>
        </div>

        <div className={styles.desktopLinks}>
          {LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={(e) => handleNavClick(e, link.to)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}