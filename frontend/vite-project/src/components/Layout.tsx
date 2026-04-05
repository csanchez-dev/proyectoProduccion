import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { trackEvent } from "../utils/tracker";
import { translations, getTranslation } from "../utils/i18n";
import type { Language } from "../utils/i18n";
import { useScrollReveal } from "../hooks/useScrollReveal";

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  useScrollReveal();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);

  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es');

  const location = useLocation();
  const [logoEvento, setLogoEvento] = useState("/logo-coniiti.png");

  const t = (key: keyof typeof translations.es) => getTranslation(key, lang);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const onClickOutside = (e: MouseEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
    window.dispatchEvent(new Event('app-lang-updated'));
  };

  useEffect(() => {
    trackEvent('PAGE_VIEW', location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        const text = target.innerText || target.getAttribute('alt') || 'Sin texto';
        trackEvent('CLICK', location.pathname, `Clic en: ${text.slice(0, 30)}`);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [location]);

  const refreshSession = () => {
    const session = localStorage.getItem("user_session");
    setUser(session ? JSON.parse(session) : null);
  };

  useEffect(() => {
    refreshSession();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    sessionStorage.removeItem("session_active");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      {/* HEADER FIJO */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 2000
        }}
      >

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

        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
          type="button"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
        )}

        <nav
          id="mobile-nav"
          ref={menuRef}
          className={`navbar ${menuOpen ? "open" : ""}`}
        >
          <ul className="navbar-links">

            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                {t("nav_home")}
              </Link>
            </li>

            <li>
              <Link to="/invitados" onClick={() => setMenuOpen(false)}>
                {t("nav_guests")}
              </Link>
            </li>

            <li>
              <Link to="/conferencias" onClick={() => setMenuOpen(false)}>
                {t("nav_agenda")}
              </Link>
            </li>

            <li>
              <a href="/#acerca-de" onClick={() => setMenuOpen(false)}>
                {t("nav_about")}
              </a>
            </li>

            <li>
              <a href="/#contacto" onClick={() => setMenuOpen(false)}>
                {t("nav_contact")}
              </a>
            </li>
            <li>
              <Link to="/galeria" onClick={() => setMenuOpen(false)}>
                {t("nav_gallery")}
              </Link>
            </li>
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

            {/* Selector de Idioma Customizado */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 71, 171, 0.2)',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: '800',
                  color: '#0b3b8f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{lang.toUpperCase()}</span>
                <span style={{ fontSize: '0.6rem' }}>▼</span>
              </button>

              {langMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  padding: '8px',
                  zIndex: 1000,
                  minWidth: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  {[
                    { val: 'es', label: '🇪🇸 Español' },
                    { val: 'en', label: '🇺🇸 English' },
                    { val: 'pt', label: '🇧🇷 Português' },
                    { val: 'fr', label: '🇫🇷 Français' },
                    { val: 'de', label: '🇩🇪 Deutsch' },
                    { val: 'it', label: '🇮🇹 Italiano' },
                    { val: 'zh', label: '🇨🇳 中文 (Mandarin)' },
                    { val: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
                    { val: 'ar', label: '🇸🇦 العربية (Arabic)' },
                    { val: 'ja', label: '🇯🇵 日本語 (Japanese)' }
                  ].map((l) => (
                    <button
                      key={l.val}
                      onClick={() => {
                        handleLangChange(l.val as Language);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        background: lang === l.val ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: lang === l.val ? '#2563eb' : '#475569',
                        fontWeight: lang === l.val ? '700' : '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = lang === l.val ? 'rgba(37, 99, 235, 0.1)' : 'transparent')}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (

              <>
                <Link to="/perfil">{t("nav_profile")}</Link>

                <button onClick={handleLogout}>
                  {t("nav_logout")}
                </button>
              </>

            ) : (

              <>
                <Link to="/login">{t("nav_login")}</Link>
                <Link to="/registro">{t("nav_register")}</Link>
              </>

            )}

          </div>

        </nav>
      </header>

      {/* CONTENIDO */}
      <main
        className="main-container"
        style={{
          paddingTop: "100px"
        }}
      >
        {children}
      </main>

      <footer>
        {t("footer_copy")}
      </footer>

    </>
  );
}