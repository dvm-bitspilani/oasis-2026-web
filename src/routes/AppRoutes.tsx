import { Route, Routes } from "react-router-dom";
import { TransitionProvider } from "../context/TransitionProvider";
import Registration from "../pages/registration//Registration";
import Home from "../pages/Home";
import Events from "../pages/registration/components/Events/Events"
import ComingSoon from "../pages/ComingSoon";
export default function AppRoutes() {
  return (
    <TransitionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/eventReg" element={<Events />} />

      </Routes>
    </TransitionProvider>
  ); 
}