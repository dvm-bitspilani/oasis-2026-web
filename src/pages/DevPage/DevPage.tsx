import React from 'react'
import {useState} from 'react'
import bg from "../../assets/DevPage/bg.png"
import heading from "../../assets/DevPage/heading.png"
import styles from "../../styles/DevPage/DevPage.module.scss"
import Frontend from "../../assets/DevPage/Frontend.png"
import Backend from "../../assets/DevPage/Backend.png"
import Ui from "../../assets/DevPage/ui.png"
import BackButton from "../../assets/DevPage/BackButton.png"
export default function DevPage() {

     const [activeVertical, setActiveVertical] = useState<string | null>(null);
  return (
    <div
    className={styles.wrapper}
     style={{ backgroundImage: `url(${bg})` }}
    >
        <div className={styles.heading}>
            <img src={heading}/>
        </div>
        <div className={styles.cushion}>
            <button  className={(`${styles.FrontendButton} ${styles.cushionButton}`)} onClick={()=>{setActiveVertical("Frontend")}}>
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
    </div>
  )
}
