import { useState, useEffect, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { trackEvent } from "../utils/tracker"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [user, setUser] = useState<any>(null)
  const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')
  const location = useLocation()

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
    if (customPrimary) {
      document.documentElement.style.setProperty('--primary-color', customPrimary)
    } else {
      document.documentElement.style.setProperty('--primary-color', "#2563EB")
    }

    const customSecondary = localStorage.getItem("custom_secondary_color")
    if (customSecondary) {
      document.documentElement.style.setProperty('--secondary-color', customSecondary)
    } else {
      document.documentElement.style.setProperty('--secondary-color', "#1E293B")
    }

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
    // Limpieza total del almacenamiento y estado
    localStorage.removeItem("user_session")
    setUser(null)

    // Redirección con recarga completa para asegurar limpieza de memoria
    window.location.href = "/"
  }

  return (
    <>
      <header>
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
                className="lang-select"
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
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" className="btn-login-header">{t('nav_login')}</Link>
                <Link to="/registro" className="btn-register-header" style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  background: 'var(--primary-color)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}>{t('nav_register')}</Link>
              </div>
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
