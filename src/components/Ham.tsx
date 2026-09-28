import { NavLink } from "react-router-dom";
import bg from "../assets/ham/trunkBg.png";
import sandBottom from "../assets/ham/sandBottom.png";
import sandAbove from "../assets/ham/sandAbove.png";
import styles from "../styles/Ham.module.scss";
// import homeBg from "../assets/home/bg.jpg";
import board from "../assets/ham/board.png";
export default function Ham(){
  return (
    <div className={styles.container}>

      <div className={styles.bgWrapper}>
        <img src={bg} alt="image of a chest" />
      </div>

      <NavLink
        to="/comingSoon"
        className={styles.board}
      >
        <img src={board} alt="board" />
        <span>DEVELOPERS</span>
      </NavLink>

      <NavLink
        to="/comingSoon"
        className={styles.board1}
      >
        <img src={board} alt="board" />
        <span>WALL MAG</span>
      </NavLink>

      <NavLink
        to="/comingSoon"
        className={styles.board2}
      >
        <img src={board} alt="board" />
        <span>GALLERY</span>
      </NavLink>

      <NavLink
        to="/comingSoon"
        className={styles.board3}
      >
        <img src={board} alt="board" />
        <span>SPONSORS</span>
      </NavLink>

      <NavLink
        to="/comingSoon"
        className={styles.board4}
      >
        <img src={board} alt="board" />
        <span>MEDIA PARTNERS</span>
      </NavLink>

      <div className={styles.sandBottom}>
        <img src={sandBottom} alt="sand beneath the chest" />
      </div>

      <div className={styles.sandAbove}>
        <img src={sandAbove} alt="sand above the chest" />
      </div>

      {/* <div className={styles.bg}>
        <img src={homeBg} alt="background" />
      </div> */}

    </div>
  );
};