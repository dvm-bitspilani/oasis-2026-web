import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";
// import video from "./assets/video/curtain.mp4";
// const camel1 = new URL("./assets/home/camel1.svg", import.meta.url).href;
// const camel2 = new URL("./assets/home/camel2.svg", import.meta.url).href;
// const Castle = new URL("./assets/home/castlefinal2.png", import.meta.url).href;
// const cloudBig = new URL("./assets/home/cloudBig.svg", import.meta.url).href;
// const cloudSmall = new URL("./assets/home/cloudSmall.svg", import.meta.url).href;
// const cloudThree = new URL("./assets/home/cloudThree.svg", import.meta.url).href;
// import hamLine from "./assets/hamLine.svg";
// const LogoOasis = new URL("./assets/home/LogoOasisi.webp", import.meta.url).href;
// const Moon = new URL("./assets/home/Moon.webp", import.meta.url).href;
// import navCircle from "./assets/navCircle.svg";
// import navSan from "./assets/navSan.svg";
// const sandImg = new URL("./assets/home/sandfinal.webp", import.meta.url).href;
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
// import Scroll1 from "./assets/registration/reg/instructionsScroll.webp";
// import Scroll2 from "./assets/registration/reg/instructionsScrollLong.webp";
// import googleButton from "./assets/registration/reg/googleReg.svg";

// import lamps from "/game-icons_magic-lamp.svg";


const camel1 =
  new URL("./assets/home/camel1.svg", import.meta.url).href;

const camel2 =
  new URL("./assets/home/camel2.svg", import.meta.url).href;

const Castle =
  new URL("./assets/home/castlefinal2.png", import.meta.url).href;

const cloudBig =
  new URL("./assets/home/cloudBig.svg", import.meta.url).href;

const cloudSmall =
  new URL("./assets/home/cloudSmall.svg", import.meta.url).href;

const cloudThree =
  new URL("./assets/home/cloudThree.svg", import.meta.url).href;

import hamLine from "./assets/hamLine.svg";

const LogoOasis =
  new URL("./assets/home/LogoOasisi.webp", import.meta.url).href;

const Moon =
  new URL("./assets/home/Moon.webp", import.meta.url).href;

import navCircle from "./assets/navCircle.svg";
import navSan from "./assets/navSan.svg";

const sandImg =
  new URL("./assets/home/sandfinal.webp", import.meta.url).href;

const RegBg =
  new URL("./assets/registration/reg/RegBg.png", import.meta.url).href;

const leftbottom =
  new URL("./assets/registration/reg/leftbottom.png", import.meta.url).href;

const rightbottom =
  new URL("./assets/registration/reg/rightbottom.png", import.meta.url).href;

const lefttop =
  new URL("./assets/registration/reg/lefttop.png", import.meta.url).href;

const righttop =
  new URL("./assets/registration/reg/righttop.png", import.meta.url).href;

const book =
  new URL("./assets/registration/reg/book.png", import.meta.url).href;
  

const buttonBg =
  new URL("./assets/registration/reg/buttonbg.png", import.meta.url).href;

const inputBg =
  new URL("./assets/registration/reg/inputBg.png", import.meta.url).href;

const btn =
  new URL("./assets/registration/reg/btn.png", import.meta.url).href;

const searchBg =
  new URL("./assets/registration/reg/searchBg.png", import.meta.url).href;

const line =
  new URL("./assets/registration/reg/line.png", import.meta.url).href;

const wheel =
  new URL("./assets/registration/reg/wheel.png", import.meta.url).href;

const modalFrame =
  new URL("./assets/registration/reg/modalFrame.webp", import.meta.url).href;

const modalFrameMobile =
  new URL("./assets/registration/reg/modalFrameMobile.webp", import.meta.url).href;

const closedBook =
  new URL("./assets/registration/reg/closedBook.webp", import.meta.url).href;

const Scroll1 =
  new URL("./assets/registration/reg/instructionsScroll.webp", import.meta.url).href;

const Scroll2 =
  new URL("./assets/registration/reg/instructionsScrollLong.webp", import.meta.url).href;

const googleButton =
  new URL("./assets/registration/reg/googleReg.svg", import.meta.url).href;

const isMobile = window.innerWidth <= 768;

const mobileAssets = [
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
  Scroll1,
  Scroll2,
  googleButton,
  // lamps,

];

import sandBottom from "./assets/ham/sandBottom.png";
import sandAbove from "./assets/ham/sandAbove.png";
import board from "./assets/ham/board.png";
import guitarBook from "./assets/ham/guitarBook.png";
import trunkStuff from "./assets/ham/trunkStuff.png";

const desktopAssets = [
  trunkStuff,
  guitarBook,
  sandAbove,
  board,
  sandBottom,
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
  Scroll1,
  Scroll2,
  googleButton,
  // lamps,

];


const fonts = [
  "Ramadhan",
  "Syamsiah",
  "EB",
  "EBGaramond",
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
      <aside className="archive-notice">Portfolio archive · OASIS 2026 · Registration is a local demo</aside>
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
