import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CountdownTimer from "../components/CountdownTimer"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"

export default function Home() {
    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')
    const [config, setConfig] = useState<any>({});

    const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

    useEffect(() => {
        const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
        window.addEventListener('app-lang-updated', updateLang);
        return () => window.removeEventListener('app-lang-updated', updateLang);
    }, []);

    // One-time migration: remove stale hardcoded Spanish defaults so t() translations activate
    useEffect(() => {
        const OLD_ES_DEFAULTS: Record<string, string> = {
            about_title: "¿Qué es CONIITI?",
            about_description: "El Congreso Internacional de Innovación y Tendencias en Ingeniería – CONIITI es un evento organizado por la Universidad Católica de Colombia que busca fortalecer el ecosistema de innovación.",
            about_date: "Octubre 2026",
            about_location: "Bogotá, Colombia",
            contact_title: "Contáctanos",
            contact_form_msg: "¿Tienes dudas? Escríbenos y te responderemos a la brevedad."
        };
        Object.entries(OLD_ES_DEFAULTS).forEach(([key, val]) => {
            if (localStorage.getItem(key) === val) localStorage.removeItem(key);
        });
    }, []);

    const refreshConfig = () => {
        const homeTitle = localStorage.getItem("home_hero_title") || "X Congreso Internacional de Innovación y Tendencias en Ingeniería";
        const homeSubtitle = localStorage.getItem("home_hero_subtitle") || "Creatividad + Innovación + Ciencia + Tecnología";
        const homeBtnText = localStorage.getItem("home_btn_text") || "Registrarse Ahora";
        const homeHeroBg = localStorage.getItem("home_hero_bg") || "";

        // About: no hardcoded defaults — t() in JSX handles translation
        const aboutTitle = localStorage.getItem("about_title") || "";
        const aboutDesc = localStorage.getItem("about_description") || "";
        const aboutDate = localStorage.getItem("about_date") || "";
        const aboutLocation = localStorage.getItem("about_location") || "";

        // Contact: no hardcoded defaults — t() in JSX handles translation
        const contactTitle = localStorage.getItem("contact_title") || "";
        const contactEmail = localStorage.getItem("contact_email") || "coniiti@ucatolica.edu.co";
        const contactPhone = localStorage.getItem("contact_phone") || "+57 (601) 327 7300";
        const contactAddress = localStorage.getItem("contact_address") || "Bogotá, Colombia";
        const contactMsg = localStorage.getItem("contact_form_msg") || "";

        setConfig({
            homeTitle, homeSubtitle, homeBtnText, homeHeroBg,
            aboutTitle, aboutDesc, aboutDate, aboutLocation,
            contactTitle, contactEmail, contactPhone, contactAddress, contactMsg
        });
    };

    useEffect(() => {
        refreshConfig();
        window.addEventListener('site-config-updated', refreshConfig);
        return () => window.removeEventListener('site-config-updated', refreshConfig);
    }, []);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section" style={config.homeHeroBg ? { backgroundImage: `url(${config.homeHeroBg})`, backgroundSize: 'cover' } : {}}>
                <div className="hero-content">
                    <h1>{config.homeTitle}</h1>
                    <p className="hero-subtitle">{config.homeSubtitle}</p>
                    <div className="hero-description">
                        {config.homeHeroBg ? "" : t('hero_desc')}
                    </div>
                    <CountdownTimer />
                    <div style={{ marginTop: '2.5rem' }}>
                        <Link to="/registro" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 25px rgba(0, 71, 171, 0.3)' }}>
                            {config.homeBtnText}
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="acerca-de" className="about-section-grid">
                <div className="about-text" data-reveal="left">
                    <h2 className="section-title">{config.aboutTitle || t('about_title')}</h2>
                    <p>{config.aboutDesc || t('about_desc')}</p>
                    <div className="about-details" style={{ margin: '1rem 0', display: 'flex', gap: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        <span>📍 {config.aboutLocation || t('about_location')}</span>
                        <span>📅 {config.aboutDate || t('about_date')}</span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-num">+10</span>
                            <span className="stat-desc">{t('stat_years')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">+30</span>
                            <span className="stat-desc">{t('stat_speakers')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">+500</span>
                            <span className="stat-desc">{t('stat_attendees')}</span>
                        </div>
                    </div>
                </div>
                <div className="about-image" data-reveal="right" data-delay="200">
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" alt="Networking CONIITI" />
                </div>
            </section>

            {/* Áreas Temáticas */}
            <section className="themes-section">
                <h2 className="section-title" data-reveal="up">{t('home_themes_title')}</h2>
                <div className="themes-container">
                    <div className="theme-pill" data-reveal="up" data-delay="100">{t('theme_1')}</div>
                    <div className="theme-pill" data-reveal="up" data-delay="200">{t('theme_2')}</div>
                    <div className="theme-pill" data-reveal="up" data-delay="300">{t('theme_3')}</div>
                    <div className="theme-pill" data-reveal="up" data-delay="400">{t('theme_4')}</div>
                    <div className="theme-pill" data-reveal="up" data-delay="500">{t('theme_5')}</div>
                </div>
            </section>

            {/* Fechas Importantes */}
            <section className="dates-section">
                <h2 className="section-title" data-reveal="up">{t('home_dates_title')}</h2>
                <div className="dates-grid">
                    <div className="date-card" data-reveal="up" data-delay="100">
                        <span className="date-day">15</span>
                        <span className="date-month">Jun</span>
                        <p>{t('date_1_desc')}</p>
                    </div>
                    <div className="date-card" data-reveal="up" data-delay="200">
                        <span className="date-day">30</span>
                        <span className="date-month">Jul</span>
                        <p>{t('date_2_desc')}</p>
                    </div>
                    <div className="date-card" data-reveal="up" data-delay="300">
                        <span className="date-day">01</span>
                        <span className="date-month">Oct</span>
                        <p>{t('date_3_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Valores de participación */}
            <section className="pricing-section" style={{ padding: '5rem 2rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                <h2 className="section-title" data-reveal="up" style={{ textAlign: 'center', marginBottom: '3rem' }}>{t('pricing_title')}</h2>
                
                {/* Tarifas Principales */}
                <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto 4rem auto' }}>
                    <div className="pricing-card" data-reveal="left" data-delay="100" style={{ background: '#0047AB', borderRadius: '32px', padding: '3rem 2rem', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <h3 style={{ color: '#FFD700', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 800 }}>{t('pricing_members')}</h3>
                        <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.2)', width: '60px', margin: '0 auto 2rem auto' }}></div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>
                            <span style={{ color: '#FFD700' }}>$</span> 940.000 <span style={{ fontSize: '1rem', opacity: 0.7 }}>/ COP</span>
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                                {t('pricing_includes')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item1')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item2')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item3')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-card" data-reveal="right" data-delay="200" style={{ background: '#0047AB', borderRadius: '32px', padding: '3rem 2rem', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <h3 style={{ color: '#FFD700', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 800 }}>{t('pricing_non_members')}</h3>
                        <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.2)', width: '60px', margin: '0 auto 2rem auto' }}></div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>
                            <span style={{ color: '#FFD700' }}>$</span> 980.000 <span style={{ fontSize: '1rem', opacity: 0.7 }}>/ COP</span>
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                                {t('pricing_includes')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item1')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item2')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_item3')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarifas Opcionales (Constancias) */}
                <div className="pricing-grid-secondary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="pricing-card" data-reveal="up" data-delay="100" style={{ background: '#0047AB', borderRadius: '32px', padding: '2rem', color: 'white', textAlign: 'center', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '15px', right: '-35px', background: '#FFD700', color: '#0047AB', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 900 }}>OPCIONAL</div>
                        <h3 style={{ color: '#FFD700', fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 800 }}>{t('pricing_optional_conf')}</h3>
                        <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.1)', width: '40px', margin: '0 auto 1.5rem auto' }}></div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>
                            <span style={{ color: '#FFD700' }}>$</span> 120.000 <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/ COP</span>
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.8rem', opacity: 0.9 }}>
                                {t('pricing_includes')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_cert')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-card" data-reveal="up" data-delay="200" style={{ background: '#0047AB', borderRadius: '32px', padding: '2rem', color: 'white', textAlign: 'center', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '15px', right: '-35px', background: '#FFD700', color: '#0047AB', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 900 }}>OPCIONAL</div>
                        <h3 style={{ color: '#FFD700', fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 800 }}>{t('pricing_optional_work')}</h3>
                        <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.1)', width: '40px', margin: '0 auto 1.5rem auto' }}></div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>
                            <span style={{ color: '#FFD700' }}>$</span> 90.000 <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/ COP</span>
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.8rem', opacity: 0.9 }}>
                                {t('pricing_includes')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#FFD700' }}>✔</span> <span>{t('pricing_cert')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Invitación */}
            <section className="cta-home" data-reveal="scale">
                <h2>{t('home_cta_title')}</h2>
                <p>{t('home_cta_desc')}</p>
                <div className="cta-buttons">
                    <Link to="/registro" className="btn btn-primary">{config.homeBtnText}</Link>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="contact-section" data-reveal="up" style={{ padding: '5rem 2rem', background: 'var(--bg-page)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="section-title">{config.contactTitle || t('contact_title')}</h2>
                    <p style={{ marginBottom: '3rem', color: 'var(--text-secondary)' }}>{config.contactMsg || t('contact_msg')}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <div className="contact-info-item" data-reveal="up" data-delay="100">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📧</span>
                            <h4 style={{ margin: '0.5rem 0' }}>{t('contact_email_label')}</h4>
                            <p>{config.contactEmail}</p>
                        </div>
                        <div className="contact-info-item" data-reveal="up" data-delay="200">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📞</span>
                            <h4 style={{ margin: '0.5rem 0' }}>{t('contact_phone_label')}</h4>
                            <p>{config.contactPhone}</p>
                        </div>
                        <div className="contact-info-item" data-reveal="up" data-delay="300">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📍</span>
                            <h4 style={{ margin: '0.5rem 0' }}>{t('contact_location_label')}</h4>
                            <p>{config.contactAddress}</p>
                        </div>
                    </div>

                    <form className="contact-form" data-reveal="up" data-delay="400" style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('contact_name')}</label>
                                <input type="text" placeholder={t('contact_name_ph')} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group">
                                <label>{t('contact_email_label')}</label>
                                <input type="email" placeholder={t('contact_email_ph')} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('contact_msg_label')}</label>
                            <textarea rows={4} placeholder={t('contact_msg_ph')} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
                        </div>
                        <button type="button" className="btn-submit" onClick={() => alert(t('contact_sent'))}>{t('contact_send')}</button>
                    </form>
                </div>
            </section>
        </div>
    )
}
