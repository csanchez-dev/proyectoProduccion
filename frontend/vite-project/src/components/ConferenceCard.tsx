import { useState } from "react"
import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = () => {
    if (isRegistered) return

    setIsLoading(true)

    // Simulación de proceso de inscripción (1.5 segundos)
    setTimeout(() => {
      setIsLoading(false)
      setIsRegistered(true)

      // Actualizar estadísticas para el panel admin
      const stats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
      const confIndex = stats.findIndex((s: any) => s.name === conference.title);
      if (confIndex >= 0) {
        stats[confIndex].value += 1;
      } else {
        stats.push({ name: conference.title, value: 1 });
      }
      localStorage.setItem('conf_stats', JSON.stringify(stats));

      // Registrar evento
      const tracker = import('../utils/tracker');
      tracker.then(t => t.trackEvent('CLICK', window.location.pathname, `Inscripción: ${conference.title}`));
    }, 1500)
  }

  return (
    <div className={`card ${isRegistered ? 'registered' : ''}`}>
      <div className="card-image-wrapper">
        <img src="/conference-card.jpg" alt={conference.title} className="card-img" />
        <div className="category-badge">{conference.category || 'General'}</div>
      </div>

      <div className="card-body">
        <h3>{conference.title}</h3>
        <p className="description">{conference.description}</p>

        <div className="info">
          <div className="info-row">
            <span className="icon">🕒</span>
            <span>{new Date(conference.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(conference.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="info-row">
            <span className="icon">📍</span>
            <span>{conference.location}</span>
          </div>
          <div className="info-row">
            <span className="icon">👤</span>
            <span>{conference.speaker.name}</span>
          </div>
        </div>

        <button
          className={`btn ${isRegistered ? 'btn-registered' : ''} ${isLoading ? 'btn-loading' : ''}`}
          onClick={handleRegister}
          disabled={isLoading || isRegistered}
          style={{ width: '100%', marginTop: 'auto' }}
        >
          {isLoading ? "Procesando..." : isRegistered ? "✓ Inscrito" : "Inscribirse ahora"}
        </button>
      </div>
    </div>
  )
}
