import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "../styles/Nav.module.scss";
import navLine from "../assets/hamLine.svg";
import PageTransition from "./pageTransition/PageTransition";

export default function Nav() {
  const [clicked, setClicked] = useState(false);

  const toggleClicked = () => {
    setClicked((prev) => !prev);
  };

  return (
    <>
      {clicked && <PageTransition />}

      <div className={styles.container}>
        <div className={styles.circle}>
          <img src={navLine} />
          <img src={navLine} />
          <img src={navLine} />
        </div>

        <div className={styles.rectangle}>
          <NavLink to="/" onClick={toggleClicked}>
            Home
          </NavLink>

          <NavLink to="/" onClick={toggleClicked}>
            Contacts
          </NavLink>

          <NavLink to="/" onClick={toggleClicked}>
            Events
          </NavLink>

          <NavLink to="/" onClick={toggleClicked}>
            About Us
          </NavLink>
        </div>
      </div>
    </>
  );
}