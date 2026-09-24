import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

// ======================================================
// LAZY LOADED PAGES
// ======================================================

const Home = lazy(() => import("../pages/Home"));

const Registration = lazy(
  () => import("../pages/registration/Registration")
);

const ComingSoon = lazy(
  () => import("../pages/ComingSoon")
);

const About = lazy(
  () => import("../pages/About")
);

const Contact = lazy(
  () => import("../pages/Contact")
);

const EventsPage = lazy(
  () => import("../pages/EventsPage/EventsPage")
);

// ======================================================
// TYPES
// ======================================================

interface AppRoutesProps {
  preloaderDone: boolean;
  preloaderExiting: boolean;
}

// ======================================================
// APP ROUTES
// ======================================================

export default function AppRoutes({
  preloaderDone,
  preloaderExiting,
}: AppRoutesProps) {
  return (
    <TransitionProvider>
      <Suspense fallback={null}>
        <Routes>

          {/* ==================================================
              HOME
          ================================================== */}

          <Route
            path="/"
            element={
              <Home
                preloaderDone={preloaderDone}
                preloaderExiting={preloaderExiting}
              />
            }
          />

          {/* ==================================================
              COMING SOON
          ================================================== */}

          <Route
            path="/comingsoon"
            element={<ComingSoon />}
          />

          {/* ==================================================
              CONTACT
          ================================================== */}

          <Route
            path="/contactus"
            element={<Contact />}
          />

          {/* ==================================================
              REGISTRATION
          ================================================== */}

          <Route
            path="/register"
            element={<Registration />}
          />

          {/* ==================================================
              ABOUT
          ================================================== */}

          <Route
            path="/aboutUs"
            element={<About />}
          />

          {/* ==================================================
              EVENTS
          ================================================== */}

          <Route
            path="/events"
            element={<EventsPage />}
          />

        </Routes>
      </Suspense>
    </TransitionProvider>
  );
}