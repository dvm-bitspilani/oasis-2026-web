import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";
import ReactGA from "react-ga4";

import video from "./assets/video/curtain.mp4";
import camel from "./assets/camelLand.png";
import camel1 from "./assets/camel1.svg";
import camel2 from "./assets/camel2.svg";
import camel3 from "./assets/camel3.svg";
import camel4 from "./assets/camel4.svg";
import camelLand from "./assets/camelLand.png";
import Castle from "./assets/Castle.png";
import cloudBig from "./assets/cloudBig.svg";
import cloudSmall from "./assets/cloudSmall.svg";
import cloudThree from "./assets/cloudThree.svg";
import hamLine from "./assets/hamLine.svg";
import LogoOasis from "./assets/LogoOasisi.png";
import Moon from "./assets/Moon.png";
import navCircle from "./assets/navCircle.svg";
import navSan from "./assets/navSan.svg";

import regBtn from "./assets/regBtn.png";
import registerBtn from "./assets/registerBtn.png";
import sand from "./assets/sand.png";
import sandImg from "./assets/sandImg.png";

import RegBg from "./assets/registration/reg/RegBg.png";
import leftbottom from "./assets/registration/reg/leftbottom.png";
import rightbottom from "./assets/registration/reg/rightbottom.png";
import lefttop from "./assets/registration/reg/lefttop.png";
import righttop from "./assets/registration/reg/righttop.png";
import book from "./assets/registration/reg/book.png";
import buttonBg from "./assets/registration/reg/buttonbg.png";
import inputBg from "./assets/registration/reg/inputBg.png";
import btn from "./assets/registration/reg/btn.png";
import searchBg from "./assets/registration/reg/searchBg.png";
import line from "./assets/registration/reg/line.png";
import wheel from "./assets/registration/reg/wheel.png";

import modalFrame from "/modalFrame.png";
import modalFrameMobile from "/modalFrameMobile.png";
import closedBook from "/closedBook.png";

import Syamsiah from "./assets/fonts/Syamsiah Arabic.ttf";
import EB from "./assets/fonts/EBGaramond-Medium.ttf";
import Cinzel from "./assets/fonts/Cinzel-VariableFont_wght.ttf";

import Scroll1 from "/instructionsScroll.png";
import Scroll2 from "/instructionsScrollLong.png";
import googleButton from "/googleReg.svg";
import instructionsBG from "./assets/preloader/bg_star.png";

const TRACKING_ID = "GT-PJRTJCBD";

if (
  window.location.hostname.includes("bits-oasis.org")
) {
  console.log("GA hostname matched:", window.location.hostname);

  ReactGA.initialize(TRACKING_ID, {
    gtagOptions: {
      debug_mode: true,
    },
  });

  console.log("GA initialized:", TRACKING_ID);
}

const isMobile = window.innerWidth <= 768;

const mobileAssets = [
  video,
  camel,
  Castle,
  cloudBig,
  cloudSmall,
  cloudThree,
  hamLine,
  LogoOasis,
  Moon,
  navCircle,
  regBtn,
  registerBtn,
  sand,
  sandImg,
  RegBg,
  leftbottom,
  rightbottom,
  lefttop,
  righttop,
  book,
  buttonBg,
  inputBg,
  btn,
  searchBg,
  line,
  wheel,
  modalFrameMobile,
  closedBook,
  Syamsiah,
  EB,
  Cinzel,
  Scroll1,
  Scroll2,
  googleButton,
  instructionsBG,
];

const desktopAssets = [
  video,
  camel,
  camel1,
  camel2,
  camel3,
  camel4,
  camelLand,
  Castle,
  cloudBig,
  cloudSmall,
  cloudThree,
  hamLine,
  LogoOasis,
  Moon,
  navCircle,
  navSan,
  regBtn,
  registerBtn,
  sand,
  sandImg,
  RegBg,
  leftbottom,
  rightbottom,
  lefttop,
  righttop,
  book,
  buttonBg,
  inputBg,
  btn,
  searchBg,
  line,
  wheel,
  modalFrame,
  closedBook,
  Syamsiah,
  EB,
  Cinzel,
  Scroll1,
  Scroll2,
  googleButton,
  instructionsBG,
];

const assets = isMobile ? mobileAssets : desktopAssets;

export default function App() {
  const location = useLocation();
  const { markEntered } = useTransition();
  const isHome = location.pathname === "/";

  const [homeReveal, setHomeReveal] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [preloaderMounted, setPreloaderMounted] = useState(false);

  const homeWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  console.log("Sending GA pageview:", location.pathname);

  ReactGA.send({
    hitType: "pageview",
    page: location.pathname + location.search,
    title: document.title,
  });
}, [location]);

  useEffect(() => {
    if (!isHome) {
      setBackgroundReady(true);
      setPreloaderMounted(false);
      return;
    }

    const bgImage = new Image();

    bgImage.onload = () => {
      setBackgroundReady(true);
      setPreloaderMounted(true);
    };

    bgImage.onerror = () => {
      setBackgroundReady(true);
      setPreloaderMounted(true);
    };

    bgImage.src = instructionsBG;
  }, [isHome]);

  const handlePreloaderExit = () => {
    setHomeReveal(true);
  };

  const handleExitProgress = (revealFraction: number) => {
    const el = homeWrapRef.current;
    if (!el) return;

    const hiddenPercent = (1 - revealFraction) * 100;

    el.style.transform = `translate3d(0, ${hiddenPercent}vh, 0)`;
  };

  const handleEnter = () => {
    markEntered();
    setPreloaderMounted(false);
  };

  return (
    <>
      <div
        ref={homeWrapRef}
        style={{
          position: "relative",
          zIndex: 20,
          transform: "translate3d(0, 100vh, 0)",
          willChange: "transform",
        }}
      >
        <AppRoutes
          preloaderDone={homeReveal}
          preloaderExiting={homeReveal}
        />
      </div>

      {isHome && backgroundReady && preloaderMounted && (
        <Preloader
          assets={assets}
          onExitStart={handlePreloaderExit}
          onEnter={handleEnter}
          onExitProgress={handleExitProgress}
        />
      )}
    </>
  );
}