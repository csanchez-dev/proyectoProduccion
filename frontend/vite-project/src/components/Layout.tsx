import { useState, useEffect, type ReactNode } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { trackEvent } from "../utils/tracker"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [user, setUser] = useState<any>(null)
  const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')
  const navigate = useNavigate()
  const location = useLocation()

  const [bannerUrl, setBannerUrl] = useState("/banner-header.png")
  const [logoEvento, setLogoEvento] = useState("/logo-coniiti.png")

  // Función para traducir rápido en el componente
  const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

  // Cambiar idioma
  const handleLangChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("app_lang", newLang)
    window.dispatchEvent(new Event('app-lang-updated'))
  }

  // Tracking de ruta
  useEffect(() => {
    trackEvent('PAGE_VIEW', location.pathname)
  }, [location])

  // Tracking de clics globales
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        const text = target.innerText || target.getAttribute('alt') || 'Sin texto'
        trackEvent('CLICK', location.pathname, `Clic en: ${text.slice(0, 30)}`)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [location])

  // Función para recargar la configuración sin refrescar la página
  const refreshConfig = () => {
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
    else setBannerUrl("/banner-header.png")

    // Cargar logos persistentes

    const savedLogoEvento = localStorage.getItem("site_logo_evento")
    if (savedLogoEvento) setLogoEvento(savedLogoEvento)
    else setLogoEvento("/logo-coniiti.png")

    // Aplicar colores personalizados si existen
    const customBg = localStorage.getItem("custom_bg_color")
    if (customBg) document.documentElement.style.setProperty('--site-bg', customBg)

    const customText = localStorage.getItem("custom_text_color")
    if (customText) document.documentElement.style.setProperty('--site-text', customText)

    const customPrimary = localStorage.getItem("custom_primary_color")
    if (customPrimary) document.documentElement.style.setProperty('--primary-color', customPrimary)

    const customHeader = localStorage.getItem("custom_header_bg")
    if (customHeader) document.documentElement.style.setProperty('--header-bg', customHeader)
  }

  // Simulación de verificación de sesión (se activa al recargar o navegar)
  useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (session) {
      setUser(JSON.parse(session))
    }

    refreshConfig()

    // Escuchar cambios en vivo desde otros componentes
    window.addEventListener('site-config-updated', refreshConfig)
    return () => window.removeEventListener('site-config-updated', refreshConfig)
  }, [])

  const handleLogout = () => {
    const confirmMsg = lang === 'es' ? "¿Estás seguro de que deseas cerrar sesión?" : "Are you sure you want to logout?"
    if (confirm(confirmMsg)) {
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
            <li><Link to="/">{t('nav_home')}</Link></li>
            <li><Link to="/invitados">{t('nav_guests')}</Link></li>
            <li><Link to="/conferencias">{t('nav_agenda')}</Link></li>
            <li><a href="/#acerca-de">{t('nav_about')}</a></li>
            <li><Link to="#contacto">{t('nav_contact')}</Link></li>
          </ul>

          <div className="user-auth-zone" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="lang-dropdown-wrapper">
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as Language)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                <option value="es" style={{ color: '#333' }}>🌐 Idioma: Español</option>
                <option value="en" style={{ color: '#333' }}>🌐 Language: English</option>
              </select>
            </div>

            {user ? (
              <div className="user-profile-menu">
                {(user.role === "SUPER_ADMIN" || user.role === "CONTENT_MANAGER") && (
                  <Link to="/admin" className="btn-management">{t('nav_config')}</Link>
                )}
                <Link to="/perfil" className="btn-profile">{t('nav_profile')}</Link>
                <button onClick={handleLogout} className="btn-logout">{t('nav_logout')}</button>
              </div>
            ) : (
              <Link to="/registro" className="btn-login-header">{t('nav_login')}</Link>
            )}
          </div>
        </nav>
      </header>

      <main className="main-container">
        {children}
      </main>

      <footer>{t('footer_copy')}</footer>
    </>
  )
}
