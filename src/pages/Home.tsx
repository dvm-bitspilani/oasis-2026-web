import { useEffect, useRef, useState } from "react";
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
import RegBtn from "../assets/regBtn.png";
import Nav from "../components/Nav";
import ShootingStars from "../components/ShootingStars";
import camelLand from "../assets/camelLand.png";
import { useTransition } from "../context/TransitionProvider";

import instagramIcon from "../assets/links/instagram.png";
import twitterIcon from "../assets/links/twitter.png";
import LinkdinIcon from "../assets/links/linkdin.png";
import youtubeIcon from "../assets/links/youtube.png";
import bgPath from "../assets/links/bg.png";

type Cloud = {
  src: string;
  top: string;
  left: string;
  width: string;
  duration: number;
};

const MOBILE_BREAKPOINT = 650;

const CLOUDS_DESKTOP: Cloud[] = [
  {
    src: cloudSmall,
    top: "35%",
    left: "-20%",
    width: "20%",
    duration: 240,
  },
  {
    src: cloudBig,
    top: "12%",
    left: "10%",
    width: "24%",
    duration: 320,
  },
  {
    src: cloudThree,
    top: "22%",
    left: "40%",
    width: "18%",
    duration: 200,
  },
  {
    src: cloudSmall,
    top: "42%",
    left: "65%",
    width: "15%",
    duration: 180,
  },
  {
    src: cloudBig,
    top: "8%",
    left: "90%",
    width: "22%",
    duration: 380,
  },
];

const CLOUDS_MOBILE: Cloud[] = [
  {
    src: cloudSmall,
    top: "30%",
    left: "-25%",
    width: "50%",
    duration: 240,
  },
  {
    src: cloudBig,
    top: "8%",
    left: "5%",
    width: "60%",
    duration: 320,
  },
  {
    src: cloudThree,
    top: "18%",
    left: "40%",
    width: "45%",
    duration: 200,
  },
  {
    src: cloudSmall,
    top: "38%",
    left: "60%",
    width: "40%",
    duration: 180,
  },
  {
    src: cloudBig,
    top: "5%",
    left: "85%",
    width: "55%",
    duration: 380,
  },
];

export default function Home() {
  const camelRef = useRef<HTMLDivElement | null>(null);
  const cloudsRef = useRef<HTMLDivElement | null>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { navigateWithTransition } = useTransition();

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const CLOUDS = isMobile ? CLOUDS_MOBILE : CLOUDS_DESKTOP;

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleRegisterClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    navigateWithTransition("/register");
  };

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
            style={{
              top: c.top,
              left: c.left,
              width: c.width,
            }}
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
        <img src={LogoOasis} alt="Oasis" />
      </div>

      <div
        className={styles.regBtn}
        data-transition-fade
        role="button"
        tabIndex={0}
        onClick={handleRegisterClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleRegisterClick(e);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <img src={RegBtn} alt="Register" />
      </div>

      <div
        ref={camelRef}
        className={styles.camelLand}
        data-transition-fade
      >
        <img src={camelLand} alt="" />
      </div>

      <div className={styles.links}>
        <svg
          viewBox="0 0 100 100"
          className={styles.linksSvg}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <image
            href={bgPath}
            x="0"
            y="0"
            width="110"
            height="100"
            className={styles.socialLink}
          />

          {/* Instagram */}
          <a
            href="https://www.instagram.com/bitsoasis/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={instagramIcon}
              x="43"
              y="68"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/oasis24-bits-pilani/"
            target="_blank"
            rel="noreferrer"
          >
            <image
              href={LinkdinIcon}
              x="87"
              y="46"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          {/* YouTube */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
          >
            <image
              href={youtubeIcon}
              x="53"
              y="25"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>

          {/* Twitter / X */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
          >
            <image
              href={twitterIcon}
              x="1"
              y="23"
              width="12"
              height="12"
              className={styles.socialLink}
            />
          </a>
        </svg>
      </div>
    </div>
  );
}