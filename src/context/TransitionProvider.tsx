import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import PageTransition, {
  type PageTransitionHandle,
} from "../components/pageTransition/PageTransition";

// ---------- Contact assets ----------
import map from "../assets/contact/map.webp";
import cross from "../assets/contact/cross.webp";
import back from "../assets/contact/backButton.webp";
import mail from "../assets/contact/mail.webp";
// Referenced only via CSS url() in Contact.module.scss; imported here just to
// get their bundler-resolved URLs so they can be preloaded.
import cardBg from "../assets/contact/card.webp";
import pageBg from "../assets/contact/page.webp";
import pageMobBg from "../assets/contact/pageMob.webp";

import dvm from "../assets/contact/avyaktVerma.webp";
import pcr from "../assets/contact/snehaSrivastava1.jpeg";
import adp from "../assets/contact/devanshAgarwal.jpg";
import spons from "../assets/contact/prafulMalik.jpg";
import controls from "../assets/contact/shreyasAnand.webp";
import recnacc from "../assets/contact/prithviGowda.webp";
import prez from "../assets/contact/pulkitBhardwaj.webp";
import gensec from "../assets/contact/kushalPoosala.jpeg";

// ---------- Events assets ----------
import dramaVase from "../assets/Events/dramaVase.webp";
import photographyVase from "../assets/Events/photographyVase.webp";
import danceVase from "../assets/Events/danceVase.webp";
import otherVase from "../assets/Events/otherVase.webp";
import musicVase from "../assets/Events/musicVase.webp";
import eventsTitle from "../assets/Events/eventsTitle.webp";

import Swaranjali from "../assets/Events/swaranjali.webp";
import PitchPerfect from "../assets/Events/pitchPerfect.webp";
import Tarang from "../assets/Events/tarang.webp";
import Andholika from "../assets/Events/andholika.webp";
import RapWars from "../assets/Events/rapWars.webp";
import Axetacy from "../assets/Events/axtacy.webp";
import DrumDuels from "../assets/Events/drumDuels.webp";
import BeatBrawl from "../assets/Events/beatBrawl.webp";
import FashP from "../assets/Events/fashP.webp";
import Choreo from "../assets/Events/choreo.webp";
import StreetDance from "../assets/Events/streetDance.webp";
import DesertDuel from "../assets/Events/desertDuel.webp";
import Razzmatazz from "../assets/Events/razzmatazz.webp";
import Tandav from "../assets/Events/tandav.webp";
import Sukhmanch from "../assets/Events/sukhmanch.webp";
import StreetPlay from "../assets/Events/streetPlay.webp";
import StagePlay from "../assets/Events/stagePlay.webp";
import Metamorphosis from "../assets/Events/metamorphosis.webp";
import Hypercut from "../assets/Events/hypercut.webp";

// ---------- About assets ----------
const bgback = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418120/bgback.webp";
const cloud = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418122/cloud.webp";
const backBg = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418120/bgBottom.webp";
const leftCloud = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418215/leftCloud.webp";
const leftTop = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418356/pillarTop-trimmed.webp";
const leftTopMob = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418222/leftTop-trimmed.webp";
const head = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418214/head.png";
const lamp = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418215/lamp.webp";
const bgCon = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790412288/bgCont.png";
const play = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418372/play.webp";
const ff = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418213/ffControl.png";
const playBtn = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418372/playBtn.webp";
const bgVid = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790412288/bgVideo.png";
const cover = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418147/cover.webp";
const backBtn = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418120/backBtn.webp";
const scrollVid = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418373/scrollVid.png";


// ---------- Dev page assets ----------
// back team
import devBackAbhi from "../assets/DevPage/back/abhi.png";
import devBackAkshat from "../assets/DevPage/back/akshat.jpg";
import devBackIshan from "../assets/DevPage/back/ishan.jpg";
import devBackRaghav from "../assets/DevPage/back/raghav.jpeg";
// design team
import devDesignAgastya from "../assets/DevPage/design/agastya.jpg";
import devDesignAgrima from "../assets/DevPage/design/agrima.jpg";
import devDesignDriv from "../assets/DevPage/design/driv.jpg";
import devDesignKrishna from "../assets/DevPage/design/krishna.jpg";
import devDesignParin from "../assets/DevPage/design/parin.jpeg";
import devDesignShayan from "../assets/DevPage/design/shayan.jpeg";
// frontend team
import devFrontArchit from "../assets/DevPage/front/archit.jpeg";
import devFrontGantavya from "../assets/DevPage/front/gantavya.png";
import devFrontUjaas from "../assets/DevPage/front/ujaas.jpeg";
import devFrontVeer from "../assets/DevPage/front/veer.jpeg";
// shared images
import devBackButton from "../assets/DevPage/BackButton.png";
import devBackend from "../assets/DevPage/Backend.png";
import devBg from "../assets/DevPage/bg.png";
import devBgBlue from "../assets/DevPage/bgBlue.png";
import devBgPhone from "../assets/DevPage/bgphone.png";
import devBgPurple from "../assets/DevPage/bgPurple.png";
import devBpPink from "../assets/DevPage/bpPink.png";
import devCharacter from "../assets/DevPage/character.png";
import devFrontend from "../assets/DevPage/Frontend.png";
import devHeading from "../assets/DevPage/heading.png";
import devProfile from "../assets/DevPage/profile.png";
import devRightTop from "../assets/DevPage/rightTop.png";
import devSideCurtain from "../assets/DevPage/sideCurtain.png";
import devSideCurtainBlue from "../assets/DevPage/sideCurtainBlue.png";


// ---------- Sponsors assets ----------
import sponsBg from "../assets/home/bg.jpg";
import sponsPepero from "../assets/spons/pep.jpeg";
import sponsTravel from "../assets/spons/travel.jpeg";
import sponsDenver from "../assets/spons/denver.jpeg";
import sponsKsheer from "../assets/spons/Ksheer.png";
import sponsRungta from "../assets/spons/rungta.jpeg";
import sponsCampa from "../assets/spons/campa.jpeg";
import sponsInglu from "../assets/spons/ing.png";
import sponsTiny from "../assets/spons/tiny.jpeg";
import sponsMaa from "../assets/spons/maa.png";
import sponsToo from "../assets/spons/too-yum.jpg";
import sponsSkippi from "../assets/spons/skippi.jpg";
import sponsNuware from "../assets/spons/nuware.png";
import sponsElova from "../assets/spons/elova.png";
import sponsPlum from "../assets/spons/plum.png";
import sponsMs from "../assets/spons/ms.jpg";
import sponsGaba from "../assets/spons/gaba.png";
import sponsAcer from "../assets/spons/acer.png";
import sponsHdfc from "../assets/spons/hdfc.png";
import sponsAbhi from "../assets/spons/abhibus.jpeg";
import sponsPost from "../assets/spons/post.png";
import sponsJio from "../assets/spons/jio.png";
import sponsEverything from "../assets/spons/ever.png";
import sponsFalcon from "../assets/spons/flacon.jpeg";
import sponsQsw from "../assets/spons/qsw.png";


const ABOUT_ASSETS = [
  bgback, cloud, backBg, leftCloud, leftTop, leftTopMob, head, lamp,
  bgCon, play, ff, playBtn, bgVid, cover, backBtn, scrollVid,
];

const CONTACT_ASSETS = [
  map, cross, back, mail, cardBg, pageBg, pageMobBg,
  dvm, pcr, adp, spons, controls, recnacc, prez, gensec,
];

const EVENTS_ASSETS = [
  dramaVase, photographyVase, danceVase, otherVase, musicVase, eventsTitle,
  Swaranjali, PitchPerfect, Tarang, Andholika, RapWars, Axetacy, DrumDuels,
  BeatBrawl, FashP, Choreo, StreetDance, DesertDuel, Razzmatazz, Tandav,
  Sukhmanch, StreetPlay, StagePlay, Metamorphosis, Hypercut,
];
const DEV_ASSETS = [
  // back
  devBackAbhi, devBackAkshat, devBackIshan, devBackRaghav,
  // design
  devDesignAgastya, devDesignAgrima, devDesignDriv, devDesignKrishna,
  devDesignParin, devDesignShayan,
  // front
  devFrontArchit, devFrontGantavya, devFrontUjaas, devFrontVeer,
  // shared
  devBackButton, devBackend, devBg, devBgBlue, devBgPhone, devBgPurple,
  devBpPink, devCharacter, devFrontend, devHeading, devProfile, devRightTop,
  devSideCurtain, devSideCurtainBlue,
];

const SPONSORS_ASSETS = [
  sponsBg, sponsPepero, sponsTravel, sponsDenver, sponsKsheer, sponsRungta,
  sponsCampa, sponsInglu, sponsTiny, sponsMaa, sponsToo, sponsSkippi,
  sponsNuware, sponsElova, sponsPlum, sponsMs, sponsGaba, sponsAcer,
  sponsHdfc, sponsAbhi, sponsPost, sponsJio, sponsEverything, sponsFalcon,
  sponsQsw,
];
// ---------- Per-route config ----------
// assets : preloaded by PageTransition while the strings animate / tornado forms
// chunk  : JS loader for the lazy route, so the page code is ready before navigating
//
// Keys MUST be lowercase and match the paths in AppRoutes.tsx
// (/aboutUs -> "/aboutus", /contactus -> "/contactus", etc.).
type RouteConfig = {
  assets: string[];
  chunk?: () => Promise<unknown>;
};

const ROUTES: Record<string, RouteConfig> = {
  "/": { assets: [], chunk: () => import("../pages/Home") },
  "/aboutus": { assets: ABOUT_ASSETS, chunk: () => import("../pages/About") },
  "/contactus": { assets: CONTACT_ASSETS, chunk: () => import("../pages/Contact") },
  "/events": {
    assets: EVENTS_ASSETS,
    chunk: () => import("../pages/EventsPage/EventsPage"),
  },
  "/DevPage": { assets: DEV_ASSETS, chunk: () => import("../pages/DevPage/Devpageresponsive") },
  "/register": {
    assets: [],
    chunk: () => import("../pages/registration/Registration"),
  },
  "/comingsoon": { assets: [], chunk: () => import("../pages/ComingSoon") },
  "/sponsors": {
    assets: SPONSORS_ASSETS,
    chunk: () => import("../pages/spons/Sponsers"),
  },
};

type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (to: string) => void;
  entered: boolean;
  markEntered: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const PRELOADER_KEY = "oasis_preloader_shown";

// Safety nets so a failure can never leave the user stuck under the smoke.
const ROUTE_TIMEOUT_MS = 8000;
const PAGE_READY_TIMEOUT_MS = 25000;
const OLD_PAGE_TIMEOUT_MS = 5000;

// Only show the loader if loading takes longer than this after the burst.
const LOADER_DELAY_MS = 400;

// Elements that only exist on the OLD page. Once they are gone from the DOM,
// we know React has really swapped to the new page.
const OLD_PAGE_MARKERS =
  "[data-cloud-string],[data-castle-drown],[data-moon-shrink],[data-transition-fade]";

const normalizePath = (path: string) =>
  path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

// Lowercase key used to look up ROUTES (React Router matches case-insensitively).
const routeKey = (path: string) => normalizePath(path).toLowerCase();

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

// Resolves once every element from the old page has been removed from the DOM.
// Never blocks forever.
function waitForOldPageGone(
  old: Element[],
  timeoutMs = OLD_PAGE_TIMEOUT_MS,
): Promise<void> {
  if (old.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    const start = performance.now();
    const check = () => {
      if (
        old.every((el) => !el.isConnected) ||
        performance.now() - start > timeoutMs
      ) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const decodeSafe = (img: HTMLImageElement): Promise<void> =>
  img.decode
    ? img.decode().then(
        () => undefined,
        () => undefined,
      )
    : Promise.resolve();

// Load + decode an image by URL (used for CSS background images).
const loadImageUrl = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      decodeSafe(img).then(resolve);
    };
    img.onerror = () => resolve();
    img.src = url;
  });

const isNearViewport = (el: Element) => {
  const r = el.getBoundingClientRect();
  return (
    r.bottom > -200 &&
    r.top < window.innerHeight + 200 &&
    r.right > -200 &&
    r.left < window.innerWidth + 200
  );
};

const BG_URL_RE = /url\((["']?)(.*?)\1\)/g;

// Finds every CSS background-image url() currently applied in the page,
// including ::before and ::after. <img> tags alone miss these, which is why
// pages could look black even though "all images" had loaded.
function collectBackgroundUrls(): string[] {
  const urls = new Set<string>();

  const add = (value: string) => {
    if (!value || value === "none") return;
    BG_URL_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BG_URL_RE.exec(value))) {
      const url = match[2];
      if (url && !url.startsWith("data:")) urls.add(url);
    }
  };

  document.querySelectorAll<HTMLElement>("html, body, body *").forEach((el) => {
    add(getComputedStyle(el).backgroundImage);
    add(getComputedStyle(el, "::before").backgroundImage);
    add(getComputedStyle(el, "::after").backgroundImage);
  });

  return Array.from(urls);
}

// Waits until the NEW page is really ready to be seen:
//  - every <img> has loaded and decoded
//  - every CSS background image has loaded and decoded
//  - nothing new has appeared for a few frames (late-mounting components)
// Repeats in rounds because new elements can mount while we wait.
// Capped by PAGE_READY_TIMEOUT_MS so it can never block forever.
async function waitForPageReady(): Promise<void> {
  const deadline = performance.now() + PAGE_READY_TIMEOUT_MS;
  const timeLeft = () => Math.max(0, deadline - performance.now());

  const handledBg = new Set<string>();
  const handledImgs = new WeakSet<HTMLImageElement>();
  let calmRounds = 0;

  while (calmRounds < 3 && timeLeft() > 0) {
    const tasks: Promise<void>[] = [];

    for (const img of Array.from(document.images)) {
      if (handledImgs.has(img)) continue;
      // Lazy images far off-screen never load on their own; do not wait for them.
      if (img.loading === "lazy" && !isNearViewport(img)) continue;
      handledImgs.add(img);

      tasks.push(
        img.complete
          ? decodeSafe(img)
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }).then(() => decodeSafe(img)),
      );
    }

    for (const url of collectBackgroundUrls()) {
      if (handledBg.has(url)) continue;
      handledBg.add(url);
      tasks.push(loadImageUrl(url));
    }

    if (tasks.length > 0) {
      calmRounds = 0;
      await Promise.race([Promise.all(tasks), sleep(timeLeft())]);
    } else {
      calmRounds += 1;
    }

    await waitForNextPaint();
  }
}

// Spinner shown over the plain sand-colored screen after the tornado burst,
// only when loading the destination takes a while.
function SandLoader() {
  return (
    <div className="sand-loader" role="status" aria-label="Loading">
      <style>{`
        .sand-loader {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          /* must sit above PageTransition; raise if your smoke layer is higher */
          z-index: 2147483000;
          animation: sandLoaderIn 300ms ease-out both;
        }
        .sand-loader__ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 5px solid rgba(107, 74, 43, 0.25);
          border-top-color: #6b4a2b;
          animation: sandLoaderSpin 0.9s linear infinite;
        }
        @keyframes sandLoaderSpin { to { transform: rotate(360deg); } }
        @keyframes sandLoaderIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div className="sand-loader__ring" />
    </div>
  );
}

type TransitionStage = "strings" | "smoke";

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [transitioning, setTransitioning] = useState(false);

  // Loader shown after the burst if loading takes longer than LOADER_DELAY_MS.
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimerRef = useRef<number | undefined>(undefined);

  // Handed to PageTransition at mount (same batch as `transitioning`).
  // PageTransition holds the tornado burst until all of these have loaded.
  const [transitionAssets, setTransitionAssets] = useState<string[]>([]);
  const [transitionPreload, setTransitionPreload] =
    useState<(() => Promise<unknown>) | undefined>(undefined);

  const pendingPathRef = useRef<string | null>(null);
  const routeResolveRef = useRef<(() => void) | null>(null);

  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(PRELOADER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const transitionRef = useRef<PageTransitionHandle>(null);
  const navigatingRef = useRef(false);
  const transitionStageRef = useRef<TransitionStage>("strings");

  // Make sure the loader timer can never fire after unmount.
  useEffect(() => {
    return () => window.clearTimeout(loaderTimerRef.current);
  }, []);

  // Latest pathname for async callbacks + resolves the "route changed" wait.
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;

    const destination = pendingPathRef.current;
    if (
      destination &&
      normalizePath(location.pathname) === normalizePath(destination)
    ) {
      routeResolveRef.current?.();
      routeResolveRef.current = null;
    }
  }, [location.pathname]);

  const markEntered = useCallback(() => {
    setEntered(true);
    try {
      sessionStorage.setItem(PRELOADER_KEY, "true");
    } catch {
      // Ignore storage errors.
    }
  }, []);

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (
        normalizePath(to) === normalizePath(pathnameRef.current) ||
        navigatingRef.current
      ) {
        return;
      }

      markEntered();

      navigatingRef.current = true;
      transitionStageRef.current = "strings";
      pendingPathRef.current = to;

      // From ANY page: PageTransition starts loading the destination's assets
      // and JS chunk the moment it mounts, in parallel with the strings and
      // the tornado forming.
      const config = ROUTES[routeKey(to)];
      setTransitionAssets(config?.assets ?? []);
      setTransitionPreload(() => config?.chunk);

      setTransitioning(true);
    },
    [markEntered],
  );

  // Fired when the burst has fully covered the screen. By now the tornado has
  // formed AND the destination's assets, JS chunk and fonts are preloaded
  // (PageTransition guarantees it), so the wait below should be short.
  // The route changes ONLY here, after the burst.
  const handleTransitionComplete = useCallback(async () => {
    const destination = pendingPathRef.current;

    if (!destination) {
      window.clearTimeout(loaderTimerRef.current);
      setShowLoader(false);
      navigatingRef.current = false;
      setTransitioning(false);
      return;
    }

    try {
      // Burst is done and the screen is plain sand: show the loader
      // only if the wait turns out to be long.
      loaderTimerRef.current = window.setTimeout(
        () => setShowLoader(true),
        LOADER_DELAY_MS,
      );

      // Snapshot the old page's elements BEFORE navigating.
      const oldMarkers = Array.from(
        document.querySelectorAll(OLD_PAGE_MARKERS),
      );

      let timer: number | undefined;
      const routeChanged = new Promise<void>((resolve) => {
        if (
          normalizePath(pathnameRef.current) === normalizePath(destination)
        ) {
          resolve();
          return;
        }
        routeResolveRef.current = resolve;
        timer = window.setTimeout(resolve, ROUTE_TIMEOUT_MS);
      });

      navigate(destination);
      await routeChanged;
      window.clearTimeout(timer);

      await waitForOldPageGone(oldMarkers);
      await waitForNextPaint();
      await waitForNextPaint();
      await waitForPageReady();
      try {
        await document.fonts?.ready;
      } catch {
        // Ignore font errors.
      }
      await sleep(150);
      await waitForNextPaint();
      await waitForNextPaint();
    } catch (err) {
      console.error("Transition error:", err);
    } finally {
      // Remove the loader right before the smoke fades away.
      window.clearTimeout(loaderTimerRef.current);
      setShowLoader(false);

      // Always fade the smoke away, even if something above failed.
      transitionRef.current?.resumeSmoke();
    }
  }, [navigate]);

  const handleTransition = useCallback(async () => {
    // FIRST completion: burst done, screen fully covered.
    if (transitionStageRef.current === "strings") {
      transitionStageRef.current = "smoke";
      await handleTransitionComplete();
      return;
    }

    // SECOND completion: smoke has faded away.
    transitionStageRef.current = "strings";
    pendingPathRef.current = null;
    routeResolveRef.current = null;
    setTransitioning(false);
    navigatingRef.current = false;
  }, [handleTransitionComplete]);

  const contextValue = useMemo<TransitionContextValue>(
    () => ({ transitioning, navigateWithTransition, entered, markEntered }),
    [transitioning, navigateWithTransition, entered, markEntered],
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}

      {transitioning && (
        <PageTransition
          ref={transitionRef}
          assets={transitionAssets}
          preload={transitionPreload}
          onComplete={handleTransition}
        />
      )}

      {transitioning && showLoader && <SandLoader />}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
}