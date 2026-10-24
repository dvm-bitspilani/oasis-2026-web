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
  "/register": {
    assets: [],
    chunk: () => import("../pages/registration/Registration"),
  },
  "/comingsoon": { assets: [], chunk: () => import("../pages/ComingSoon") },
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
const PAGE_IMAGES_TIMEOUT_MS = 4000;
const OLD_PAGE_TIMEOUT_MS = 5000;

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

// Wait until every <img> currently in the page (the new route) has loaded and
// decoded, so nothing pops in when the smoke fades. Never blocks forever.
function waitForPageImages(): Promise<void> {
  const pending = Array.from(document.images)
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    );

  const decodes = Array.from(document.images).map((img) =>
    img.decode ? img.decode().catch(() => undefined) : Promise.resolve(),
  );

  return Promise.race([
    Promise.all([...pending, ...decodes]).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, PAGE_IMAGES_TIMEOUT_MS)),
  ]);
}

type TransitionStage = "strings" | "smoke";

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [transitioning, setTransitioning] = useState(false);

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
  // formed AND every asset has loaded (PageTransition guarantees both).
  const handleTransitionComplete = useCallback(async () => {
    const destination = pendingPathRef.current;

    if (!destination) {
      navigatingRef.current = false;
      setTransitioning(false);
      return;
    }

    try {
      // Snapshot the old page's elements BEFORE navigating.
      const oldMarkers = Array.from(
        document.querySelectorAll(OLD_PAGE_MARKERS),
      );

      // 1. Change the route and wait until the router location has really
      //    changed (timeout is only a safety net).
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

      // 2. The URL changing does not mean the new page has rendered
      //    (lazy routes + React Router's startTransition keep the old page
      //    on screen). Wait until the old page is really gone.
      await waitForOldPageGone(oldMarkers);

      // 3. Let the new route mount and paint, then make sure its images and
      //    fonts are loaded so the page under the smoke is complete.
      await waitForNextPaint();
      await waitForNextPaint();
      await waitForPageImages();
      try {
        await document.fonts?.ready;
      } catch {
        // Ignore font errors.
      }
      await waitForNextPaint();
    } catch (err) {
      console.error("Transition error:", err);
    } finally {
      // 4. Always fade the smoke away, even if something above failed,
      //    so the user can never be stuck under it.
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