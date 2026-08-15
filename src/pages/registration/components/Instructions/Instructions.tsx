// import { forwardRef, useState } from "react";
// import styles from "./Instructions.module.scss";
// import { GoogleLogin } from "@react-oauth/google";
// import InstructionModal from "../InstructionModal/InstructionModal";

// // import Left from "/svgs/registration/leftarr.svg";
// // import Right from "/svgs/registration/rightarr.svg";
// interface InstructionsProps {
//   onGoogleSignIn: (response: any) => void;
// }

// const Instructions = ({ onGoogleSignIn }: InstructionsProps) => {
//   ({ onGoogleSignIn }, ref) => {
//     const [detailInst, setdetailInst] = useState(false);

    

//     return (
//       <>
//         {detailInst && (
//           <InstructionModal onCancel={() => setdetailInst(false)} />
//         )}
//         <div className={styles.content} ref={ref}>
//           <div className={styles.headingCont}>
//             <img src={null} alt="left" />
//             <h3 className={styles.heading}>INSTRUCTIONS</h3>
//             <img src={null} alt="right" />
//           </div>
//           <ul className={styles.instr}>
//             <li>
//               Complete the registration form with all required details. You'll
//               be able to login through your registered email id when required.
//             </li>
//             <li>All team members are required to register separately.</li>
//             <li>All prof shows are free. </li>
//             <li>
//               For further details contact, Ujjwal Kansal: <a href="tel:+919991520330">+91 99915 20330</a>,
//               Sneha: <a href="tel:+919026855597">+91 90268 55597</a>
//             </li>
//             <li>
//               For detailed Instructions{" "}
//               <span onClick={() => setdetailInst(true)}>click here</span>
//             </li>
//           </ul>

//            <div className={styles.googleButton}>
//         <GoogleLogin
//           onSuccess={onGoogleSignIn}
//           onError={() => console.log("Login Failed")}
//           theme="filled_blue"
//           shape="pill"
//           size="large"
//           text="signin_with"
//           width={window.innerWidth < 500 ? "200" : "350"}
//         />
//       </div>
//         </div>
//       </>
//     );
//   }
// }

// export default Instructions;



import { useState } from "react";
import styles from "./Instructions.module.scss";
import { GoogleLogin } from "@react-oauth/google";
import InstructionModal from "../InstructionModal/InstructionModal";
interface InstructionsProps {
  onGoogleSignIn: (response: any) => void;
}

const Instructions = ({ onGoogleSignIn }: InstructionsProps) => {
  const [detailInst, setdetailInst] = useState(false);

    return (
      <>
        {detailInst && (
          <InstructionModal onCancel={() => setdetailInst(false)} />
        )}
        <div className={styles.content} ref={ref}>
          <div className={styles.headingCont}>
            <img src={null} alt="left" />
            <h3 className={styles.heading}>INSTRUCTIONS</h3>
            <img src={null} alt="right" />
          </div>
          <ul className={styles.instr}>
            <li>
              Complete the registration form with all required details. You'll
              be able to login through your registered email id when required.
            </li>
            <li>All team members are required to register separately.</li>
            <li>All prof shows are free. </li>
            <li>
              For further details contact, Ujjwal Kansal: <a href="tel:+919991520330">+91 99915 20330</a>,
              Sneha: <a href="tel:+919026855597">+91 90268 55597</a>
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
            width={window.innerWidth < 500 ? "200" : "350"}
          />
        </div>
      </div>
      </>
    );
  }


export default Instructions;