import { NavLink } from "react-router-dom";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import { useTransition } from "../context/TransitionProvider";
import navMobile from "../assets/navMobile.png";
import navMobNav from "../assets/navMobNav.png";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Contacts", to: "/comingsoon" },
  { label: "Events", to: "/comingsoon" },
  { label: "About Us", to: "/about" },
  { label: "Register", to: "/register" },
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
    <div
      className={styles.container}
      style={
        {
          "--nav-mobile-bg": `url(${navMobile})`,
          "--nav-mobile-nav-decor": `url(${navMobNav})`,
        } as React.CSSProperties
      }
    >
      <div className={styles.circle}>
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
        <img src={navLine} alt="" />
      </div>

      <div className={styles.rectangle}>
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
  );
}