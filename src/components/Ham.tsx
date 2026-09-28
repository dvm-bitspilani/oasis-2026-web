import { NavLink } from "react-router-dom";
import type { CSSProperties } from "react";
import bg from "../assets/ham/trunkOnly.png";
import sandBottom from "../assets/ham/sandBottom.png";
import sandAbove from "../assets/ham/sandAbove.png";
import board from "../assets/ham/board.png";
import styles from "../styles/Ham.module.scss";
import guitarBook from "../assets/ham/guitarBook.png";
import trunkStuff from "../assets/ham/trunkStuff.png";
// import bgHome from "../assets/home/bg.jpg"
const BOARDS = [
    { label: "DEVELOPERS", pos: "board", to: "/comingSoon" },
    { label: "WALL MAG", pos: "board1", to: "/comingSoon" },
    { label: "SPONSORS", pos: "board3", to: "/comingSoon" },
    { label: "GALLERY", pos: "board2", to: "/comingSoon" },
    { label: "MEDIA PARTNERS", pos: "board4", to: "/comingSoon" },
];

export default function Ham() {
    return (
        <div className={styles.container}>
            {/* chest front stays put, chest top (lid + contents) swings open */}
            <div className={styles.chestBase} aria-hidden="true">
                <img src={bg} alt="" />
            </div>
            <div className={styles.chestTop}>
                <img src={bg} alt="An open treasure chest full of scrolls, a lantern and a book" />
            </div>
            <div className={styles.guitarBook}>
                <img src={guitarBook} alt="" />
            </div>
            <div className={styles.trunkStuff}>
                <img src={trunkStuff} alt="" />
            </div>

            <nav className={styles.boards} aria-label="Sections">
                {BOARDS.map((b, i) => (
                    <NavLink
                        key={b.label}
                        to={b.to}
                        className={`${styles.sign} ${styles[b.pos]}`}
                        style={{ "--i": i } as CSSProperties}
                    >
                        <div className={styles.plank}>
                            <img src={board} alt="" />
                            <span>{b.label}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.sandBottom}>
                <img src={sandBottom} alt="" />
            </div>
            {/* <div className={styles.bgHome}>
                <img src={bgHome} alt="" />
            </div> */}

            <div className={styles.sandAbove}>
                <img src={sandAbove} alt="" />
            </div>
        </div>
    );
}