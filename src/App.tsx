import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";
import ReactGA from "react-ga4";
import { homeResources } from "./loading/manifests";
import { startBackgroundLoading, setBackgroundPage } from "./loading/background";

const TRACKING_ID = "GT-PJRTJCBD";
const isOasisDomain = window.location.hostname.includes("bits-oasis.org");
if (isOasisDomain) ReactGA.initialize(TRACKING_ID);

const resources = homeResources();
const assets = resources.filter((resource) => resource.type === "image").map((resource) => resource.url);
const fonts = resources.filter((resource) => resource.type === "font").map((resource) => resource.spec);

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
  const handleHomeIntroComplete = useCallback(() => startBackgroundLoading(), []);

  useEffect(() => {
    setBackgroundPage(location.pathname);
  }, [location.pathname]);

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
            onHomeIntroComplete={handleHomeIntroComplete}
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
