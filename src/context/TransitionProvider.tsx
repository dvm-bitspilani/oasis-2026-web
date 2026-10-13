
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageTransition, {
  type PageKey,
  type PageTransitionHandle,
} from "../components/pageTransition/PageTransition";

type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (to: string, pageKey?: PageKey) => void;
  entered: boolean;
  markEntered: () => void;
};

const TransitionContext = createContext<
  TransitionContextValue | undefined
>(undefined);

type TransitionProviderProps = {
  children: ReactNode;
};

type TransitionStage = "cover" | "reveal";

function getPageKey(to: string): PageKey {
  const path = to.split("?")[0].split("#")[0];

  if (path === "/") return "home";
  if (path.startsWith("/events")) return "events";
  if (path === "/aboutUs" || path.startsWith("/aboutUs/")) {
    return "about";
  }
  if (path.startsWith("/sponsors")) return "sponsors";
  if (path.startsWith("/gallery")) return "gallery";
  if (path.startsWith("/contact")) return "contact";

  return "home";
}

export function TransitionProvider({
  children,
}: TransitionProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [transitioning, setTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);
  const [selectedPage, setSelectedPage] =
    useState<PageKey>("home");

  const transitionRef = useRef<PageTransitionHandle>(null);
  const pendingPathRef = useRef<string | null>(null);
  const navigatingRef = useRef(false);
  const stageRef = useRef<TransitionStage>("cover");

  const markEntered = useCallback(() => {
    setEntered(true);
  }, []);

  const navigateWithTransition = useCallback(
    (to: string, pageKey?: PageKey) => {
      if (navigatingRef.current) return;

      const targetPath = to.split("?")[0].split("#")[0];

      if (targetPath === location.pathname) return;

      navigatingRef.current = true;
      pendingPathRef.current = to;
      stageRef.current = "cover";

      setSelectedPage(pageKey ?? getPageKey(to));
      setEntered(true);
      setTransitioning(true);
    },
    [location.pathname],
  );

  const handleTransitionComplete = useCallback(() => {
    if (stageRef.current === "cover") {
      const destination = pendingPathRef.current;

      if (!destination) {
        navigatingRef.current = false;
        setTransitioning(false);
        return;
      }

      // The selected page now covers the screen.
      stageRef.current = "reveal";
      navigate(destination);

      // Allow the destination page to render underneath.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          transitionRef.current?.resumeCurtain();
        });
      });

      return;
    }

    // The transition has finished revealing the new page.
    pendingPathRef.current = null;
    navigatingRef.current = false;
    setTransitioning(false);
  }, [navigate]);

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
          selectedPage={selectedPage}
          onComplete={handleTransitionComplete}
        />
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "useTransition must be used within a TransitionProvider",
    );
  }

  return context;
}
