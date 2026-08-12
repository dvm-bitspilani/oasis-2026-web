import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition, {
  type PageTransitionHandle,
} from "../components/pageTransition/PageTransition";

type TransitionContextValue = {
  transitioning: boolean;
  navigateWithTransition: (to: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [transitioning, setTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const transitionRef = useRef<PageTransitionHandle>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithTransition = (to: string) => {
    if (to === location.pathname || transitioning) return;
    setPendingPath(to);
    setTransitioning(true);
  };

  return (
    <TransitionContext.Provider
      value={{ transitioning, navigateWithTransition }}
    >
      {children}

      {transitioning && (
        <PageTransition
          ref={transitionRef}
          onComplete={async () => {
            // Doors fully closed, screen fully covered.
            if (pendingPath) navigate(pendingPath);

            // Let React actually paint the new route behind the closed doors.
            await waitForNextPaint();

            // Doors open, revealing the new page.
            await transitionRef.current?.openDoors();

            setTransitioning(false);
            setPendingPath(null);
          }}
        />
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return ctx;
}