import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";
import { useTransition } from "./context/TransitionProvider";
import ReactGA from "react-ga4";
import { getPreloaderAssets } from "./assets/preloaderLists";

const TRACKING_ID = "GT-PJRTJCBD";

const isOasisDomain = window.location.hostname.includes("bits-oasis.org");

if (isOasisDomain) {
  ReactGA.initialize(TRACKING_ID);
}

const fonts = ["Ramadhan", "Syamsiah", "EB", "EB Garamond", "Cinzel"];

// Built once at module load (mobile / desktop decided by viewport width).
const assets = getPreloaderAssets();

/* ======================================================
   INTRO (PRELOADER) - ONLY ON THE VERY FIRST LOAD
   Lives at module level, NOT in React state, so it survives
   App remounts and route changes. It resets only on a full
   browser reload. If the site is first opened on a page other
   than "/", the intro is skipped for the whole session.
====================================================== */

let introCompleted = window.location.pathname !== "/";

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
     PREFETCH HEAVY ROUTE CHUNKS (while the preloader runs)
  ====================================================== */

  useEffect(() => {
    import("./pages/registration/Registration").catch(() => undefined);
    import("./pages/Home").catch(() => undefined);
  }, []);

  /* ======================================================
     PRELOADER STATE
     Initialised from the module-level flag, so a remounted
     App never shows the preloader again.
  ====================================================== */

  const [preloaderDone, setPreloaderDone] = useState(introCompleted);

  const [homeExiting, setHomeExiting] = useState(introCompleted);

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
    introCompleted = true; // never show the intro again this session
    markEntered();
    setPreloaderDone(true);
    setHomeExiting(true);
  };

  /* ======================================================
     INTRO STATE
     (introCompleted is checked too, as a hard guard)
  ====================================================== */

  const showIntro = isHome && !preloaderDone && !introCompleted;

  return (
    <>
      {/* ==================================================
          HOME PAGE TRANSITION WRAPPER
      ================================================== */}

      <div
        style={
          showIntro
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
            showIntro
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
            preloaderDone={preloaderDone || introCompleted}
            preloaderExiting={homeExiting}
          />
        </div>
      </div>

      {/* ==================================================
          PRELOADER
      ================================================== */}

      {showIntro && (
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