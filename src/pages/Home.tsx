import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import styles from "../styles/Home.module.scss";

import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg";
import sandImg from "../assets/sand1.png";
import sandMob from "../assets/sandmobile.png";
import cloudSmall from "../assets/cloudSmall.svg";
import cloudBig from "../assets/cloudBig.svg";
import cloudThree from "../assets/cloudThree.svg";
import Castle from "../assets/Castle1.svg";
import Moon from "../assets/Moon.png";
import LogoOasis from "../assets/LogoOasisi.png";
import RegBtn from "../assets/regBtn.png";
import Nav from "../components/Nav";
import ShootingStars from "../components/ShootingStars";
import camelLand from "../assets/camelLand.png";

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

const bgImg = window.innerWidth < 650 ? sandMob : sandImg;

const MOON_CLOUD_TINT =
  "brightness(0.35) sepia(0.8) hue-rotate(20deg) saturate(1.5)";

export default function Home() {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const camelRef = useRef(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const castleRef = useRef<HTMLDivElement>(null);

  const moonRef = useRef<HTMLDivElement>(null);
  const portholeRef = useRef<HTMLDivElement>(null);
  const portholeInnerRef = useRef<HTMLDivElement>(null);
  const overlayCloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const CLOUDS = isMobile ? CLOUDS_MOBILE : CLOUDS_DESKTOP;

  // Castle entrance animation
  useEffect(() => {
    const castleEl = castleRef.current;

    if (!castleEl) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        castleEl,
        {
          yPercent: 60,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.8,
          ease: "power3.out",
          delay: 0.3,
        },
      );
    });

    return () => ctx.revert();
  }, []);

  // Drives the real clouds
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

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const containerEl = containerRef.current;
      const moonEl = moonRef.current;
      const porthole = portholeRef.current;
      const portholeInner = portholeInnerRef.current;

      if (containerEl && moonEl && porthole && portholeInner) {
        const containerBox = containerEl.getBoundingClientRect();
        const moonBox = moonEl.getBoundingClientRect();

        const top = moonBox.top - containerBox.top;
        const left = moonBox.left - containerBox.left;

        porthole.style.top = `${top}px`;
        porthole.style.left = `${left}px`;
        porthole.style.width = `${moonBox.width}px`;
        porthole.style.height = `${moonBox.height}px`;

        portholeInner.style.top = `${-top}px`;
        portholeInner.style.left = `${-left}px`;
        portholeInner.style.width = `${containerBox.width}px`;
        portholeInner.style.height = `${containerBox.height}px`;
      }

      cloudRefs.current.forEach((real, i) => {
        const overlay = overlayCloudRefs.current[i];

        if (real && overlay) {
          overlay.style.transform = real.style.transform;
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div data-transition-fade className={styles.navbar}>
        <Nav />
      </div>

      <div
        className={styles.background}
        style={{ backgroundImage: `url(${bg})` }}
      />

      <ShootingStars />

      <div className={styles.sand} data-sand-parallax>
        <img src={bgImg} className={styles.sandImg} alt="" />
      </div>

      <div
        className={styles.castle}
        data-castle-drown
        ref={castleRef}
      >
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

      <div
        className={styles.moon}
        data-moon-shrink
        ref={moonRef}
      >
        <img
          src={Moon}
          className={styles.moonImg}
          alt=""
        />
      </div>

      <div
        className={styles.moonCloudOverlay}
        ref={portholeRef}
      >
        <div
          className={styles.moonCloudOverlayInner}
          ref={portholeInnerRef}
        >
          {CLOUDS.map((c, i) => (
            <div
              key={i}
              className={styles.cloud}
              style={{
                top: c.top,
                left: c.left,
                width: c.width,
                filter: MOON_CLOUD_TINT,
              }}
              ref={(el) => {
                overlayCloudRefs.current[i] = el;
              }}
            >
              <img src={c.src} alt="" />
            </div>
          ))}
        </div>
      </div>

      <div
        className={styles.oasisLogo}
        data-transition-fade
      >
        <img src={LogoOasis} alt="Oasis" />
      </div>

      {/* REGISTER BUTTON */}
      <div
        className={styles.regBtn}
        data-transition-fade
        onClick={() => navigate("/register")}
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
          <image
            href={bgPath}
            x="0"
            y="0"
            width="110"
            height="100"
            className={styles.socialLink}
          />

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

          <a
            href=""
            target="_blank"
            rel="noreferrer"
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