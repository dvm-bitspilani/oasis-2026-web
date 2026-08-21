import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import Registration from "../pages/registration//Registration";
import Home from "../pages/Home";
import Events from "../pages/registration/components/Events/Events";
import ComingSoon from "../pages/ComingSoon";

interface AppRoutesProps {
  preloaderDone: boolean;
}

export default function AppRoutes({
  preloaderDone,
}: AppRoutesProps) {
  return (
    <TransitionProvider>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              preloaderDone={preloaderDone}
            />
          }
        />

        <Route
          path="/comingsoon"
          element={<ComingSoon />}
        />

        <Route
          path="/register"
          element={<Registration />}
        />

        <Route
          path="/eventReg"
          element={<Events />}
        />
      </Routes>
    </TransitionProvider>
  );
}