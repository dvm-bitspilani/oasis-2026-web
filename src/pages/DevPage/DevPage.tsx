import React from 'react'
import {useState,useRef} from 'react'
import gsap from "gsap"; 
import bg from "../../assets/DevPage/bg.png"
import heading from "../../assets/DevPage/heading.png"
import styles from "../../styles/DevPage/DevPage.module.scss"
import Frontend from "../../assets/DevPage/Frontend.png"
import Backend from "../../assets/DevPage/Backend.png"
import Ui from "../../assets/DevPage/ui.png"
import BackButton from "../../assets/DevPage/BackButton.png"
import bgPink from "../../assets/DevPage/bpPink.png"
export default function DevPage() {
     const [activeVertical, setActiveVertical] = useState<string | null>(null);
     const curtainRef = useRef<HTMLImageElement |null>(null);
     const handleFrontendClick=()=>{
     if(!curtainRef.current) return;
  setActiveVertical("Frontend");

   
     gsap.fromTo(curtainRef.current,
        {
      x: "80%",
      rotation: 5,
   
    },
        {
        x:"0%",
        rotateZ:"0",
        duration:3.2,
        height:"100vh",

        ease:"power3.inOut",
     });
     };

  return (
    <div
    className={styles.wrapper}
     style={{ backgroundImage: `url(${bg})` }}
    >
        <div className={styles.heading}>
            <img src={heading}/>
        </div>
        <div className={styles.cushion}>
            <button  className={(`${styles.FrontendButton} ${styles.cushionButton}`)} onClick={handleFrontendClick}>
            <img  className={styles.Frontend} src={Frontend} alt="Frontend" />
            </button>
              <button  className={(`${styles.BackendButton} ${styles.cushionButton}`)} onClick={()=>{setActiveVertical("Backend")}}>
            <img  className={styles.Backend} src={Backend} alt="Backend" />
            </button>
            <button  className={(`${styles.UiButton} ${styles.cushionButton}`)} onClick={()=>{setActiveVertical("Ui")}}>
            <img  className={styles.Ui} src={Ui} alt="ui"/>
            </button>
        </div>
        <div className={styles.back}>
            <button className={styles.BackButton}>
                <img  className={styles.backImg} src={BackButton} alt="Back" />
            </button>
        </div>
        <div className={styles.curtainOverlay}>
          <img ref={curtainRef} className={styles.pinkCurtain} src={bgPink} alt="curtainPink" />
        </div>
    </div>
  )
}
