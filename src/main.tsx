import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App.tsx";
import { TransitionProvider } from "./context/TransitionProvider";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
        <HelmetProvider>
          <BrowserRouter>
            <TransitionProvider>
              <App />
            </TransitionProvider>
          </BrowserRouter>
        </HelmetProvider>
  </StrictMode>,
);