import { useState } from "react";
import Home from "./pages/Home";
import Preloader from "./components/Preloader/Preloader";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <Preloader
          onComplete={() => setLoading(false)}
        />
      )}

      <Home />
    </>
  );
}