import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";
import Registration from "../pages/registration//Registration";
import Home from "../pages/Home";
import About from "../pages/About";
import ComingSoon from "../pages/ComingSoon";
import Reg from "../pages/registration/components/reg"
import Events from "../pages/registration/components/Events/Events"
export default function AppRoutes() {
  return (
    <TransitionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/reg" element={<Reg />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/eventsReg" element={<Events />} />
      </Routes>
    </TransitionProvider>
  );
}