import { forwardRef, useState } from "react";
import styles from "./Instructions.module.scss";

import InstructionModal from "../InstructionModal/InstructionModal";

// import Left from "/svgs/registration/leftarr.svg";
// import Right from "/svgs/registration/rightarr.svg";

type PropsType = {
  onGoogleSignIn: () => void;
};

const Instructions = forwardRef<HTMLDivElement, PropsType>(
  ({ onGoogleSignIn }, ref) => {
    const [detailInst, setdetailInst] = useState(false);

    return (
      <>
        {detailInst && (
          <InstructionModal onCancel={() => setdetailInst(false)} />
        )}
        <div className={styles.content} ref={ref}>
          <div className={styles.headingCont}>
            <h3 className={styles.heading}>Registration</h3>
          </div>
          <h5>INSTRUCTIONS</h5>
          <ul className={styles.instr}>
            <li>
              Complete the registration form with all required details. You'll
              be able to login through your registered email id when required.
            </li>
            <li>All prof shows are free. </li>
            <li>All team members are required to register separately.</li>
            <li>
              For further details contact, Parimal: <a href="tel:8638304074">8638304074</a>,
              Ishita: <a href="tel:7804051996">7804051996</a>
            </li>
            <li>
              For detailed Instructions{" "}
              <span onClick={() => setdetailInst(true)}>click here</span>
            </li>
          </ul>

          <button className={styles.googleButton} onClick={onGoogleSignIn}>
          </button>
        </div>
      </>
    );
  }
);

export default Instructions;
