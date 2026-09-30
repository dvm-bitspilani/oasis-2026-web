import { useEffect, useRef } from "react";

import gsap from "gsap";

import styles from "../styles/ComingSoon.module.scss";

const bg =
  new URL("../assets/home/bg.jpg", import.meta.url).href;

import sandImg from "../assets/Sand2.png" 

const cloudSmall =
  new URL("../assets/home/cloudSmall.svg", import.meta.url).href;

const cloudBig =
  new URL("../assets/home/cloudBig.svg", import.meta.url).href;

const cloudThree =
  new URL("../assets/home/cloudThree.svg", import.meta.url).href;

const Moon =
  new URL("../assets/Moon.png", import.meta.url).href;

import ShootingStars from "../components/ShootingStars";

import { useTransition } from "../context/TransitionProvider";

import goHomeIcon from "../assets/goHome.svg";
type Cloud = {
  id: string;
  src: string;
  top: string;
  left: string;
  width: string;
  duration: number;
};

const CLOUDS: Cloud[] = [
  {
    id: "small-1",
    src: cloudSmall,
    top: "35%",
    left: "-20%",
    width: "20%",
    duration: 240,
  },
  {
    id: "big-1",
    src: cloudBig,
    top: "12%",
    left: "10%",
    width: "24%",
    duration: 320,
  },
  {
    id: "three-1",
    src: cloudThree,
    top: "22%",
    left: "40%",
    width: "18%",
    duration: 200,
  },
  {
    id: "small-2",
    src: cloudSmall,
    top: "42%",
    left: "65%",
    width: "15%",
    duration: 180,
  },
  {
    id: "big-2",
    src: cloudBig,
    top: "8%",
    left: "90%",
    width: "22%",
    duration: 380,
  },
];

export default function ComingSoon() {
  const cloudsRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { navigateWithTransition } = useTransition();

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

  const handleGoHomeClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();

    // navigateWithTransition internally calls markEntered()
    // before navigating, so Home will never show the intro
    // preloader here — only the page transition plays.
    navigateWithTransition("/");
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${bg})` }}
      />

      <ShootingStars />

      <div className={styles.sand} data-sand-parallax>
        <img
          src={sandImg}
          className={styles.sandImg}
          alt="Sand Background"
        />
      </div>

      <div className={styles.clouds} ref={cloudsRef}>
        {CLOUDS.map((cloud, i) => (
          <div
            key={cloud.id}
            className={styles.cloud}
            data-cloud-string
            style={{
              top: cloud.top,
              left: cloud.left,
              width: cloud.width,
            }}
            ref={(el) => {
              cloudRefs.current[i] = el;
            }}
          >
            <img src={cloud.src} alt="" />
          </div>
        ))}
      </div>

      <div className={styles.moon} data-moon-shrink>
        <img
          src={Moon}
          className={styles.moonImg}
          alt="Moon"
        />
      </div>

      <div className={styles.tint} />

      <div className={styles.centerBox}>
        <h1>COMING SOON...</h1>

        <h3>This page is still under construction</h3>

        <a
          href="/"
          className={styles.goHome}
          onClick={handleGoHomeClick}
        >
          <img
            src={goHomeIcon}
            alt="Go Home"
          />
        </a>
      </div>
    </div>
  );
}