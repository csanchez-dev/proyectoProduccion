import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

// ─── Limpieza de sesión al inicio ──────────────────────────────────────────
// sessionStorage solo dura mientras la pestaña está abierta.
// Si no hay bandera de sesión activa en sessionStorage, significa que es
// una carga nueva (nuevo abrir del navegador, refresh en Render, etc.)
// y eliminamos la posible sesión antigua de localStorage.
if (!sessionStorage.getItem("session_active")) {
  localStorage.removeItem("user_session");
}
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
