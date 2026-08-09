import styles from "../styles/Nav.module.scss"
import navLine from "../assets/hamLine.svg"
import { useRef , useEffect } from  'react'
import gsap from "gsap";
export default function Nav(){
    return (
        <div className={styles.container}>
            <div className={styles.circle} >
                <img src={navLine} />
                <img src={navLine} />
                <img src={navLine} />   
            </div>
            <div
                className={styles.rectangle}
            >
                <div>home</div>
                <div>contact</div>
                <div>events</div>
                <div>about us</div>
            </div>
        </div>
    )
}