import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Instructions.module.scss";
import { GoogleLogin } from "@react-oauth/google";
import InstructionModal from "../InstructionModal/InstructionModal";

import leftbottom from "../../../../assets/registration/reg/leftbottom.png";
import rightbottom from "../../../../assets/registration/reg/rightbottom.png";
import lefttop from "../../../../assets/registration/reg/lefttop.png";
import righttop from "../../../../assets/registration/reg/righttop.png";
import rightmid from "../../../../assets/registration/reg/rightmid.png";
import book from "/closedBook.png";

/* Scroll slide-out. Runs at t=0 of the book timeline, so the
   scroll is on its way off screen while the book lifts off
   (Booktransition's FLY_DELAY is 350ms). */
const LEAVE_MS = 700;

interface InstructionsProps {
  onGoogleSignIn: (response: any) => void;

  /*
   * Set by Registration once the book transition starts. The scroll
   * and the back button clear out of the way; the book itself is
   * deliberately untouched, because Booktransition hides the real
   * element and takes over the flight with its own copy.
   */
  leaving?: boolean;
}

const Instructions = ({
  onGoogleSignIn,
  leaving = false,
}: InstructionsProps) => {
  const [detailInst, setdetailInst] = useState(false);

  function useWindowWidth() {
    // Initialize state with the current window width
    const [windowWidth, setWindowWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 0
    );

    useEffect(() => {
      // 1. Define the handler to update state
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      // 2. Add the event listener when the component mounts
      window.addEventListener("resize", handleResize);

      // 3. Clean up the listener when the component unmounts
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []); // Empty array ensures this effect only runs once on mount

    return windowWidth;
  }

  const isMobile = useWindowWidth() < 768;

  /* Neither .content nor .backButton set `transform` in the SCSS
     (the decorations use the standalone `scale:` property), so
     driving transform inline here is safe. */
  const leaveStyle = {
    transform: leaving ? "translateY(-120vh)" : "translateY(0)",
    opacity: leaving ? 0 : 1,
    transition: `transform ${LEAVE_MS}ms cubic-bezier(0.6, 0.01, 0.32, 1), opacity ${LEAVE_MS}ms ease`,
    pointerEvents: leaving ? ("none" as const) : ("auto" as const),
  };

  return (
    <>
      {detailInst && (
        <InstructionModal onCancel={() => setdetailInst(false)} />
      )}

      <img src={leftbottom} className={styles.leftbottom} alt="leftbottom" />
      <img src={lefttop} className={styles.lefttop} alt="lefttop" />
      <img src={rightbottom} className={styles.rightbottom} alt="rightbottom" />
      <img src={righttop} className={styles.righttop} alt="righttop" />
      <img src={rightmid} className={styles.rightmid} alt="rightmid" />

      {/* data-book-start is what Booktransition measures to find
          the origin of the flight. Do not remove it. */}
      <img
        src={book}
        className={styles.book}
        alt="Frontend Goated"
        data-book-start
      />

      <Link to="/" className={styles.backButton}>
        <img src="/regBackButton.png" alt="Go to Home Page" />
      </Link>

      <div className={styles.content} style={leaveStyle}>
        <div className={styles.headingCont}>
          <h3 className={styles.heading}>Registration</h3>
        </div>

        <h5>INSTRUCTIONS</h5>

        <ul className={styles.instr}>
          <li>
            Complete the registration form with all required details. You'll
            be able to login through your registered email id when required.
          </li>
          {/*<li>
            A College Representative (CR) will be appointed for
            each college who'll be responsible for allotting heads for
            all the societies the college will be participating for.
          </li>*/}
          <li>All prof shows are free. </li>
          <li>All team members are required to register separately.</li>
          <li>
            For further details contact, Devang:{" "}
            <a href="tel:+91 92574 91386">+91 92574 91386</a>, Sneha:{" "}
            <a href="tel:+91 90268 55597">+91 90268 55597</a>
          </li>
          <li>
            For detailed Instructions{" "}
            <span onClick={() => setdetailInst(true)}>click here</span>
          </li>
        </ul>

        <div className={styles.googleButton}>
          <GoogleLogin
            onSuccess={onGoogleSignIn}
            onError={() => console.log("Login Failed")}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="signin_with"
            width={isMobile ? 65 : 250}
          />
        </div>
      </div>
    </>
  );
};

export default Instructions;