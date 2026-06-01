import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "../components/CountdownTimer";
import { translations, getTranslation } from "../utils/i18n";
import type { Language } from "../utils/i18n";

export default function Home() {
    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es');
    const [config, setConfig] = useState<any>({});

    const t = (key: keyof typeof translations.es) => getTranslation(key, lang);

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
        const homeTitle = localStorage.getItem("home_hero_title") || "XII CONIITI 2026";
        const homeSubtitle = localStorage.getItem("home_hero_subtitle") || "Décimo Segundo Congreso Internacional de Innovación y Tendencias en Ingeniería";
        const homeBtnText = localStorage.getItem("home_btn_text") || "Registrarse Ahora";
        const homeHeroBg = localStorage.getItem("home_hero_bg") || "";

        const aboutTitle = localStorage.getItem("about_title") || "XII CONIITI 2026";
        const aboutDesc = localStorage.getItem("about_description") || "El Congreso Internacional de Innovación y Tendencias en Ingeniería es un espacio abierto de interacción entre actores del ecosistema innovador orientado a compartir nuevas aproximaciones para la transformación creativa de Colombia a través del diseño de soluciones con visión de ingeniería.";
        const aboutDate = localStorage.getItem("about_date") || "Del 30 de Septiembre al 02 de Octubre 2026";
        const aboutLocation = localStorage.getItem("about_location") || "Bogotá, Carrera 13 # 47 – 30, Centro de Convenciones, Sede 4";

        const contactTitle = localStorage.getItem("contact_title") || "";
        const contactEmail = localStorage.getItem("contact_email") || "coniiti@ucatolica.edu.co";
        const contactPhone = localStorage.getItem("contact_phone") || "(601) 4433700 Ext. 3130/60/90";
        const contactAddress = localStorage.getItem("contact_address") || "Bogotá, Carrera 13 # 47 – 30, Universidad Católica de Colombia, Centro de Convenciones, Sede 4";
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
                    {/* Hero Badges */}
                    <div className="hero-badges" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <span className="hero-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            💻 {lang === 'es' ? 'Modalidad Híbrida' : 'Hybrid Modality'}
                        </span>
                        <span className="hero-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            🇮🇹 {lang === 'es' ? 'País Invitado: Italia' : 'Guest Country: Italy'}
                        </span>
                    </div>

                    <h1 style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)', marginBottom: '1.5rem', fontSize: '3.2rem', lineHeight: '1.2' }}>{config.homeTitle}</h1>
                    <p className="hero-subtitle" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#fff', fontSize: '1.3rem', padding: '0.8rem 2rem', display: 'inline-block', borderRadius: '50px', fontWeight: 600 }}>
                        {config.homeSubtitle}
                    </p>
                    <div className="hero-description" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                        {config.homeHeroBg ? "" : t('hero_desc')}
                    </div>
                    <CountdownTimer />
                    <div style={{ marginTop: '2.5rem' }}>
                        <Link to="/registro" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', fontWeight: 700, borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 71, 171, 0.4)', transition: 'all 0.3s ease' }}>
                            {config.homeBtnText}
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="acerca-de" className="about-section-grid">
                <div className="about-text" data-reveal="left">
                    <h2 className="section-title" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                        {config.aboutTitle || t('about_title')}
                    </h2>
                    <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {config.aboutDesc || t('about_desc')}
                    </p>
                    <div className="about-details" style={{ margin: '1.5rem 0', display: 'flex', flexWrap: 'wrap', gap: '1.5rem 2.5rem', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {config.aboutLocation || t('about_location')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📅 {config.aboutDate || t('about_date')}</span>
                    </div>
                    
                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(0,71,171,0.1)', paddingTop: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 700 }}>
                            {lang === 'es' ? 'Impacto del Congreso Anterior' : 'Previous Congress Impact'}
                        </h4>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            <div className="stat-item">
                                <span className="stat-num" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)', display: 'block' }}>95</span>
                                <span className="stat-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {lang === 'es' ? 'Conferencistas' : 'Speakers'}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-num" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)', display: 'block' }}>30</span>
                                <span className="stat-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Workshops
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-num" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)', display: 'block' }}>999+</span>
                                <span className="stat-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {lang === 'es' ? 'Asistentes' : 'Attendees'}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-num" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)', display: 'block' }}>1</span>
                                <span className="stat-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {lang === 'es' ? 'Patrocinador' : 'Sponsor'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about-image" data-reveal="right" data-delay="200">
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" alt="Networking CONIITI" style={{ borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 71, 171, 0.15)' }} />
                </div>
            </section>

            {/* Why Attend Section */}
            <section className="why-attend-section" style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, rgba(0, 71, 171, 0.02) 0%, rgba(15, 23, 42, 0.04) 100%)', textAlign: 'center', borderTop: '1px solid rgba(0,71,171,0.05)', borderBottom: '1px solid rgba(0,71,171,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="section-title" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem' }}>
                        {lang === 'es' ? 'Por qué asistir a CONIITI' : 'Why Attend CONIITI'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 4rem auto', fontSize: '1.1rem' }}>
                        {lang === 'es' 
                            ? 'Descubre las razones por las cuales este congreso es el espacio ideal para innovar y conectar.' 
                            : 'Discover the reasons why this congress is the ideal space to innovate and connect.'}
                    </p>
                    <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
                        <div className="why-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease', textAlign: 'left' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>🤝</span>
                            <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 700 }}>
                                {lang === 'es' ? 'Networking de alto nivel' : 'High-Level Networking'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {lang === 'es' 
                                    ? 'Conecta con líderes de la industria, investigadores, potenciales empleadores y otros profesionales apasionados por la ingeniería.' 
                                    : 'Connect with industry leaders, researchers, potential employers and other professionals passionate about engineering.'}
                            </p>
                        </div>
                        <div className="why-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease', textAlign: 'left' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>📚</span>
                            <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 700 }}>
                                {lang === 'es' ? 'Conferencias y talleres' : 'Conferences and Workshops'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {lang === 'es' 
                                    ? 'Acceso a ponencias magistrales y talleres interactivos impartidos por expertos de renombre nacional e internacional.' 
                                    : 'Access keynotes and interactive workshops taught by national and internationally renowned experts.'}
                            </p>
                        </div>
                        <div className="why-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease', textAlign: 'left' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>🚀</span>
                            <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 700 }}>
                                {lang === 'es' ? 'Alianzas Estratégicas' : 'Strategic Alliances'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {lang === 'es' 
                                    ? 'Espacios de colaboración diseñados para conectar la academia, la empresa privada y el sector público en proyectos innovadores.' 
                                    : 'Collaboration spaces designed to connect academia, private business, and the public sector on innovative projects.'}
                            </p>
                        </div>
                        <div className="why-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease', textAlign: 'left' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1.5rem' }}>💡</span>
                            <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 700 }}>
                                {lang === 'es' ? 'Desarrollo Profesional' : 'Professional Development'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {lang === 'es' 
                                    ? 'Desarrolla nuevas habilidades y competencias, manteniéndote al día con las últimas tendencias de la ingeniería moderna.' 
                                    : 'Develop new skills and competencies, keeping up to date with the latest trends in modern engineering.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Áreas Temáticas */}
            <section className="themes-section" style={{ background: 'var(--bg-page)' }}>
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
                        <span className="date-day">30</span>
                        <span className="date-month">Jun</span>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {lang === 'es' ? 'Límite de recepción de artículos' : 'Call for papers deadline'}
                        </p>
                    </div>
                    <div className="date-card" data-reveal="up" data-delay="200">
                        <span className="date-day">30</span>
                        <span className="date-month">Sep</span>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {lang === 'es' ? 'Gran Inauguración e Inicio del Evento' : 'Grand Opening and Event Start'}
                        </p>
                    </div>
                    <div className="date-card" data-reveal="up" data-delay="300">
                        <span className="date-day">02</span>
                        <span className="date-month">Oct</span>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {lang === 'es' ? 'Clausura y Fin del Evento' : 'Closing and Event End'}
                        </p>
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
                    <Link to="/registro" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 700 }}>
                        {config.homeBtnText}
                    </Link>
                </div>
            </section>

            {/* Copatrocinio y Respaldo */}
            <section className="sponsors-section" style={{ padding: '5rem 2rem', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0,71,171,0.05)', borderBottom: '1px solid rgba(0,71,171,0.05)', textAlign: 'center' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 700 }}>
                        {lang === 'es' ? 'Copatrocinio y Respaldo Institucional' : 'Co-sponsorship and Institutional Support'}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>ORGANIZA</span>
                            <img 
                                src="https://ucatolica.edu.co/portal/wp-content/uploads/2023/02/logo-universidad-catolica-de-colombia.png" 
                                alt="Universidad Católica de Colombia" 
                                style={{ height: '70px', objectFit: 'contain', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }} 
                                onError={(e) => {
                                    e.currentTarget.src = "https://coniiti.com/wp-content/uploads/2024/08/logo-ucatolica.png";
                                }} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>COPATROCINA</span>
                            <img 
                                src="https://coniiti.com/wp-content/uploads/2024/08/ieeecolombia.png" 
                                alt="IEEE Colombia" 
                                style={{ height: '70px', objectFit: 'contain', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="contact-section" data-reveal="up" style={{ padding: '6rem 2rem', background: 'var(--bg-page)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="section-title" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                        {config.contactTitle || t('contact_title')}
                    </h2>
                    <p style={{ marginBottom: '4rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 4rem auto', fontSize: '1.1rem' }}>
                        {config.contactMsg || t('contact_msg')}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                        <div className="contact-info-item" data-reveal="up" data-delay="100" style={{ background: 'var(--bg-card)', padding: '2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,71,171,0.05)', boxShadow: 'var(--card-shadow)' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📧</span>
                            <h4 style={{ margin: '0.5rem 0', color: 'var(--primary-color)', fontWeight: 700 }}>{t('contact_email_label')}</h4>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{config.contactEmail}</p>
                        </div>
                        <div className="contact-info-item" data-reveal="up" data-delay="200" style={{ background: 'var(--bg-card)', padding: '2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,71,171,0.05)', boxShadow: 'var(--card-shadow)' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📞</span>
                            <h4 style={{ margin: '0.5rem 0', color: 'var(--primary-color)', fontWeight: 700 }}>{t('contact_phone_label')}</h4>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{config.contactPhone}</p>
                        </div>
                        <div className="contact-info-item" data-reveal="up" data-delay="300" style={{ background: 'var(--bg-card)', padding: '2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,71,171,0.05)', boxShadow: 'var(--card-shadow)' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📍</span>
                            <h4 style={{ margin: '0.5rem 0', color: 'var(--primary-color)', fontWeight: 700 }}>{t('contact_location_label')}</h4>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{config.contactAddress}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginTop: '3rem' }}>
                        {/* Formulario */}
                        <form className="contact-form" data-reveal="up" data-delay="400" style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', textAlign: 'left', border: '1px solid rgba(0,71,171,0.05)' }}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('contact_name')}</label>
                                    <input type="text" placeholder={t('contact_name_ph')} style={{ width: '100%', padding: '14px', border: '1px solid rgba(0,71,171,0.15)', borderRadius: '12px', outline: 'none', background: '#F8FAFC', fontSize: '0.95rem', transition: 'all 0.3s' }} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('contact_email_label')}</label>
                                    <input type="email" placeholder={t('contact_email_ph')} style={{ width: '100%', padding: '14px', border: '1px solid rgba(0,71,171,0.15)', borderRadius: '12px', outline: 'none', background: '#F8FAFC', fontSize: '0.95rem', transition: 'all 0.3s' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('contact_msg_label')}</label>
                                <textarea rows={4} placeholder={t('contact_msg_ph')} style={{ width: '100%', padding: '14px', border: '1px solid rgba(0,71,171,0.15)', borderRadius: '12px', outline: 'none', background: '#F8FAFC', fontSize: '0.95rem', transition: 'all 0.3s', resize: 'vertical' }}></textarea>
                            </div>
                            <button type="button" className="btn-submit" onClick={() => alert(t('contact_sent'))} style={{ width: '100%', padding: '1rem', background: 'var(--btn-gradient)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,71,171,0.2)', transition: 'all 0.3s ease' }}>{t('contact_send')}</button>
                        </form>

                        {/* Mapa y Redes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <iframe 
                                src="https://maps.google.com/maps?q=Universidad%20Cat%C3%B3lica%20de%20Colombia%20sede%204&t=m&z=15&output=embed&iwloc=near"
                                width="100%" 
                                height="280px" 
                                style={{ border: 0, borderRadius: '24px', boxShadow: 'var(--card-shadow)' }} 
                                allowFullScreen={true} 
                                loading="lazy"
                                title="Ubicación CONIITI"
                            ></iframe>
                            
                            <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                                    {lang === 'es' ? 'Síguenos en nuestras Redes Sociales' : 'Follow us on Social Media'}
                                </h4>
                                <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center' }}>
                                    <a href="https://www.facebook.com/ucatolicaco" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(24,119,242,0.1)', color: '#1877F2', transition: 'all 0.3s ease' }} className="social-icon-btn">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
                                    </a>
                                    <a href="https://twitter.com/UCatolicaCo" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(29,161,242,0.1)', color: '#1DA1F2', transition: 'all 0.3s ease' }} className="social-icon-btn">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                    <a href="https://www.instagram.com/ucatolicaco" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(220,39,67,0.1)', color: '#E1306C', transition: 'all 0.3s ease' }} className="social-icon-btn">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </a>
                                    <a href="https://www.youtube.com/user/ucatolicaco" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,0,0,0.1)', color: '#FF0000', transition: 'all 0.3s ease' }} className="social-icon-btn">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
