import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";

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

const assets = [
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
];

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Single source of truth now lives in TransitionProvider so any
  // page (e.g. ComingSoon's "Go Home" button) can mark "entered"
  // before navigating, without App having stale local state.
  const { entered, markEntered } = useTransition();

  const [homeExiting, setHomeExiting] = useState<boolean>(entered);

  const handlePreloaderExit = () => {
    setHomeExiting(true);
  };

  const handleEnter = () => {
    markEntered();
    setHomeExiting(true);
  };

  const introActive = isHome && !entered;

  return (
    <>
      <div
        style={
          introActive
            ? { position: "fixed", inset: 0, overflow: "hidden" }
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
                    ? "transform 1.15s cubic-bezier(0.76, 0, 0.24, 1)"
                    : "none",
                  willChange: "transform",
                }
              : undefined
          }
        >
          <AppRoutes preloaderDone={entered} preloaderExiting={homeExiting} />
        </div>
      </div>

      {isHome && !entered && (
        <Preloader
          assets={assets}
          onExitStart={handlePreloaderExit}
          onEnter={handleEnter}
        />
      )}
    </>
  );
}