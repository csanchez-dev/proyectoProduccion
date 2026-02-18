import { useState, useEffect, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  const [bannerUrl, setBannerUrl] = useState("/banner-header.png")
  const [logoUni, setLogoUni] = useState("/ucatolica-logo.png")
  const [logoEvento, setLogoEvento] = useState("/logo-coniiti.png")

  // Simulación de verificación de sesión (se activa al recargar o navegar)
  useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (session) {
      setUser(JSON.parse(session))
    }

    // Aplicar tema persistente
    const theme = localStorage.getItem("site_theme")
    if (theme && theme !== "default") {
      document.body.className = `theme-${theme}`
    } else {
      document.body.className = ""
    }

    // Cargar banner persistente
    const savedBanner = localStorage.getItem("site_banner")
    if (savedBanner) setBannerUrl(savedBanner)

    // Cargar logos persistentes
    const savedLogoUni = localStorage.getItem("site_logo_uni")
    if (savedLogoUni) setLogoUni(savedLogoUni)

    const savedLogoEvento = localStorage.getItem("site_logo_evento")
    if (savedLogoEvento) setLogoEvento(savedLogoEvento)

    // Aplicar colores personalizados si existen
    const customBg = localStorage.getItem("custom_bg_color")
    if (customBg) document.documentElement.style.setProperty('--site-bg', customBg)

    const customText = localStorage.getItem("custom_text_color")
    if (customText) document.documentElement.style.setProperty('--site-text', customText)

    const customPrimary = localStorage.getItem("custom_primary_color")
    if (customPrimary) document.documentElement.style.setProperty('--primary-color', customPrimary)

    const customHeader = localStorage.getItem("custom_header_bg")
    if (customHeader) document.documentElement.style.setProperty('--header-bg', customHeader)
  }, [])

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("user_session")
      setUser(null)
      navigate("/")
    }
  }

  return (
    <>
      <header>
        {bannerUrl && (
          <img
            className="header-banner"
            src={bannerUrl}
            alt="Banner Cabecera"
            onError={() => {
              localStorage.removeItem("site_banner");
              setBannerUrl("/banner-header.png");
            }}
          />
        )}

        <div className="logo-container">
          <img
            src={logoUni}
            alt="Logo Universidad Catolica"
            className="logo-uni"
            onError={() => {
              localStorage.removeItem("site_logo_uni");
              setLogoUni("/ucatolica-logo.png");
            }}
          />
          <img
            src={logoEvento}
            alt="Logo Coniiti"
            className="logo-event"
            onError={() => {
              localStorage.removeItem("site_logo_evento");
              setLogoEvento("/logo-coniiti.png");
            }}
          />
        </div>

        <nav className="navbar">
          <ul className="navbar-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/invitados">Invitados</Link></li>
            <li><Link to="/conferencias">Agenda</Link></li>
            <li><a href="/#acerca-de">Acerca de</a></li>
            <li><Link to="#contacto">Contacto</Link></li>
          </ul>

          <div className="user-auth-zone">
            {user ? (
              <div className="user-profile-menu">
                {(user.role === "SUPER_ADMIN" || user.role === "CONTENT_MANAGER") && (
                  <Link to="/admin" className="btn-management">Gestión de Evento</Link>
                )}
                <Link to="/perfil" className="btn-profile">Mi Perfil</Link>
                <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
              </div>
            ) : (
              <Link to="/registro" className="btn-login-header">Inicia Sesión / Regístrate</Link>
            )}
          </div>
        </nav>
      </header>

      <main className="main-container">
        {children}
      </main>

      <footer>© CONIITI 2026</footer>
    </>
  )
}
