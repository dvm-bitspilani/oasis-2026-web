import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import PageTransition from "./pageTransition/PageTransition";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Contacts", to: "/" },
  { label: "Events", to: "/" },
  { label: "About Us", to: "/about" },
];

export default function Nav() {
  const [transitioning, setTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string
  ) => {
    e.preventDefault();

    if (to === location.pathname || transitioning) return;

    setPendingPath(to);
    setTransitioning(true);
  };

  return (
    <>
      {transitioning && (
        <PageTransition
          onComplete={() => {
            if (pendingPath) navigate(pendingPath);
            setTransitioning(false);
            setPendingPath(null);
          }}
        />
      )}

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
    </>
  );
}