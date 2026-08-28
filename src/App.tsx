import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";

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
import lamps from "/game-icons_magic-lamp.svg";
import instructionsBG from "/instructionsBG.png";

/* ======================================================
   PRELOADER ASSETS
====================================================== */

const assets = [
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
  modalFrameMobile,
  closedBook,

  Syamsiah,
  EB,
  Cinzel,

  Scroll1,
  Scroll2,

  googleButton,
  lamps,
  instructionsBG,
];

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

  /*
   * IMPORTANT:
   *
   * Do NOT initialize this from `entered`.
   *
   * `entered` can remain true inside TransitionProvider,
   * which causes the preloader to be skipped after reload.
   *
   * This state belongs to this App mount, so every browser
   * reload starts with:
   *
   * preloaderDone = false
   */
  const [preloaderDone, setPreloaderDone] = useState(false);

  /*
   * Controls the home page curtain/content entrance.
   *
   * Starts false so the home content is initially below
   * the viewport and moves upward when the preloader exits.
   */
  const [homeExiting, setHomeExiting] = useState(false);

  /* ======================================================
     PRELOADER EXIT START
  ====================================================== */

  const handlePreloaderExit = () => {
    /*
     * Start moving the home page into view.
     */
    setHomeExiting(true);
  };

  /* ======================================================
     * ENTER COMPLETE
  ====================================================== */

  const handleEnter = () => {
    /*
     * Keep your existing transition context in sync.
     */
    markEntered();

    /*
     * Tell App that the preloader is completely finished.
     */
    setPreloaderDone(true);

    /*
     * Make sure the home page is visible.
     */
    setHomeExiting(true);
  };

  /* ======================================================
     * INTRO STATE
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
                overflow: "hidden",
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
          onExitStart={handlePreloaderExit}
          onEnter={handleEnter}
        />
      )}
    </>
  );
}