import { useState, useEffect } from "react"
import CountdownTimer from "../components/CountdownTimer"

export default function Home() {
    const [config, setConfig] = useState<any>({});

    const refreshConfig = () => {
        const homeTitle = localStorage.getItem("home_hero_title") || "X Congreso Internacional de Innovación y Tendencias en Ingeniería";
        const homeSubtitle = localStorage.getItem("home_hero_subtitle") || "Creatividad + Innovación + Ciencia + Tecnología";
        const homeBtnText = localStorage.getItem("home_btn_text") || "Registrarse Ahora";
        const homeHeroBg = localStorage.getItem("home_hero_bg") || "";

        const aboutTitle = localStorage.getItem("about_title") || "¿Qué es CONIITI?";
        const aboutDesc = localStorage.getItem("about_description") || "El Congreso Internacional de Innovación y Tendencias en Ingeniería – CONIITI es un evento organizado por la Universidad Católica de Colombia que busca fortalecer el ecosistema de innovación.";
        const aboutDate = localStorage.getItem("about_date") || "Octubre 2026";
        const aboutLocation = localStorage.getItem("about_location") || "Bogotá, Colombia";

        const contactTitle = localStorage.getItem("contact_title") || "Contáctanos";
        const contactEmail = localStorage.getItem("contact_email") || "coniiti@ucatolica.edu.co";
        const contactPhone = localStorage.getItem("contact_phone") || "+57 (601) 327 7300";
        const contactAddress = localStorage.getItem("contact_address") || "Bogotá, Colombia";
        const contactMsg = localStorage.getItem("contact_form_msg") || "¿Tienes dudas? Escríbenos y te responderemos a la brevedad.";

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
                        {config.homeHeroBg ? "" : "Un espacio dinámico para el intercambio de conocimientos entre la academia, el sector productivo y el Estado."}
                    </div>
                    <CountdownTimer />
                </div>
            </section>

            {/* Acerca del Congreso - Estilo CONIITI */}
            <section id="acerca-de" className="about-section-grid">
                <div className="about-text">
                    <h2 className="section-title">{config.aboutTitle}</h2>
                    <p>{config.aboutDesc}</p>
                    <div className="about-details" style={{ margin: '1rem 0', display: 'flex', gap: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        <span>📍 {config.aboutLocation}</span>
                        <span>📅 {config.aboutDate}</span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-num">+10</span>
                            <span className="stat-desc">Años de Trayectoria</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">+30</span>
                            <span className="stat-desc">Ponentes Internacionales</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">+500</span>
                            <span className="stat-desc">Asistentes Esperados</span>
                        </div>
                    </div>
                </div>
                <div className="about-image">
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" alt="Networking CONIITI" />
                </div>
            </section>

            {/* Áreas Temáticas */}
            <section className="themes-section">
                <h2 className="section-title">Ejes Temáticos</h2>
                <div className="themes-container">
                    <div className="theme-pill">Creatividad e Innovación</div>
                    <div className="theme-pill">Ciencia y Tecnología</div>
                    <div className="theme-pill">Ingeniería para la Sostenibilidad</div>
                    <div className="theme-pill">Transformación Digital</div>
                    <div className="theme-pill">Educación en Ingeniería</div>
                </div>
            </section>

            {/* Fechas Importantes */}
            <section className="dates-section">
                <h2 className="section-title">Fechas Importantes</h2>
                <div className="dates-grid">
                    <div className="date-card">
                        <span className="date-day">15</span>
                        <span className="date-month">Jun</span>
                        <p>Cierre de recepción de artículos</p>
                    </div>
                    <div className="date-card">
                        <span className="date-day">30</span>
                        <span className="date-month">Jul</span>
                        <p>Notificación de aceptación</p>
                    </div>
                    <div className="date-card">
                        <span className="date-day">01</span>
                        <span className="date-month">Oct</span>
                        <p>Gran Inauguración CONIITI 2026</p>
                    </div>
                </div>
            </section>

            {/* Invitación */}
            <section className="cta-home">
                <h2>¡Forma parte del cambio!</h2>
                <p>Únete a la décima edición del evento de ingeniería más importante de la región.</p>
                <div className="cta-buttons">
                    <a href="/registro" className="btn btn-primary">{config.homeBtnText}</a>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="contact-section fade-in" style={{ padding: '5rem 2rem', background: 'var(--bg-page)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="section-title">{config.contactTitle}</h2>
                    <p style={{ marginBottom: '3rem', color: 'var(--text-secondary)' }}>{config.contactMsg}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <div className="contact-info-item">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📧</span>
                            <h4 style={{ margin: '0.5rem 0' }}>Email</h4>
                            <p>{config.contactEmail}</p>
                        </div>
                        <div className="contact-info-item">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📞</span>
                            <h4 style={{ margin: '0.5rem 0' }}>Teléfono</h4>
                            <p>{config.contactPhone}</p>
                        </div>
                        <div className="contact-info-item">
                            <span style={{ fontSize: '2rem', display: 'block' }}>📍</span>
                            <h4 style={{ margin: '0.5rem 0' }}>Ubicación</h4>
                            <p>{config.contactAddress}</p>
                        </div>
                    </div>

                    <form className="contact-form" style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" placeholder="Tu nombre" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group">
                                <label>Correo</label>
                                <input type="email" placeholder="tu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mensaje</label>
                            <textarea rows={4} placeholder="¿Cómo podemos ayudarte?" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
                        </div>
                        <button type="button" className="btn-submit" onClick={() => alert("Mensaje enviado (simulación)")}>Enviar Mensaje</button>
                    </form>
                </div>
            </section>
        </div>
    )
}
