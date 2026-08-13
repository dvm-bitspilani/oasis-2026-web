import { useEffect, useRef } from "react";
import gsap from "gsap";

import styles from "../styles/Home.module.scss";
import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg";
import sandImg from "../assets/sand.png";
import cloudSmall from "../assets/cloudSmall.svg";
import cloudBig from "../assets/cloudBig.svg";
import cloudThree from "../assets/cloudThree.svg";
import Castle from "../assets/Castle.png";
import Moon from "../assets/Moon.png";
import LogoOasis from "../assets/LogoOasisi.png";
import RegBtn from "../assets/registerBtn.png";
import Nav from "../components/Nav";
import ShootingStars from "../components/ShootingStars";
import camelLand from "../assets/camelLand.png";

type Cloud = {
  src: string;
  top: string;
  left: string;
  width: string;
  duration: number;
};

const CLOUDS: Cloud[] = [
  { src: cloudSmall, top: "35%", left: "-20%", width: "20%", duration: 240 },
  { src: cloudBig, top: "12%", left: "10%", width: "24%", duration: 320 },
  { src: cloudThree, top: "22%", left: "40%", width: "18%", duration: 200 },
  { src: cloudSmall, top: "42%", left: "65%", width: "15%", duration: 180 },
  { src: cloudBig, top: "8%", left: "90%", width: "22%", duration: 380 },
];

export default function Home() {
  const cloudsRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cloudRefs.current.forEach((cloud, i) => {
        if (!cloud) return;

        const width = cloud.offsetWidth;
        const left = cloud.offsetLeft;
        const min = -left - width;
        const max = window.innerWidth - left;

        gsap.to(cloud, {
          x: `+=${max - min}`,
          duration: CLOUDS[i].duration,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) =>
              gsap.utils.wrap(min, max, parseFloat(x)),
            ),
          },
        });
      });
    }, cloudsRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.container}>
      <div data-transition-fade>
        <Nav />
      </div>

      <div
        className={styles.background}
        style={{ backgroundImage: `url(${bg})` }}
      />

      <ShootingStars />

      <div className={styles.sand} data-sand-parallax>
        <img src={sandImg} className={styles.sandImg} alt="" />
      </div>

      <div className={styles.castle} data-castle-drown>
        <img src={Castle} className={styles.castleImg} alt="" />
      </div>

      <div className={styles.clouds} ref={cloudsRef}>
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={styles.cloud}
            data-cloud-string
            style={{ top: c.top, left: c.left, width: c.width }}
            ref={(el) => {
              cloudRefs.current[i] = el;
            }}
          >
            <img src={c.src} alt="" />
          </div>
        ))}
      </div>

      <div className={styles.moon} data-moon-shrink>
        <img src={Moon} className={styles.moonImg} alt="" />
      </div>

      <div className={styles.oasisLogo} data-transition-fade>
        <img src={LogoOasis} alt="" />
      </div>

      <div className={styles.regBtn} data-transition-fade>
        <img src={RegBtn} alt="" />
      </div>

      <div className={styles.camelLand} data-transition-fade>
        <img src={camelLand} alt="" />
      </div>
    </div>
  );
}
