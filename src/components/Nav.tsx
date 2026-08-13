import { NavLink, useLocation } from "react-router-dom";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import { useTransition } from "../context/TransitionProvider";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Contacts", to: "/about" },
  { label: "Events", to: "/about" },
  { label: "About Us", to: "/about" },
];

export default function Nav() {
  const { navigateWithTransition } = useTransition();
  const location = useLocation();

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
        <img src={navLine} />
        <img src={navLine} />
        <img src={navLine} />
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