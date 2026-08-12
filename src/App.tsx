import { useState } from "react";
import Home from "./pages/Home";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>

      <Home />
    </>
  );
}