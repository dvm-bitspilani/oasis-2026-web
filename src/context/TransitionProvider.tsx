import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import PageTransition, {
  type PageTransitionHandle,
} from "../components/pageTransition/PageTransition";

type TransitionMode =
  | "full"
  | "doors";

type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (
    to: string,
  ) => void;
  entered: boolean;      // NEW: has the intro preloader already played this session?
  markEntered: () => void; // NEW: lets any page (e.g. ComingSoon) flag "entered" before navigating
};

const TransitionContext =
  createContext<TransitionContextValue | null>(
    null,
  );

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

const HOME_PATH = "/";
const PRELOADER_KEY = "oasis_preloader_shown"; // NEW

export function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [transitioning, setTransitioning] =
    useState(false);

  const [pendingPath, setPendingPath] =
    useState<string | null>(null);

  const [pendingMode, setPendingMode] =
    useState<TransitionMode>("full");

  const transitionRef =
    useRef<PageTransitionHandle>(null);

  const navigatingRef =
    useRef(false);

  // NEW: single source of truth for "has the intro preloader played
  // this session", seeded from sessionStorage so a refresh/deep-link
  // doesn't replay it either.
  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(PRELOADER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const markEntered = useCallback(() => {
    setEntered(true);
    try {
      sessionStorage.setItem(PRELOADER_KEY, "true");
    } catch {
      // ignore write failures (e.g. storage disabled)
    }
  }, []);

  const navigateWithTransition = (
    to: string,
  ) => {
    if (
      to === location.pathname ||
      navigatingRef.current
    ) {
      return;
    }

    // NEW: any real navigation implies the user has "entered" —
    // never show the intro Preloader again after this point
    // (e.g. clicking "Go Home" from ComingSoon should only ever
    // trigger this page transition, not the preloader).
    markEntered();

    navigatingRef.current = true;

    /*
     * Keep your original behaviour:
     *
     * Home -> another page:
     * full transition
     *
     * Any other navigation:
     * doors only
     */
    const mode: TransitionMode =
      location.pathname === HOME_PATH
        ? "full"
        : "doors";

    setPendingPath(to);
    setPendingMode(mode);
    setTransitioning(true);
  };

  const handleTransitionComplete =
    async () => {
      const destination =
        pendingPath;

      if (!destination) {
        navigatingRef.current = false;
        setTransitioning(false);
        return;
      }

      /*
       * IMPORTANT:
       *
       * PageTransition has now completely
       * closed the doors.
       *
       * DO NOT remove it.
       *
       * Change the route while the transition
       * is still covering the screen.
       */
      navigate(destination);

      /*
       * Allow React to mount the destination.
       */
      await waitForNextPaint();

      /*
       * Second paint ensures the destination
       * has actually rendered behind the doors.
       */
      await waitForNextPaint();

      /*
       * Open the SAME PageTransition instance.
       */
      if (transitionRef.current) {
        await transitionRef.current.openDoors();
      }

      /*
       * Only remove PageTransition after
       * the doors have completely opened.
       */
      setPendingPath(null);
      setTransitioning(false);
      navigatingRef.current = false;
    };

  return (
    <TransitionContext.Provider
      value={{
        transitioning,
        navigateWithTransition,
        entered,      // NEW
        markEntered,  // NEW
      }}
    >
      {children}

      {transitioning && (
        <PageTransition
          ref={transitionRef}
          mode={pendingMode}
          onComplete={
            handleTransitionComplete
          }
        />
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx =
    useContext(TransitionContext);

  if (!ctx) {
    throw new Error(
      "useTransition must be used within a TransitionProvider",
    );
  }

  return ctx;
}