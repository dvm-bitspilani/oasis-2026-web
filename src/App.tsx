import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";

import camel from "./assets/camelLand.png";
import camel1 from "./assets/camel1.svg";
import camel2 from "./assets/camel2.svg";
import camel3 from "./assets/camel3.svg";
import camel4 from "./assets/camel4.svg";
import camelLand from "./assets/camelLand.png";
import Castle from "./assets/Castle.png";
import cloudBig from "./assets/cloudBig.svg";
import cloudSmall from "./assets/cloudSmall.svg";
import cloudThree from "./assets/cloudThree.svg";
import hamLine from "./assets/hamLine.svg";
import LogoOasis from "./assets/LogoOasisi.png";
import Moon from "./assets/Moon.png";
import navCircle from "./assets/navCircle.svg";
import navSan from "./assets/navSan.svg";
import regBtn from "./assets/regBtn.png";
import registerBtn from "./assets/registerBtn.png";
import sand from "./assets/sand.png";
import sandImg from "./assets/sandImg.png";

const assets = [
  camel,
  camel1,
  camel2,
  camel3,
  camel4,
  camelLand,
  Castle,
  cloudBig,
  cloudSmall,
  cloudThree,
  hamLine,
  LogoOasis,
  Moon,
  navCircle,
  navSan,
  regBtn,
  registerBtn,
  sand,
  sandImg,
];

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      {/* Home/App is mounted immediately */}
      <AppRoutes preloaderDone={entered} />

      {/* Preloader stays above everything until it finishes */}
      {!entered && (
        <Preloader
          assets={assets}
          onEnter={() => setEntered(true)}
        />
      )}
    </>
  );
}