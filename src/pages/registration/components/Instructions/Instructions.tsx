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



import { useState,useEffect } from "react";
import { Link } from "react-router-dom"
import styles from "./Instructions.module.scss";
import { GoogleLogin } from "@react-oauth/google";
import InstructionModal from "../InstructionModal/InstructionModal";

import leftbottom from "../../../../assets/registration/reg/leftbottom.png"
import rightbottom from "../../../../assets/registration/reg/rightbottom.png"
import lefttop from "../../../../assets/registration/reg/lefttop.png"
import righttop from "../../../../assets/registration/reg/righttop.png"
import rightmid from "../../../../assets/registration/reg/rightmid.png"
import book from "/closedBook.png"

interface InstructionsProps {
  onGoogleSignIn: (response: any) => void;
}

const Instructions = ({ onGoogleSignIn }: InstructionsProps) => {
  const [detailInst, setdetailInst] = useState(false);

  function useWindowWidth() {
    // Initialize state with the current window width
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
      // 1. Define the handler to update state
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      // 2. Add the event listener when the component mounts
      window.addEventListener('resize', handleResize);

      // 3. Clean up the listener when the component unmounts
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []); // Empty array ensures this effect only runs once on mount

    return windowWidth;
  }

  const isMobile = useWindowWidth() < 768;

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
        <img src={book} className={styles.book} alt="Frontend Goated" data-book-start />
        <Link to="/" className={styles.backButton}><img src="/regBackButton.png" alt="Go to Home Page" /></Link>
        <div className={styles.content}>
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
              For further details contact, Sneha: <a href="tel:9026855597">9026855597</a>,
              Devang: <a href="tel:9257491386">9257491386</a>
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
  }
export default Instructions;