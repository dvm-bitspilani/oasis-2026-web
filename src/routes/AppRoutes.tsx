import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import Registration from "../pages/registration/Registration";
import Home from "../pages/Home";
import ComingSoon from "../pages/ComingSoon";
import About from "../pages/About";
import Contact from "../pages/Contact";

// import EventsReg from "../pages/registration/components/Events/Events"
import EventsPage from "../pages/EventsPage/EventsPage";
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
    </TransitionProvider>
  );
}