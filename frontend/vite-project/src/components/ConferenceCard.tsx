import { useState, useEffect } from "react"
import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  // Obtener capacidad dinámica según la ubicación
  const [maxCapacity, setMaxCapacity] = useState(() => {
    if (conference.type === 'virtual') return 500; // Capacidad generosa para virtual
    const capacities = JSON.parse(localStorage.getItem('site_location_capacities') || '{}');
    return capacities[conference.location] || 150;
  });

  // Estados
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estado para los asientos disponibles
  const [availableSeats, setAvailableSeats] = useState(() => {
    const savedStats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
    const confStat = savedStats.find((s: any) => s.name === conference.title);
    return confStat ? maxCapacity - confStat.value : maxCapacity;
  });

  const isFull = availableSeats <= 0;

  // Actualizar capacidad si cambia en localStorage (Panel Admin)
  useEffect(() => {
    const refreshCapacity = () => {
      const capacities = JSON.parse(localStorage.getItem('site_location_capacities') || '{}');
      const newMax = conference.type === 'virtual' ? 500 : (capacities[conference.location] || 150);
      setMaxCapacity(newMax);

      const savedStats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
      const confStat = savedStats.find((s: any) => s.name === conference.title);
      setAvailableSeats(confStat ? newMax - confStat.value : newMax);
    };

    window.addEventListener('site-config-updated', refreshCapacity);
    // También escuchamos cambios en storage directamente por si acaso
    window.addEventListener('storage', refreshCapacity);

    return () => {
      window.removeEventListener('site-config-updated', refreshCapacity);
      window.removeEventListener('storage', refreshCapacity);
    };
  }, [conference.location, conference.title, conference.type]);

  const handleRegister = () => {
    if (isRegistered || isFull) return;

    setIsLoading(true);

    // Simulación de proceso de inscripción
    setTimeout(() => {
      setIsLoading(false);
      setIsRegistered(true);
      setAvailableSeats((prev: number) => prev - 1);

      // Actualizar estadísticas en localStorage
      const stats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
      const confIndex = stats.findIndex((s: any) => s.name === conference.title);

      if (confIndex >= 0) {
        stats[confIndex].value += 1;
      } else {
        stats.push({ name: conference.title, value: 1 });
      }
      localStorage.setItem('conf_stats', JSON.stringify(stats));

      // Registrar evento en el tracker
      import('../utils/tracker').then(t =>
        t.trackEvent('CLICK', window.location.pathname, `Inscripción: ${conference.title}`)
      );
    }, 1500);
  }

  return (
    <div className={`card ${isRegistered ? 'registered' : ''} ${isFull ? 'full' : ''}`}>
      <div className="card-image-wrapper">
        <img src="/conference-card.jpg" alt={conference.title} className="card-img" />
        <div className="category-badge">{conference.category || 'General'}</div>
        <div className={`modality-badge ${conference.type || 'presencial'}`}>
          {conference.type === 'virtual' ? '🌐 Virtual' : '📍 Presencial'}
        </div>
      </div>

      <div className="card-body">
        <h3>{conference.title}</h3>

        {/* Visualización de Stock/Capacidad */}
        <div className={`stock-info ${isFull ? 'no-stock' : 'low-stock'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span className="stock-label">Disponibilidad:</span>
            <span className="stock-count">
              {isFull ? "Agotado" : `${availableSeats} de ${maxCapacity}`}
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(0, (availableSeats / maxCapacity) * 100)}%`, background: isFull ? '#e74c3c' : 'var(--primary-color)' }}
            ></div>
          </div>
        </div>

        <p className="description">{conference.description}</p>

        <div className="info">
          <div className="info-row">
            <span className="icon">🕒</span>
            <span>{new Date(conference.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="info-row">
            <span className="icon">📍</span>
            <span style={{ fontWeight: 600 }}>{conference.type === 'virtual' ? 'Plataforma Virtual' : conference.location}</span>
          </div>
          <div className="info-row">
            <span className="icon">👤</span>
            <span>{conference.speaker.name}</span>
          </div>
        </div>

        {/* Mostrar enlace si es virtual y está inscrito */}
        {isRegistered && conference.type === 'virtual' && conference.virtualLink && (
          <div className="virtual-link-box fade-in" style={{
            margin: '1rem 0',
            padding: '1rem',
            background: '#f0f7ff',
            borderRadius: '8px',
            border: '1px solid #cce3ff',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#0052cc', marginBottom: '0.5rem', fontWeight: 'bold' }}>¡Estás inscrito! Accede aquí:</p>
            <a
              href={conference.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'white',
                background: '#0052cc',
                padding: '8px 15px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'inline-block'
              }}
            >
              Unirse a la Sesión 🚀
            </a>
          </div>
        )}

        <button
          className={`btn ${isRegistered ? 'btn-registered' : ''} ${isFull && !isRegistered ? 'btn-full' : ''}`}
          onClick={handleRegister}
          disabled={isLoading || isRegistered || isFull}
          style={{ width: '100%', marginTop: 'auto' }}
        >
          {isLoading ? "Procesando..." :
            isRegistered ? "✓ Inscrito" :
              isFull ? "Cupos Agotados" : "Inscribirse ahora"}
        </button>
      </div>
    </div>
  )
}
