

import "../styles/About.module.scss";
import styles from "../styles/About.module.scss";
import bg from "../assets/about/bgf.png";
import cloud from "../assets/about/cloud.png";
import backBg from "../assets/about/bgBottom.png";
import leftCloud from "../assets/about/leftCloud.png";
import midCloud from "../assets/about/midCloud.png";
import leftTop from "../assets/about/leftTop.png";
import pillar from "../assets/about/pillar.png";
import head from "../assets/about/head.png"
import lamp from "../assets/about/lamp.png"
import bgCon from "../assets/about/bgCont.png"
import play from "../assets/about/play.png"
import { useState } from "react"
const SvgImg = ({
  src,
  fit = "contain",
}: {
  src: string;
  fit?: "contain" | "cover";
}) => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
    <image
      href={src}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
    />
  </svg>
);

const About = () => {
  const [clicked, setClicked] = useState(false)
  console.log(window.innerHeight, window.innerWidth)
  function clickHandler() {
    setClicked(prev => !prev)
  }
  return (

    <div className={styles.about} style={{ backgroundImage: `url(${bg})` }}>
      {!clicked && <div className={styles.cloud}>
        <SvgImg src={cloud} />
        <div onClick={clickHandler} className={styles.play}>
          <SvgImg src={play} />
        </div>
        <div className={styles.text}>
          Oasis, the annual cultural extravaganza of Birla Institute of Technology and Science, Pilani, has been a vibrant part of India's cultural tapestry since 1971. Managed entirely by students, it's a dazzling showcase of talent in Dance, Drama, Literature, Comedy, Fashion, and Music. It's where dreams come alive, laughter fills the air, and creativity knows no bounds. Step into the world of Oasis, where youth's boundless potential shines...
        </div>
      </div>}

      {clicked && 
        <div className={styles.video} style={{ backgroundImage: `url(${bgCon})` }}>

          </div>
    }



      {/* footer element — plain img, preserves its own aspect ratio */}
      {!clicked && (
  <div className={styles.bgBottom}>
    <img src={backBg} alt="" />
  </div>
)}
      <div className={styles.leftCloud}>
        <SvgImg src={leftCloud} />
      </div>
      <div className={styles.midCloud}>
        <SvgImg src={midCloud} />
      </div>
      <div className={styles.head}>
        <SvgImg src={head} />
      </div>
      <div className={styles.leftTop}>
        <SvgImg src={leftTop} />
      </div>

      <div className={styles.rightCloud}>
        <SvgImg src={leftCloud} />
      </div>
      <div className={styles.midCloudR}>
        <SvgImg src={midCloud} />
      </div>
      <div className={styles.rightTop}>
        <SvgImg src={leftTop} />
      </div>

      <div className={styles.pillar}>
        <SvgImg src={pillar} />
      </div>

      <div className={styles.pillarR}>
        <SvgImg src={pillar} />
      </div>
      <div className={styles.lamp}>
        <SvgImg src={lamp} />
      </div>
      <div className={styles.lampR}>
        <SvgImg src={lamp} />
      </div>

    </div>
  );
};

export default About;
