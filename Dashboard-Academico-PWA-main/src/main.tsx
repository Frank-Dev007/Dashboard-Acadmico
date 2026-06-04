import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./pwa-responsive.css";

createRoot(document.getElementById("root")!).render(<App />);

// ─── Registro del Service Worker (PWA) ───────────────────────────────────────
// Se registra tras cargar la ventana para no competir con el arranque de la app.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("✅ Service Worker registrado:", reg.scope);
      })
      .catch((err) => {
        console.warn("⚠️ No se pudo registrar el Service Worker:", err);
      });
  });
}
