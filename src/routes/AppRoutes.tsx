import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";


// ======================================================
// LAZY LOADED PAGES
// ======================================================

const Home = lazy(() => import("../pages/Home"));
// import Ham from "../pages/Ham/Ham.jsx"
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
    <>
      <Suspense fallback={<p style={{padding:32,color:"#f5deb3"}}>Loading archive…</p>}>
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
          

          <Route path="*" element={<main style={{padding:40,color:"#f5deb3"}}><h1>Page not found</h1><a href="/">Explore OASIS 2026</a></main>} />
        </Routes>
      </Suspense>
    </>
  );
}