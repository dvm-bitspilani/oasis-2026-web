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

type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (
    to: string,
  ) => void;
  entered: boolean;
  markEntered: () => void;
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

const PRELOADER_KEY =
  "oasis_preloader_shown";

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

  const transitionRef =
    useRef<PageTransitionHandle>(null);

  const navigatingRef =
    useRef(false);

  // =========================================
  // PRELOADER STATE
  // =========================================

  const [entered, setEntered] =
    useState<boolean>(() => {
      try {
        return (
          sessionStorage.getItem(
            PRELOADER_KEY,
          ) === "true"
        );
      } catch {
        return false;
      }
    });

  const markEntered = useCallback(() => {
    setEntered(true);

    try {
      sessionStorage.setItem(
        PRELOADER_KEY,
        "true",
      );
    } catch {
      // Ignore storage errors
    }
  }, []);

  // =========================================
  // NAVIGATION
  // =========================================

  const navigateWithTransition = (
    to: string,
  ) => {
    if (
      to === location.pathname ||
      navigatingRef.current
    ) {
      return;
    }

    /*
     * Once the user navigates, the intro
     * preloader should never play again
     * during this session.
     */
    markEntered();

    navigatingRef.current = true;

    setPendingPath(to);
    setTransitioning(true);
  };

  // =========================================
  // STRING + CURTAIN TRANSITION COMPLETE
  // =========================================

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
       * At this point:
       *
       * Strings have finished.
       * Curtain has reached 2 seconds.
       * Curtain is currently PAUSED.
       *
       * The curtain is still covering
       * the screen.
       */

      navigate(destination);

      /*
       * Give React time to mount the new page.
       */
      await waitForNextPaint();

      /*
       * Make absolutely sure the new page
       * has rendered.
       */
      await waitForNextPaint();

      /*
       * Continue the SAME curtain video
       * from exactly where it paused (2s).
       */
      transitionRef.current?.resumeCurtain();
    };

  // =========================================
  // CURTAIN FINISHED
  // =========================================

  /*
   * PageTransition calls onComplete again
   * after resumeCurtain() finishes the video.
   *
   * We need to distinguish that second
   * completion from the first completion
   * at 2 seconds.
   */

  const transitionStageRef =
    useRef<
      "strings" | "curtain"
    >("strings");

  const handleTransition =
    async () => {
      /*
       * First completion:
       *
       * strings → curtain paused at 2s
       */
      if (
        transitionStageRef.current ===
        "strings"
      ) {
        transitionStageRef.current =
          "curtain";

        await handleTransitionComplete();

        return;
      }

      /*
       * Second completion:
       *
       * curtain has completely finished.
       */
      transitionStageRef.current =
        "strings";

      setPendingPath(null);
      setTransitioning(false);
      navigatingRef.current = false;
    };

  return (
    <TransitionContext.Provider
      value={{
        transitioning,
        navigateWithTransition,
        entered,
        markEntered,
      }}
    >
      {children}

      {transitioning && (
        <PageTransition
          ref={transitionRef}
          onComplete={handleTransition}
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