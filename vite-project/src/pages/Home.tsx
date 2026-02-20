import CountdownTimer from "../components/CountdownTimer"

export default function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>X Congreso Internacional de Innovación y Tendencias en Ingeniería</h1>
                    <p className="hero-subtitle">Creatividad + Innovación + Ciencia + Tecnología</p>
                    <div className="hero-description">
                        Un espacio dinámico para el intercambio de conocimientos entre la academia, el sector productivo y el Estado.
                    </div>
                    <CountdownTimer />
                </div>
            </section>

            {/* Acerca del Congreso - Estilo CONIITI */}
            <section id="acerca-de" className="about-section-grid">
                <div className="about-text">
                    <h2 className="section-title">¿Qué es CONIITI?</h2>
                    <p>
                        El Congreso Internacional de Innovación y Tendencias en Ingeniería – CONIITI es un evento organizado por la
                        <strong> Universidad Católica de Colombia </strong> que busca fortalecer el ecosistema de innovación.
                    </p>
                    <p>
                        Nuestra misión es propiciar un escenario de encuentro para que investigadores, profesionales y estudiantes
                        compartan avances tecnológicos y científicos que respondan a los retos de la sociedad actual.
                    </p>
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
                    <a href="/registro" className="btn btn-primary">Registrarse Ahora</a>
                </div>
            </section>
        </div>
    )
}
