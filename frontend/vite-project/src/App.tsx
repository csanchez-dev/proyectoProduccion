import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { trackEvent } from "./utils/tracker";
import Layout from "./components/Layout";
import Agenda from "./pages/Agenda";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Invitados from "./pages/Invitados";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ResetPassword from "./pages/ResetPassword";

import { Toaster } from 'sonner';

export default function App() {
  const location = useLocation();
  const [bgImage, setBgImage] = useState<string | null>(localStorage.getItem("custom_global_image"));
  const [bgVideo, setBgVideo] = useState<string | null>(localStorage.getItem("custom_global_video"));
  const [parallax, setParallax] = useState<boolean>(localStorage.getItem("custom_parallax") !== "false");

  useEffect(() => {
    // 0. Sincronización de colores interactivos (Theme)
    const applyColors = () => {
      // Background interactions
      setBgImage(localStorage.getItem("custom_global_image"));
      setBgVideo(localStorage.getItem("custom_global_video"));
      setParallax(localStorage.getItem("custom_parallax") !== "false");

      const p = localStorage.getItem("custom_primary_color");
      const s = localStorage.getItem("custom_secondary_color");
      const bg = localStorage.getItem("custom_bg_color");
      const txt = localStorage.getItem("custom_text_color");
      const hBg = localStorage.getItem("custom_header_bg");
      const aC = localStorage.getItem("custom_accent_color");
      const gl = localStorage.getItem("custom_glass_bg");

      const root = document.documentElement;
      if (p) root.style.setProperty('--primary-color', p); else root.style.removeProperty('--primary-color');
      if (s) root.style.setProperty('--secondary-color', s); else root.style.removeProperty('--secondary-color');
      if (bg) root.style.setProperty('--bg-page', bg); else root.style.removeProperty('--bg-page');
      if (txt) root.style.setProperty('--text-primary', txt); else root.style.removeProperty('--text-primary');
      if (aC) root.style.setProperty('--accent-color', aC); else root.style.removeProperty('--accent-color');
      
      // Manejar header global (en global.css está fijo, usamos una variable CSS si existe)
      if (hBg) root.style.setProperty('--header-bg-custom', hBg); else root.style.removeProperty('--header-bg-custom');
      
      // Efectos cristalinos opcionales
      if (gl) root.style.setProperty('--glass-bg', gl); else root.style.removeProperty('--glass-bg');
    };

    applyColors();
    window.addEventListener("storage", applyColors);
    window.addEventListener("site-config-updated", applyColors);

    // 1. Monitoreo de Tiempos de Carga de Página
    const navStart = performance.now();
    trackEvent('PAGE_VIEW', location.pathname);

    const timer = setTimeout(() => {
      const loadTime = Math.round(performance.now() - navStart);
      trackEvent('PAGE_LOAD_TIME', location.pathname, 'Carga de ruta', loadTime);
    }, 100);

    // 2. Monitoreo de Recursos (Imágenes y Assets) - PerformanceObserver
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // Solo trackear si es una carga significativa (> 50ms o > 10KB)
        if (entry.entryType === 'resource') {
          const isImg = ['img', 'image'].includes(entry.initiatorType) ||
            /\.(jpg|jpeg|png|webp|gif|svg)/.test(entry.name);

          if (isImg) {
            trackEvent('IMAGE_LOAD', location.pathname, entry.name, Math.round(entry.duration), entry.transferSize);
          }
          trackEvent('RESOURCE_LOAD', location.pathname, entry.name, Math.round(entry.duration), entry.transferSize);
        }
      });
    });

    observer.observe({ type: 'resource', buffered: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("storage", applyColors);
      window.removeEventListener("site-config-updated", applyColors);
    };
  }, [location.pathname]); // Solo cuando cambia la ruta para no saturar

  return (
    <>
      <Toaster position="top-center" richColors />

      {/* ── Fondo Global Interactivo / Parallax ── */}
      {(bgImage || bgVideo) && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none', /* Evita que bloquee clics del usuario */
        }}>
          {bgVideo ? (
            <video 
              src={bgVideo} 
              autoPlay loop muted playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} 
            />
          ) : (
            bgImage && (
              <div style={{
                width: '100%', height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: parallax ? 'fixed' : 'scroll',
                opacity: 0.15
              }} />
            )
          )}
        </div>
      )}

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conferencias" element={<Agenda />} />
          <Route path="/invitados" element={<Invitados />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/actualizar-password" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </>
  );
}
