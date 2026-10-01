import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import { loadHome, loadRegistration, loadComingSoon, loadAbout, loadContact, loadEvents } from "../loading/routes";

const Home = lazy(loadHome);
const Registration = lazy(loadRegistration);
const ComingSoon = lazy(loadComingSoon);
const About = lazy(loadAbout);
const Contact = lazy(loadContact);
const EventsPage = lazy(loadEvents);

// ======================================================
// TYPES
// ======================================================

interface AppRoutesProps {
  preloaderDone: boolean;
  preloaderExiting: boolean;
  onHomeIntroComplete: () => void;
}

// ======================================================
// APP ROUTES
// ======================================================

export default function AppRoutes({
  preloaderDone,
  preloaderExiting,
  onHomeIntroComplete,
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
                onIntroComplete={onHomeIntroComplete}
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