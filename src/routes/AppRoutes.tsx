import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import Home from "../pages/Home";

// Lazy-loaded routes
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

interface AppRoutesProps {
  preloaderDone: boolean;
  preloaderExiting: boolean;
}

export default function AppRoutes({
  preloaderDone,
  preloaderExiting,
}: AppRoutesProps) {
  return (
    <TransitionProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                preloaderDone={preloaderDone}
                preloaderExiting={preloaderExiting}
              />
            }
          />

          <Route
            path="/comingsoon"
            element={<ComingSoon />}
          />

          <Route
            path="/contactus"
            element={<Contact />}
          />

          <Route
            path="/register"
            element={<Registration />}
          />

          {/* <Route
            path="/eventReg"
            element={<Events />}
          /> */}

          <Route
            path="/aboutUs"
            element={<About />}
          />

          <Route
            path="/events"
            element={<EventsPage />}
          />
        </Routes>
      </Suspense>
    </TransitionProvider>
  );
}