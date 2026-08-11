import { NavLink } from "react-router-dom"

import styles from "../styles/Nav.module.scss"
import navLine from "../assets/hamLine.svg"

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
                <NavLink to="/">Home</NavLink>
                <NavLink to="/">Contacts</NavLink>
                <NavLink to="/">Events</NavLink>
                <NavLink to="/">About Us</NavLink>
            </div>
        </div>
    )
}