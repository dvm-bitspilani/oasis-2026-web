import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { CookiesProvider } from "react-cookie";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookiesProvider>
      <GoogleOAuthProvider clientId="425843336268-s352aj1hnh6m54n40ga6vtuoke5jma4b.apps.googleusercontent.com">
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </GoogleOAuthProvider>
    </CookiesProvider>
  </StrictMode>
);