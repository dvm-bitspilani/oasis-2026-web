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

// =====================================================
// DEV ONLY — BACKEND BYPASS
// Shows a plain "skip sign-in" button and also lets a failed Google
// login fall through, so the flow is reachable even if OAuth itself
// is misconfigured.
// TODO: SET BACK TO false BEFORE DEPLOYING.
// (Keep this in sync with DEV_BYPASS inside Registration.tsx)
// =====================================================
const DEV_BYPASS = true;

/* Scroll slide-out. Runs at t=0 of the book timeline, so the
   scroll is on its way off screen while the book lifts off
   (BookTransition's FLY_DELAY is 350ms). */
const LEAVE_MS = 700;

interface InstructionsProps {
  onGoogleSignIn: (response: any) => void;

  /*
   * Set by Registration once the book transition starts. The scroll
   * and the back button clear out of the way; the book itself is
   * deliberately untouched, because BookTransition hides the real
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

      {/* data-book-start is what BookTransition measures to find
          the origin of the flight. Do not remove it. */}
      <img
        src={book}
        className={styles.book}
        alt="Frontend Goated"
        data-book-start
      />

      <Link to="/" className={styles.backButton} style={leaveStyle}>
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
            For further details contact, Parimal:{" "}
            <a href="tel:8638304074">8638304074</a>, Ishita:{" "}
            <a href="tel:7804051996">7804051996</a>
          </li>
          <li>
            For detailed Instructions{" "}
            <span onClick={() => setdetailInst(true)}>click here</span>
          </li>
        </ul>

        <div className={styles.googleButton}>
          <GoogleLogin
            onSuccess={onGoogleSignIn}
            onError={() => {
              console.log("Login Failed");

              if (DEV_BYPASS) {
                onGoogleSignIn({ credential: "dev-token" });
              }
            }}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="signin_with"
            width={isMobile ? 65 : 250}
          />
        </div>

        {/* Deliberately OUTSIDE .googleButton — that box is a fixed
            3.216vw tall and sets overflow: hidden, so anything nested
            inside it gets clipped out of sight. */}
        {DEV_BYPASS && (
          <button
            type="button"
            onClick={() => onGoogleSignIn({ credential: "dev-token" })}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              border: "1px dashed red",
              background: "transparent",
              color: "red",
              fontSize: "0.8rem",
              zIndex: 500,
            }}
          >
            DEV: skip sign-in →
          </button>
        )}
      </div>
    </>
  );
};

export default Instructions;