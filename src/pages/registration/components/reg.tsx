import React from 'react';
import styles from "./reg.module.scss";
import RegBg from "../../../assets/registration/reg/RegBg.png";
import leftbottom from "../../../assets/registration/reg/leftbottom.png"
import rightbottom from "../../../assets/registration/reg/rightbottom.png"
import lefttop from "../../../assets/registration/reg/lefttop.png"
import righttop from "../../../assets/registration/reg/righttop.png"
import book from "../../../assets/registration/reg/book.png"
import 
export default function Reg() {
  return (
    <div className={styles.registerContainer} 
     style={{backgroundImage:`url(${RegBg})`}}
    >
        <img src={leftbottom} className={styles.leftbottom} alt="leftbottom" />
        <img src={lefttop} className={styles.lefttop} alt="lefttop" />
        <img src={rightbottom} className={styles.rightbottom} alt="rightbottom" />
        <img src={righttop} className={styles.righttop} alt="righttop" />
        <div className={styles.bookContainer} style={{backgroundImage:`url(${book})`}}>
               <form action=""></form>
               vhvbk
        </div>
 
    </div>
  )
}
