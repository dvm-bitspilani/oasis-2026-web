import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import Home from "../pages/Home";
import About from "../pages/About";
import ComingSoon from "../pages/ComingSoon";

export default function AppRoutes() {
  return (
    <TransitionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
      </Routes>
    </TransitionProvider>
  );
}