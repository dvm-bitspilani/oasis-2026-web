import "../styles/About.module.scss";
import styles from "../styles/About.module.scss";

import bg from "../assets/about/bgf.png";
import cloud from "../assets/about/cloud.png";
import backBg from "../assets/about/bgBottom.png";
import leftCloud from "../assets/about/leftCloud.png";
import midCloud from "../assets/about/midCloud.png";
import leftTop from "../assets/about/leftTop.png";
import pillar from "../assets/about/pillar.png";
import head from "../assets/about/head.png";
import lamp from "../assets/about/lamp.png";
import bgCon from "../assets/about/bgCont.png";
import play from "../assets/about/play.png";
import arrow from "../assets/about/arrow.png";
import bgVid from "../assets/about/bgVideo.png";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
      preserveAspectRatio={
        fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"
      }
    />
  </svg>
);

const About = () => {
  const vidBgRef = useRef<HTMLDivElement | null>(null);
  const vidRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const midCloudL = useRef<HTMLDivElement | null>(null);
  const midCloudR = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomR = useRef<HTMLDivElement | null>(null);
  const bottomL = useRef<HTMLDivElement | null>(null);
  const pillarR = useRef<HTMLDivElement | null>(null);
  const pillarL = useRef<HTMLDivElement | null>(null);
  const bottomBack = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const cloudRef = useRef<HTMLDivElement | null>(null);

  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // --------------------------------
      // INITIAL STATES
      // --------------------------------

      gsap.set(leftRef.current, {
        x: "-2.5vw",
        opacity: 1,
      });

      gsap.set(rightRef.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(cloudRef.current, {
        opacity: 0,
      });

      gsap.set(midCloudL.current, {
        x: "-2.5vw",
        opacity: 1,
      });

      gsap.set(headRef.current, {
        y: "-20vh",
        opacity: 1,
      });

      gsap.set(bgRef.current, {
        y: "-20vh",
        opacity: 1,
      });

      gsap.set(midCloudR.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(bottomL.current, {
        x: "-2.5vw",
        y: "2.5vh",
        opacity: 1,
      });

      gsap.set(bottomR.current, {
        x: "2.5vw",
        y: "2.5vh",
        opacity: 1,
      });

      gsap.set(pillarL.current, {
        x: "-2.5vw",
        opacity: 1,
      });

      gsap.set(pillarR.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(bottomBack.current, {
        y: "15vh",
        opacity: 1,
      });

      gsap.set(vidRef.current, {
        opacity: 0,
      });

      gsap.set(vidBgRef.current, {
        opacity: 0,
      });

      // --------------------------------
      // BACKGROUND INITIAL STATE
      // --------------------------------

      gsap.set(containerRef.current, {
        backgroundSize: "120% 120%",
        backgroundPosition: "center center",
      });


      // --------------------------------
      // MAIN TIMELINE
      // --------------------------------

      const tl = gsap.timeline();


      // BACKGROUND SHRINK
      tl.to(
        containerRef.current,
        {
          backgroundSize: "63% 62%",
          ease: "none",
        },
        0
      );


      // LEFT TOP
      tl.from(
        leftRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // RIGHT TOP
      tl.from(
        rightRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // LEFT MID CLOUD
      tl.from(
        midCloudL.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // RIGHT MID CLOUD
      tl.from(
        midCloudR.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // BOTTOM RIGHT
      tl.from(
        bottomR.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // BOTTOM LEFT
      tl.from(
        bottomL.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // LEFT PILLAR
      tl.from(
        pillarL.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // RIGHT PILLAR
      tl.from(
        pillarR.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // BACKGROUND BOTTOM
      tl.from(
        bottomBack.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // CLOUD
      tl.from(
        cloudRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // HEAD
      tl.from(
        headRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // VIDEO
      tl.to(
        vidRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        }
      );
      tl.to(
  vidBgRef.current,
  {
    x: 0,
    y: 0,
    opacity: 1
  },
  "<-0.2"
);


      // BG REF
      tl.from(
        bgRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );


      // --------------------------------
      // SCROLL TRIGGER
      // --------------------------------

      ScrollTrigger.create({
        trigger: containerRef.current,

        start: "top top",

        end: "+=1200",

        pin: true,

        scrub: 2,

        animation: tl,
      });

    }, containerRef);

    return () => ctx.revert();

  }, []);


  // --------------------------------
  // CLICK HANDLER
  // --------------------------------

  function clickHandler() {
    setClicked((prev) => !prev);
  }


  // --------------------------------
  // JSX
  // --------------------------------

  return (
    <div
      ref={containerRef}
      className={styles.about}
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >

      {/* CLOUD / ABOUT CONTENT */}

      {!clicked && (
        <div
          ref={cloudRef}
          className={styles.cloud}
        >
          <SvgImg src={cloud} />

          <div
            onClick={clickHandler}
            className={styles.play}
          >
            <SvgImg src={play} />
          </div>

          <div className={styles.text}>
            Oasis, the annual cultural extravaganza of Birla Institute
            of Technology and Science, Pilani, has been a vibrant part
            of India's cultural tapestry since 1971. Managed entirely
            by students, it's a dazzling showcase of talent in Dance,
            Drama, Literature, Comedy, Fashion, and Music. It's where
            dreams come alive, laughter fills the air, and creativity
            knows no bounds. Step into the world of Oasis, where
            youth's boundless potential shines...
          </div>
        </div>
      )}


      {/* VIDEO */}

      <div
        className={styles.video}
        ref={vidRef}
        style={{
          backgroundImage: `url(${bgCon})`,
        }}
      >
        <div className={styles.arrow}>
          <img src={arrow} />
        </div>

        <div className={styles.arrowR}>
          <img src={arrow} />
        </div>  
      </div>
        <div
          className={styles.bgVid}
          ref={vidBgRef}
          style={{
            backgroundImage: `url(${bgVid})`,
          }}
        />





      {/* BOTTOM BACKGROUND */}

      {!clicked && (
        <div
          className={styles.bgBottom}
          ref={bottomBack}
        >
          <img
            src={backBg}
            alt=""
          />
        </div>
      )}


      {/* LEFT CLOUD */}

      <div
        ref={bottomL}
        data-castle-drown
        className={styles.leftCloud}
      >
        <SvgImg src={leftCloud} />
      </div>


      {/* MIDDLE LEFT CLOUD */}

      <div
        ref={midCloudL}
        className={styles.midCloud}
      >
        <SvgImg src={midCloud} />
      </div>


      {/* HEAD */}

      {!clicked && (
        <div
          ref={headRef}
          className={styles.head}
        >
          <SvgImg src={head} />
        </div>
      )}


      {/* LEFT TOP */}

      <div
        ref={leftRef}
        className={styles.leftTop}
      >
        <SvgImg src={leftTop} />
      </div>


      {/* RIGHT CLOUD */}

      <div
        ref={bottomR}
        className={styles.rightCloud}
      >
        <SvgImg src={leftCloud} />
      </div>


      {/* MIDDLE RIGHT CLOUD */}

      <div
        ref={midCloudR}
        className={styles.midCloudR}
      >
        <SvgImg src={midCloud} />
      </div>


      {/* RIGHT TOP */}

      <div
        ref={rightRef}
        className={styles.rightTop}
      >
        <SvgImg src={leftTop} />
      </div>


      {/* LEFT PILLAR */}

      <div
        ref={pillarL}
        className={styles.pillar}
      >
        <SvgImg src={pillar} />
      </div>


      {/* RIGHT PILLAR */}

      <div
        ref={pillarR}
        className={styles.pillarR}
      >
        <SvgImg src={pillar} />
      </div>


      {/* LAMPS */}

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