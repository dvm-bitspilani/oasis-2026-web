import "../styles/About.module.scss";
import styles from "../styles/About.module.scss";

import bgback from "../assets/about/bgBack.png";
import cloud from "../assets/about/cloud.png";
import backBg from "../assets/about/bgBottom.png";
import leftCloud from "../assets/about/leftClouds.png";
import leftTop from "../assets/about/pillarTop.png";
import leftTopMob from "../assets/about/leftTop.png";
import head from "../assets/about/head.png";
import lamp from "../assets/about/lamp.png";
import bgCon from "../assets/about/bgCont.png";
import play from "../assets/about/play.png";
import ff from "../assets/about/ffControl.png";
import playBtn from "../assets/about/playBtn.png";
import { useTransition } from "../context/TransitionProvider";
import bgVid from "../assets/about/bgVideo.png";
import cover from "../assets/about/cover.png";
import backBtn from "../assets/about/backBtn.png";
import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  ignoreMobileResize: true,
});

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

const YOUTUBE_VIDEO_ID = "5MtkggVC0w0";

const About = () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const bgLeft = isMobile ? leftTopMob : leftTop;
  const { navigateWithTransition } = useTransition();

  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerElRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const vidBgRef = useRef<HTMLDivElement | null>(null);
  const vidRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const midCloudR = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const bgBackRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const bgSolidRef = useRef<HTMLDivElement | null>(null);

  const bottomR = useRef<HTMLDivElement | null>(null);
  const bottomL = useRef<HTMLDivElement | null>(null);

  const bottomBack = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const cloudRef = useRef<HTMLDivElement | null>(null);

  const [clicked, setClicked] = useState(false);
  const isNavigatingRef = useRef(false);

  const handleBackClick = useCallback(() => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    const player = playerRef.current;

    if (player) {
      try {
        if (typeof player.pauseVideo === "function") {
          player.pauseVideo();
        }
      } catch {}

      playerRef.current = null;
    }

    setPlayerReady(false);
    setControlsVisible(false);
    setShowVideo(false);

    const st = scrollTriggerRef.current;

    if (st) {
      scrollTriggerRef.current = null;
      st.kill();
    }

    gsap.killTweensOf([
      containerRef.current,
      vidRef.current,
      vidBgRef.current,
      controlsRef.current,
      bgRef.current,
      bgSolidRef.current,
      bgBackRef.current,
      leftRef.current,
      rightRef.current,
      midCloudR.current,
      bottomL.current,
      bottomR.current,
      bottomBack.current,
      headRef.current,
      cloudRef.current,
    ]);

    navigateWithTransition("/");
  }, [navigateWithTransition]);

  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);

    return () => {
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag);
      }
    };
  }, []);

  useEffect(() => {
    if (!showVideo || playerRef.current || !playerElRef.current) return;

    const createPlayer = () => {
      if (!playerElRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(playerElRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setPlayerReady(true);

            try {
              e.target.playVideo();
            } catch {}

            setTimeout(() => {
              setControlsVisible(true);
            }, 150);
          },
          onStateChange: (e: any) => {
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (window.onYouTubeIframeAPIReady === createPlayer) {
        window.onYouTubeIframeAPIReady = () => {};
      }
    };
  }, [showVideo]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;

    if (!player) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch {}
  }, [isPlaying]);

  const seekBy = useCallback((deltaSeconds: number) => {
    const player = playerRef.current;

    if (!player || typeof player.getCurrentTime !== "function") return;

    try {
      const current = player.getCurrentTime();
      player.seekTo(Math.max(0, current + deltaSeconds), true);
    } catch {}
  }, []);

  const rewind = useCallback(() => {
    seekBy(-10);
  }, [seekBy]);

  const fastForward = useCallback(() => {
    seekBy(10);
  }, [seekBy]);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.set(midCloudR.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(headRef.current, {
        y: "-40vh",
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

      gsap.set(bottomBack.current, {
        y: "15vh",
        opacity: 1,
      });

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const FINAL_BG_SIZE = isMobile ? "85% 24%" : "63% 62%";

      const [wStr, hStr] = FINAL_BG_SIZE.split(" ");

      const widthPct = parseFloat(wStr);
      const heightPct = parseFloat(hStr);

      const leftPct = (100 - widthPct) / 2;
      const topPct = (100 - heightPct) / 2;

      const CONTROLS_HEIGHT_PCT = isMobile ? 9 : 7;
      const CONTROLS_GAP_PCT = 0.5;

      gsap.set(vidRef.current, {
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        left: `${leftPct}%`,
        top: `${topPct}%`,
        opacity: 0,
      });

      gsap.set(vidBgRef.current, {
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        left: `${leftPct}%`,
        top: `${topPct}%`,
        opacity: 0,
      });

      gsap.set(controlsRef.current, {
        width: `${widthPct}%`,
        height: `${CONTROLS_HEIGHT_PCT}%`,
        left: `${leftPct}%`,
        top: `${topPct + heightPct + CONTROLS_GAP_PCT}%`,
        opacity: 0,
      });

      gsap.set(bgRef.current, {
        backgroundSize: isMobile ? "200% 100%" : "120% 120%",
        backgroundPosition: "center center",
        opacity: 1,
      });

      gsap.set(bgSolidRef.current, {
        backgroundSize: "120% 120%",
        backgroundPosition: "center center",
        opacity: 0,
      });

      gsap.set(bgBackRef.current, {
        opacity: 0.4,
      });

      const tl = gsap.timeline();

      const SHRINK_DURATION = 0.5;
      const CROSSFADE_DURATION = 0.35;

      tl.to(
        [bgRef.current, bgSolidRef.current],
        {
          backgroundSize: FINAL_BG_SIZE,
          ease: "none",
          duration: SHRINK_DURATION,
        },
        0
      );

      tl.to(
        bgRef.current,
        {
          opacity: 0,
          duration: CROSSFADE_DURATION,
          ease: "power1.inOut",
        },
        SHRINK_DURATION - CROSSFADE_DURATION / 2
      );

      tl.to(
        bgSolidRef.current,
        {
          opacity: 1,
          duration: CROSSFADE_DURATION,
          ease: "power1.inOut",
        },
        SHRINK_DURATION - CROSSFADE_DURATION / 2
      );

      tl.to(
        bgBackRef.current,
        {
          opacity: 1,
          duration: 0.3,
        },
        0.4
      );

      tl.from(leftRef.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(rightRef.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(midCloudR.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(bottomR.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(bottomL.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(bottomBack.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(cloudRef.current, { x: 0, y: 0, opacity: 1 }, 0);
      tl.from(headRef.current, { x: 0, y: 0, opacity: 1 }, 0);

      tl.to(
        vidRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        0.5
      );

      tl.to(
        vidBgRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        "<-0.15"
      );

      tl.to(
        controlsRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        "<"
      );

      const VIDEO_REVEAL_TIME = tl.duration() - 0.9;
      const REVEAL_EPSILON = 0.03;

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=1200",
        pin: true,
        scrub: 2,
        animation: tl,
        invalidateOnRefresh: true,

        onUpdate: (self) => {
          const reached =
            tl.time() >= VIDEO_REVEAL_TIME - REVEAL_EPSILON ||
            self.progress >= 0.985;

          setShowVideo((prev) => (prev === reached ? prev : reached));
        },

        onLeave: () => setShowVideo(true),
        onEnterBack: () => setShowVideo(true),
      });

      scrollTriggerRef.current = st;

      const refresh = () => {
        if (!isNavigatingRef.current) {
          ScrollTrigger.refresh();
        }
      };

      requestAnimationFrame(refresh);

      window.addEventListener("load", refresh);
      window.addEventListener("resize", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        window.removeEventListener("resize", refresh);

        if (scrollTriggerRef.current === st) {
          scrollTriggerRef.current = null;
        }

        st.kill();
        tl.kill();
      };
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  function clickHandler() {
    const st = scrollTriggerRef.current;

    if (!st) return;

    const target = st.start + (st.end - st.start);

    window.scrollTo({
      top: target,
      behavior: "smooth",
    });
  }

  return (
    <div ref={containerRef} className={styles.about}>
      <div
        ref={bgBackRef}
        className={styles.bgBack}
        style={{ backgroundImage: `url(${bgback})` }}
      />

      <div
        ref={bgRef}
        className={styles.bgFront}
        style={{ backgroundImage: `url(${cover})` }}
      />

      <div
        ref={bgSolidRef}
        className={styles.bgFrontSolid}
        style={{ backgroundImage: `url(${cover})` }}
      />

      {!clicked && (
        <div ref={cloudRef} className={styles.cloud}>
          <SvgImg src={cloud} />

          <div onClick={clickHandler} className={styles.play}>
            <SvgImg src={play} />
          </div>

          <div className={styles.text}>
            Oasis, the annual cultural extravaganza of Birla Institute of
            Technology and Science, Pilani, has been a vibrant part of
            India's cultural tapestry since 1971. Managed entirely by
            students, it's a dazzling showcase of talent in Dance, Drama,
            Literature, Comedy, Fashion, and Music. It's where dreams come
            alive, laughter fills the air, and creativity knows no bounds.
            Step into the world of Oasis, where youth's boundless potential
            shines...
          </div>
        </div>
      )}

      <div className={styles.video} ref={vidRef}>
        <div
          ref={playerHostRef}
          className={`${styles.videoIframe} ${
            playerReady ? styles.playerVisible : ""
          }`}
        >
          <div
            ref={playerElRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div
        className={styles.bgVid}
        ref={vidBgRef}
        style={{ backgroundImage: `url(${bgVid})` }}
      />

      <div
        className={`${styles.videoControls} ${
          controlsVisible ? styles.controlsVisible : ""
        }`}
        ref={controlsRef}
        style={{ backgroundImage: `url(${bgCon})` }}
      >
        <button
          type="button"
          className={`${styles.controlBtn} ${styles.rewindBtn}`}
          onClick={rewind}
          aria-label="Rewind 10 seconds"
        >
          <img src={ff} alt="" />
        </button>

        <button
          type="button"
          className={`${styles.controlBtn} ${styles.playPauseBtn}`}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <img src={playBtn} alt="" />
        </button>

        <button
          type="button"
          className={`${styles.controlBtn} ${styles.ffBtn}`}
          onClick={fastForward}
          aria-label="Fast forward 10 seconds"
        >
          <img src={ff} alt="" />
        </button>
      </div>

      {!clicked && (
        <div className={styles.bgBottom} ref={bottomBack}>
          <img src={backBg} alt="" />
        </div>
      )}

      <div ref={bottomL} data-castle-drown className={styles.leftCloud}>
        <SvgImg src={leftCloud} />
      </div>

      {!clicked && (
        <div ref={headRef} className={styles.head}>
          <SvgImg src={head} />
        </div>
      )}

      <div ref={leftRef} className={styles.leftTop}>
        <SvgImg src={bgLeft} />
      </div>

      <div ref={bottomR} className={styles.rightCloud}>
        <SvgImg src={leftCloud} />
      </div>

      <div ref={midCloudR} className={styles.midCloudR} />

      <div ref={rightRef} className={styles.rightTop}>
        <SvgImg src={leftTop} />
      </div>

      <div className={styles.lamp}>
        <SvgImg src={lamp} />
      </div>

      <div className={styles.lampR}>
        <SvgImg src={lamp} />
      </div>

      <div
        className={styles.backBtn}
        onClick={handleBackClick}
      >
        <SvgImg src={backBtn} />
      </div>
    </div>
  );
};

export default About;