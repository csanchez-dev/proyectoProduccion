import React, { useState, useEffect } from 'react';

const SERVICES = [
  { name: 'Auth Service', url: 'http://localhost:3000/health' },
  { name: 'Agenda Service', url: 'http://localhost:3001/health' },
  { name: 'Inscription Service', url: 'http://localhost:3002/health' },
  { name: 'Notification Service', url: 'http://localhost:4000/health' }
];

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'up' | 'down';
  uptime?: number;
  lastChecked?: string;
}

export default function UptimePanel() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>(
    SERVICES.map(s => ({ ...s, status: 'checking' }))
  );

  const checkServices = async () => {
    const updatedStatuses = await Promise.all(
      SERVICES.map(async (service) => {
        try {
          // Intentamos hacer fetch al health endpoint
          const res = await fetch(service.url, { method: 'GET', mode: 'cors' });
          if (res.ok) {
            const data = await res.json();
            return {
              ...service,
              status: 'up' as const,
              uptime: data.uptime || 0,
              lastChecked: new Date().toLocaleTimeString()
            };
          }
          throw new Error('Not OK');
        } catch (err) {
          return {
            ...service,
            status: 'down' as const,
            lastChecked: new Date().toLocaleTimeString()
          };
        }
      })
    );
    setStatuses(updatedStatuses);
  };

  useEffect(() => {
    checkServices();
    // Re-check every 15 seconds
    const interval = setInterval(checkServices, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="uptime-panel fade-in" style={{ padding: '2rem' }}>
      <h2>🟢 Panel de Disponibilidad (Uptime)</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Monitoreo en tiempo real del estado de los microservicios del sistema.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {statuses.map((s, idx) => (
          <div key={idx} className="premium-glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.name}</h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: s.status === 'up' ? '#dcfce7' : s.status === 'down' ? '#fee2e2' : '#f3f4f6',
                color: s.status === 'up' ? '#166534' : s.status === 'down' ? '#991b1b' : '#374151'
              }}>
                {s.status.toUpperCase()}
              </span>
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', color: '#4b5563' }}>
              <div><strong>Endpoint:</strong> <a href={s.url} target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>{s.url}</a></div>
              {s.status === 'up' && (
                <div><strong>Uptime:</strong> {formatUptime(s.uptime)}</div>
              )}
              <div><strong>Última revisión:</strong> {s.lastChecked || '...'}</div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={checkServices}
        className="btn"
        style={{ marginTop: '2rem' }}
      >
        Actualizar Estado Ahora
      </button>
    </div>
  );
}
