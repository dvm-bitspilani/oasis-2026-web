import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Instructions.module.scss";

import InstructionModal from "../InstructionModal/InstructionModal";
const leftbottom =
  new URL("../../../../assets/registration/reg/leftbottom.png", import.meta.url).href;

const rightbottom =
  new URL("../../../../assets/registration/reg/rightbottom.png", import.meta.url).href;

const lefttop =
  new URL("../../../../assets/registration/reg/lefttop.png", import.meta.url).href;

const righttop =
  new URL("../../../../assets/registration/reg/righttop.png", import.meta.url).href;

const rightmid =
  new URL("../../../../assets/registration/reg/rightmid.png", import.meta.url).href;

const book =
  new URL("../../../../assets/registration/reg/closedBook.webp", import.meta.url).href;

const backBtn =
  new URL("../../../../assets/registration/reg/regBackButton.webp", import.meta.url).href;
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
        <img src={backBtn} alt="Go to Home Page" />
      </Link>

      <div className={styles.content} style={leaveStyle}>
        <div className={styles.headingCont}>
          <h3 className={styles.heading}>Registration</h3>
        </div>

        <h5>INSTRUCTIONS</h5>

        <ul className={styles.instr}>
          <li>
            Explore this local demo with prefilled sample details. Do not enter personal information. No account, payment, booking or email is created.
          </li>
          {/*<li>
            A College Representative (CR) will be appointed for
            each college who'll be responsible for allotting heads for
            all the societies the college will be participating for.
          </li>*/}
          <li>This is a portfolio archive, not current registration.</li>
          <li>Selections and details stay in memory; refresh resets the demo.</li>
          <li>
            For further details contact, Srihans:{" "}
            <a href="tel:+91 90003 69723">+91 90003 69723</a>, Sneha:{" "}
            <a href="tel:+91 90268 55597">+91 90268 55597</a>
          </li>
          <li>
            For detailed Instructions{" "}
            <span onClick={() => setdetailInst(true)}>click here</span>
          </li>
        </ul>

        <div className={styles.googleButton}>
          <button onClick={() => onGoogleSignIn({})}>Continue with sample identity</button>
        </div>
      </div>
    </>
  );
};

export default Instructions;