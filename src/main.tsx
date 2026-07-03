import React from "react";
import ReactDOM from "react-dom/client";
import GymTracker from "./GymTracker";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GymTracker />
  </React.StrictMode>
);

// Keeps the iOS home-screen app fresh (network-first) and working offline
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {});
  });
}
