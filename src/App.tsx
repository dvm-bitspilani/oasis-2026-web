import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./pages/Preloader";

import camel from "./assets/camelLand.png";

const assets = [
  camel
];

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      {!entered && (
        <Preloader
          assets={assets}
          onEnter={() => setEntered(true)}
        />
      )}

      <AppRoutes />
    </>
  );
}