import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
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
  navigateWithTransition: (to: string) => void;
  entered: boolean;
  markEntered: () => void;
};

const TransitionContext =
  createContext<TransitionContextValue | null>(null);

const PRELOADER_KEY = "oasis_preloader_shown";

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

type TransitionStage = "strings" | "curtain";

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

  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(PRELOADER_KEY) === "true"
      );
    } catch {
      return false;
    }
  });

  const transitionRef =
    useRef<PageTransitionHandle>(null);

  const navigatingRef =
    useRef(false);

  const transitionStageRef =
    useRef<TransitionStage>("strings");

  // =========================================
  // PRELOADER STATE
  // =========================================

  const markEntered = useCallback(() => {
    setEntered(true);

    try {
      sessionStorage.setItem(
        PRELOADER_KEY,
        "true",
      );
    } catch {
      // Ignore storage errors.
    }
  }, []);

  // =========================================
  // NAVIGATION
  // =========================================

  const navigateWithTransition = useCallback(
    (to: string) => {
      const currentPath = location.pathname;

      if (
        to === currentPath ||
        navigatingRef.current
      ) {
        return;
      }

      // Skip transition when entering or leaving About Us.
      if (
        to === "/aboutUs" ||
        currentPath === "/aboutUs"
      ) {
        markEntered();
        navigate(to);
        return;
      }

      markEntered();

      navigatingRef.current = true;
      transitionStageRef.current = "strings";

      setPendingPath(to);
      setTransitioning(true);
    },
    [
      location.pathname,
      markEntered,
      navigate,
    ],
  );

  // =========================================
  // FIRST TRANSITION COMPLETE
  // =========================================

  const handleTransitionComplete =
    useCallback(async () => {
      const destination = pendingPath;

      if (!destination) {
        navigatingRef.current = false;
        setTransitioning(false);
        return;
      }

      /*
       * Strings have finished.
       * Curtain is paused while covering the screen.
       */

      navigate(destination);

      /*
       * Allow the new route to mount and paint.
       */
      await waitForNextPaint();
      await waitForNextPaint();

      /*
       * Resume the same curtain animation.
       */
      transitionRef.current?.resumeCurtain();
    }, [
      navigate,
      pendingPath,
    ]);

  // =========================================
  // TRANSITION HANDLER
  // =========================================

  const handleTransition =
    useCallback(async () => {
      /*
       * FIRST completion:
       * strings have finished.
       */
      if (
        transitionStageRef.current === "strings"
      ) {
        transitionStageRef.current =
          "curtain";

        await handleTransitionComplete();

        return;
      }

      /*
       * SECOND completion:
       * curtain has finished.
       */
      transitionStageRef.current = "strings";

      setPendingPath(null);
      setTransitioning(false);
      navigatingRef.current = false;
    }, [handleTransitionComplete]);

  // =========================================
  // MEMOIZED CONTEXT VALUE
  // =========================================

  const contextValue =
    useMemo<TransitionContextValue>(
      () => ({
        transitioning,
        navigateWithTransition,
        entered,
        markEntered,
      }),
      [
        transitioning,
        navigateWithTransition,
        entered,
        markEntered,
      ],
    );

  return (
    <TransitionContext.Provider
      value={contextValue}
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
  const context =
    useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "useTransition must be used within a TransitionProvider",
    );
  }

  return context;
}