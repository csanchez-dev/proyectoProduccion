import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { trackEvent } from "./utils/tracker"
import Layout from "./components/Layout"
import Agenda from "./pages/Agenda"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Admin from "./pages/Admin"
import Invitados from "./pages/Invitados"
import Home from "./pages/Home"
import ResetPassword from "./pages/ResetPassword"

export default function App() {
  const location = useLocation();

  useEffect(() => {
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
    };
  }, [location.pathname]); // Solo cuando cambia la ruta para no saturar

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conferencias" element={<Agenda />} />
        <Route path="/invitados" element={<Invitados />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/actualizar-password" element={<ResetPassword />} />
      </Routes>
    </Layout>
  )
}
