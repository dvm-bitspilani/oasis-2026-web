import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";
import ReactGA from "react-ga4";
// import video from "./assets/video/curtain.mp4";
// const camel1 = "https://res.cloudinary.com/bhfhuzru/image/upload/camel1.svg";
// const camel2 = "https://res.cloudinary.com/bhfhuzru/image/upload/camel2.svg";
// const Castle = "https://res.cloudinary.com/bhfhuzru/image/upload/castlefinal2.png";
// const cloudBig = "https://res.cloudinary.com/bhfhuzru/image/upload/cloudBig.svg";
// const cloudSmall = "https://res.cloudinary.com/bhfhuzru/image/upload/cloudSmall.svg";
// const cloudThree = "https://res.cloudinary.com/bhfhuzru/image/upload/cloudThree.svg";
// import hamLine from "./assets/hamLine.svg";
// const LogoOasis = "https://res.cloudinary.com/bhfhuzru/image/upload/LogoOasisi.webp";
// const Moon = "https://res.cloudinary.com/bhfhuzru/image/upload/Moon.webp";
// import navCircle from "./assets/navCircle.svg";
// import navSan from "./assets/navSan.svg";
// const sandImg = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790454105/sandfinal.webp";
// import RegBg from "./assets/registration/reg/RegBg.png";
// import leftbottom from "./assets/registration/reg/leftbottom.png";
// import rightbottom from "./assets/registration/reg/rightbottom.png";
// import lefttop from "./assets/registration/reg/lefttop.png";
// import righttop from "./assets/registration/reg/righttop.png";
// import book from "./assets/registration/reg/book.png";
// import buttonBg from "./assets/registration/reg/buttonbg.png";
// import inputBg from "./assets/registration/reg/inputBg.png";
// import btn from "./assets/registration/reg/btn.png";
// import searchBg from "./assets/registration/reg/searchBg.png";
// import line from "./assets/registration/reg/line.png";
// import wheel from "./assets/registration/reg/wheel.png";
// import modalFrame from "./assets/registration/reg/modalFrame.webp";
// import modalFrameMobile from "./assets/registration/reg/modalFrameMobile.webp";
// import closedBook from "./assets/registration/reg/closedBook.webp";
import Syamsiah from "./assets/fonts/Syamsiah Arabic.ttf";
import EB from "./assets/fonts/EBGaramond-Medium.ttf";
import Cinzel from "./assets/fonts/Cinzel-VariableFont_wght.ttf";
// import Scroll1 from "./assets/registration/reg/instructionsScroll.webp";
// import Scroll2 from "./assets/registration/reg/instructionsScrollLong.webp";
// import googleButton from "./assets/registration/reg/googleReg.svg";

// import lamps from "/game-icons_magic-lamp.svg";

import video from "./assets/video/curtain.mp4";

const camel1 =
  "https://res.cloudinary.com/bhfhuzru/image/upload/camel1.svg";

const camel2 =
  "https://res.cloudinary.com/bhfhuzru/image/upload/camel2.svg";

const Castle =
  "https://res.cloudinary.com/bhfhuzru/image/upload/castlefinal2.png";

const cloudBig =
  "https://res.cloudinary.com/bhfhuzru/image/upload/cloudBig.svg";

const cloudSmall =
  "https://res.cloudinary.com/bhfhuzru/image/upload/cloudSmall.svg";

const cloudThree =
  "https://res.cloudinary.com/bhfhuzru/image/upload/cloudThree.svg";

import hamLine from "./assets/hamLine.svg";

const LogoOasis =
  "https://res.cloudinary.com/bhfhuzru/image/upload/LogoOasisi.webp";

const Moon =
  "https://res.cloudinary.com/bhfhuzru/image/upload/Moon.webp";

import navCircle from "./assets/navCircle.svg";
import navSan from "./assets/navSan.svg";

const sandImg =
  "https://res.cloudinary.com/bhfhuzru/image/upload/v1790454105/sandfinal.webp";

const RegBg =
  "https://res.cloudinary.com/bhfhuzru/image/upload/RegBg.png";

const leftbottom =
  "https://res.cloudinary.com/bhfhuzru/image/upload/leftbottom.png";

const rightbottom =
  "https://res.cloudinary.com/bhfhuzru/image/upload/rightbottom.png";

const lefttop =
  "https://res.cloudinary.com/bhfhuzru/image/upload/lefttop.png";

const righttop =
  "https://res.cloudinary.com/bhfhuzru/image/upload/righttop.png";

const book =
  "https://res.cloudinary.com/bhfhuzru/image/upload/book.png";
  

const buttonBg =
  "https://res.cloudinary.com/bhfhuzru/image/upload/buttonbg.png";

const inputBg =
  "https://res.cloudinary.com/bhfhuzru/image/upload/inputBg.png";

const btn =
  "https://res.cloudinary.com/bhfhuzru/image/upload/btn.png";

const searchBg =
  "https://res.cloudinary.com/bhfhuzru/image/upload/searchBg.png";

const line =
  "https://res.cloudinary.com/bhfhuzru/image/upload/line.png";

const wheel =
  "https://res.cloudinary.com/bhfhuzru/image/upload/v1790459176/wheel.png";

const modalFrame =
  "https://res.cloudinary.com/bhfhuzru/image/upload/modalFrame.webp";

const modalFrameMobile =
  "https://res.cloudinary.com/bhfhuzru/image/upload/modalFrameMobile.webp";

const closedBook =
  "https://res.cloudinary.com/bhfhuzru/image/upload/closedBook.webp";

const Scroll1 =
  "https://res.cloudinary.com/bhfhuzru/image/upload/instructionsScroll.webp";

const Scroll2 =
  "https://res.cloudinary.com/bhfhuzru/image/upload/instructionsScrollLong.webp";

const googleButton =
  "https://res.cloudinary.com/bhfhuzru/image/upload/googleReg.svg";

const TRACKING_ID = "GT-PJRTJCBD";

const isOasisDomain =
  window.location.hostname.includes("bits-oasis.org");

if (isOasisDomain) {
  ReactGA.initialize(TRACKING_ID);
}

const isMobile = window.innerWidth <= 768;

const mobileAssets = [
  video,
  // camel1,
  // camel2,
  // camelLand,
  Castle,
  cloudBig,
  cloudSmall,
  cloudThree,
  hamLine,
  LogoOasis,
  Moon,
  navCircle,
  // navSan,
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
  // lamps,

];

import sandBottom from "../assets/ham/sandBottom.png";
import sandAbove from "../assets/ham/sandAbove.png";
import board from "../assets/ham/board.png";
import guitarBook from "../assets/ham/guitarBook.png";
import trunkStuff from "../assets/ham/trunkStuff.png";

const desktopAssets = [
  trunkStuff,
  guitarBook,
  sandAbove,
  board,
  sandBottom,
  video,
  camel1,
  camel2,
  Castle,
  cloudBig,
  cloudSmall,
  cloudThree,
  hamLine,
  LogoOasis,
  Moon,
  navCircle,
  navSan,
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
  // lamps,

];


const fonts = [
  "Ramadhan",
  "Syamsiah",
  "EB",
  "EB Garamond",
  "Cinzel",
];
const assets = isMobile ? mobileAssets : desktopAssets;

/* ======================================================
   TRANSITION SETTINGS
====================================================== */

const TRANSITION_DURATION = 1140;

/* ======================================================
   APP
====================================================== */

export default function App() {
  const location = useLocation();

  const { markEntered } = useTransition();

  const isHome = location.pathname === "/";

  /* ======================================================
     GOOGLE ANALYTICS PAGEVIEW
  ====================================================== */

  useEffect(() => {
    if (isOasisDomain) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
        title: document.title,
      });
    }
  }, [location]);

  /* ======================================================
     PRELOADER STATE
  ====================================================== */

  const [preloaderDone, setPreloaderDone] = useState(false);

  const [homeExiting, setHomeExiting] = useState(false);

  /* ======================================================
     PRELOADER EXIT START
  ====================================================== */

  const handlePreloaderExit = () => {
    setHomeExiting(true);
  };

  /* ======================================================
     ENTER COMPLETE
  ====================================================== */

  const handleEnter = () => {
    markEntered();
    setPreloaderDone(true);
    setHomeExiting(true);
  };

  /* ======================================================
     INTRO STATE
  ====================================================== */

  const introActive = isHome && !preloaderDone;

  return (
    <>
      {/* ==================================================
          HOME PAGE TRANSITION WRAPPER
      ================================================== */}

      <div
        style={
          introActive
            ? {
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100dvh",
                overflow: "hidden",
                background: "#080a18",
              }
            : undefined
        }
      >
        <div
          style={
            introActive
              ? {
                  width: "100%",
                  minHeight: "100%",
                  transform: homeExiting
                    ? "translate3d(0, 0, 0)"
                    : "translate3d(0, 100%, 0)",
                  transition: homeExiting
                    ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.76, 0, 0.24, 1)`
                    : "none",
                  willChange: "transform",
                }
              : undefined
          }
        >
          <AppRoutes
            preloaderDone={preloaderDone}
            preloaderExiting={homeExiting}
          />
        </div>
      </div>

      {/* ==================================================
          PRELOADER
      ================================================== */}

      {isHome && !preloaderDone && (
        <Preloader
          assets={assets}
              fonts={fonts}
          onExitStart={handlePreloaderExit}
          onEnter={handleEnter}
        />
      )}
    </>
  );
}
