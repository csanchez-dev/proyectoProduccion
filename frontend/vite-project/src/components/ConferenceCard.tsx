import { useState, useEffect } from "react"
import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  const [maxCapacity, setMaxCapacity] = useState(() => {
    if (conference.type === 'virtual') return 500;
    const capacities = JSON.parse(localStorage.getItem('site_location_capacities') || '{}');
    return capacities[conference.location] || 150;
  });

  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [availableSeats, setAvailableSeats] = useState(() => {
    const savedStats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
    const confStat = savedStats.find((s: any) => s.name === conference.title);
    return confStat ? maxCapacity - confStat.value : maxCapacity;
  });

  const isFull = availableSeats <= 0;

  // Lógica de colores dinámica para la disponibilidad
  const getStockColor = () => {
    if (availableSeats <= 0) return "#ff4d4d"; // Rojo
    if (availableSeats <= 50) return "#ffa500"; // Naranja (va tornándose hacia 0)
    if (availableSeats <= 100) return "#fff9c4"; // Amarillo claro
    return "#c8e6c9"; // Verde claro (150 a 100)
  };

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
    window.addEventListener('storage', refreshCapacity);
    return () => {
      window.removeEventListener('site-config-updated', refreshCapacity);
      window.removeEventListener('storage', refreshCapacity);
    };
  }, [conference.location, conference.title, conference.type]);

  const handleRegister = () => {
    if (isRegistered || isFull) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRegistered(true);
      setAvailableSeats((prev: number) => prev - 1);
      const stats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
      const confIndex = stats.findIndex((s: any) => s.name === conference.title);
      if (confIndex >= 0) { stats[confIndex].value += 1; }
      else { stats.push({ name: conference.title, value: 1 }); }
      localStorage.setItem('conf_stats', JSON.stringify(stats));
    }, 1500);
  }

  return (
    <div className={`card ${isRegistered ? 'registered' : ''} ${isFull ? 'full' : ''}`} style={{ position: 'relative' }}>

      {/* 1. Badge de presencialidad movido a la esquina superior derecha */}
      <div className={`modality-badge ${conference.type || 'presencial'}`} >
        {conference.type === 'virtual' ? '🌐 Virtual' : '📍 Presencial'}
      </div>

      <div className="card-image-wrapper">
        <img src="/conference-card.jpg" alt={conference.title} className="card-img" />
        <div className="category-badge">{conference.category || 'General'}</div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* 2. Título resaltado en azul */}
        <h3 style={{ color: '#0052cc', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '10px' }}>
          {conference.title}
        </h3>

        {/* 3. Botón centrado y subido (antes de la info detallada) */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <button
            className={`btn ${isRegistered ? 'btn-registered' : ''} ${isFull && !isRegistered ? 'btn-full' : ''}`}
            onClick={handleRegister}
            disabled={isLoading || isRegistered || isFull}
            style={{
              width: '80%',
              backgroundColor: isRegistered ? '#ccc' : '#003eb3', // Azul más intenso
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px', // Bordes redondeados
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? "Procesando..." : isRegistered ? "✓ Inscrito" : isFull ? "Cupos Agotados" : "Inscribirse ahora"}
          </button>
        </div>

        {/* 4. Visualización de Stock con fondo dinámico */}
        <div className="stock-info" style={{
          backgroundColor: getStockColor(),
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px',
          transition: 'background-color 0.5s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span className="stock-label" style={{ fontWeight: 'bold', color: '#333' }}>Disponibilidad:</span>
            <span className="stock-count" style={{ fontWeight: 'bold', color: '#333' }}>
              {isFull ? "Agotado" : `${availableSeats} de ${maxCapacity}`}
            </span>
          </div>
          <div className="progress-bar-bg" style={{ backgroundColor: 'rgba(0,0,0,0.1)', height: '8px', borderRadius: '4px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.max(0, (availableSeats / maxCapacity) * 100)}%`,
                background: isFull ? '#e74c3c' : '#2ecc71',
                height: '100%',
                borderRadius: '4px'
              }}
            ></div>
          </div>
        </div>

        <p className="description">{conference.description}</p>

        <div className="info" style={{ marginTop: '10px' }}>
          <div className="info-row"><span>🕒 {new Date(conference.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div className="info-row"><span style={{ fontWeight: 600 }}>📍 {conference.type === 'virtual' ? 'Plataforma Virtual' : conference.location}</span></div>
          <div className="info-row"><span>👤 {conference.speaker.name}</span></div>
        </div>
      </div>
    </div>
  )
}
