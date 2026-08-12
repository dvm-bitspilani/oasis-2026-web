import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";

import Home from "../pages/Home";
import About from "../pages/About";

export default function AppRoutes() {
  return (
    <TransitionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </TransitionProvider>
  );
}