import { useState, useEffect } from "react"
import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  const MAX_CAPACITY = 150;

  // Estados
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estado para los asientos disponibles (leído desde localStorage o inicializado en 150)
  const [availableSeats, setAvailableSeats] = useState(() => {
    const savedStats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
    const confStat = savedStats.find((s: any) => s.name === conference.title);
    // Asientos disponibles = Capacidad Máxima - Inscritos actuales
    return confStat ? MAX_CAPACITY - confStat.value : MAX_CAPACITY;
  });

  const isFull = availableSeats <= 0;

  const handleRegister = () => {
    if (isRegistered || isFull) return;

    setIsLoading(true);

    // Simulación de proceso de inscripción (1.5 segundos)
    setTimeout(() => {
      setIsLoading(false);
      setIsRegistered(true);
      setAvailableSeats(prev => prev - 1); // Reducir stock localmente

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
      </div>

      <div className="card-body">
        <h3>{conference.title}</h3>

        {/* Visualización de Stock/Capacidad */}
        <div className={`stock-info ${isFull ? 'no-stock' : 'low-stock'}`}>
          <span className="stock-label">Disponibilidad:</span>
          <span className="stock-count">
             {isFull ? "Agotado" : `${availableSeats} asientos de ${MAX_CAPACITY}`}
          </span>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${(availableSeats / MAX_CAPACITY) * 100}%` }}
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
            <span className="icon">👤</span>
            <span>{conference.speaker.name}</span>
          </div>
        </div>

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
