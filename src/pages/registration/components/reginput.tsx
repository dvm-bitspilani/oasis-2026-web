import React from 'react'
import styles from "./reginput.module.scss";
import inputBg from "../../../assets/registration/reg/inputBg.png";
export default function reginput() {
  return (
    <div className={styles.registerContainer} 
     style={{backgroundImage:`url(${inputBg})`}}
    >
      <input type="text" />
    </div>
  )
}
