import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Conference } from "../types/conference";

/* ── Mapa de sede → enlace de YouTube ── */
const VENUE_YOUTUBE_MAP: Record<string, string> = {
  "Auditorio Paraninfo": "https://youtu.be/HWVBg2q2XOQ",
  "Auditorio Torres":    "https://youtu.be/WK8aeqznDPY",
  "Sede 4":              "https://youtu.be/Xlls8wk7pKo",   // todas las salas
};

/** Dado un nombre de ubicación, devuelve la URL de YouTube correspondiente (o null). */
function getYouTubeLink(location: string | undefined): string | null {
  if (!location) return null;
  const loc = location.toLowerCase();
  for (const [key, url] of Object.entries(VENUE_YOUTUBE_MAP)) {
    if (loc.includes(key.toLowerCase())) return url;
  }
  return null;
}

function toEmbedUrl(url: string): string {
  const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
  const embedParams = `autoplay=1&rel=0&modestbranding=1&origin=${origin}`;
  const match = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
  if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}?${embedParams}`;
  if (url.includes("/embed/")) {
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?${embedParams}`;
  }
  const match2 = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (match2) return `https://www.youtube-nocookie.com/embed/${match2[1]}?${embedParams}`;
  return url;
}

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  const [maxCapacity, setMaxCapacity] = useState(() => {
    try {
      if (conference?.type === "virtual") return 500;
      const capacities = JSON.parse(
        localStorage.getItem("site_location_capacities") || "{}"
      );
      return capacities[conference?.location || ""] || 150;
    } catch {
      return 150;
    }
  });

  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      const sessionData = localStorage.getItem("user_session");
      if (!sessionData) return false;
      const currentUser = JSON.parse(sessionData);
      if (!currentUser || !currentUser.email) return false;
      const userRegs = JSON.parse(
        localStorage.getItem(`registrations_${currentUser.email}`) || "[]"
      );
      return Array.isArray(userRegs) && userRegs.some((r: any) => String(r?.id) === String(conference?.id));
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const [availableSeats, setAvailableSeats] = useState(() => {
    try {
      const savedStats = JSON.parse(localStorage.getItem("conf_stats") || "[]");
      if (Array.isArray(savedStats)) {
        const confStat = savedStats.find((s: any) => s?.name === conference?.title);
        return confStat ? maxCapacity - confStat.value : maxCapacity;
      }
    } catch {}
    return maxCapacity;
  });

  const isFull = availableSeats <= 0;

  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const getStockColor = () => {
    if (availableSeats <= 0) return "#ff4d4d";
    if (availableSeats <= 50) return "#ffa500";
    if (availableSeats <= 100) return "#fff9c4";
    return "#c8e6c9";
  };

  useEffect(() => {
    const refreshCapacity = () => {
      try {
        const capacities = JSON.parse(
          localStorage.getItem("site_location_capacities") || "{}"
        );
        const newMax =
          conference?.type === "virtual"
            ? 500
            : capacities[conference?.location || ""] || 150;

        setMaxCapacity(newMax);

        const savedStats = JSON.parse(localStorage.getItem("conf_stats") || "[]");
        if (Array.isArray(savedStats)) {
          const confStat = savedStats.find((s: any) => s?.name === conference?.title);
          setAvailableSeats(confStat ? newMax - confStat.value : newMax);
        } else {
          setAvailableSeats(newMax);
        }
      } catch {
        setMaxCapacity(150);
        setAvailableSeats(150);
      }
    };

    window.addEventListener("site-config-updated", refreshCapacity);
    window.addEventListener("storage", refreshCapacity);

    return () => {
      window.removeEventListener("site-config-updated", refreshCapacity);
      window.removeEventListener("storage", refreshCapacity);
    };
  }, [conference?.location, conference?.title, conference?.type]);

  useEffect(() => {
    if (!showVideoModal) {
      setHasVideoError(false);
    }
  }, [showVideoModal]);

  const handleRegister = () => {
    if (isRegistered || isFull) return;

    const sessionData = localStorage.getItem("user_session");
    if (!sessionData) {
      alert("Debes iniciar sesión para inscribirte en conferencias.");
      window.location.href = "/login";
      return;
    }

    const currentUser = JSON.parse(sessionData);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsRegistered(true);
      setAvailableSeats((prev: number) => prev - 1);

      const stats = JSON.parse(localStorage.getItem("conf_stats") || "[]");
      const confIndex = stats.findIndex((s: any) => s.name === conference.title);

      if (confIndex >= 0) {
        stats[confIndex].value += 1;
      } else {
        stats.push({ name: conference.title, value: 1 });
      }

      localStorage.setItem("conf_stats", JSON.stringify(stats));

      const userRegKey = `registrations_${currentUser.email}`;
      const userRegs = JSON.parse(localStorage.getItem(userRegKey) || "[]");

      const normalized = {
        ...conference,
        id:
          conference.id ||
          (conference as any).id_ponencia ||
          Date.now().toString(),
        title: conference.title || (conference as any).titulo || "Sin título",
        startTime:
          conference.startTime || (conference as any).hora_inicio || "",
        endTime: conference.endTime || (conference as any).hora_fin || "",
        location:
          conference.location ||
          (conference as any).sala?.nombre ||
          (conference as any).ubicacion ||
          "Pendiente",
        dayId:
          conference.dayId ||
          ((conference as any).dia_id ? `day${(conference as any).dia_id}` : "day1"),
        attended: (conference as any).attended || false,
      };

      if (
        !userRegs.some(
          (r: any) =>
            String(r.id) === String(normalized.id) || r.title === normalized.title
        )
      ) {
        userRegs.push(normalized);
        localStorage.setItem(userRegKey, JSON.stringify(userRegs));
        window.dispatchEvent(new Event("storage"));
      }

      alert("🎉 ¡Inscripción exitosa! Puedes verla en tu perfil.");
    }, 1500);
  };

  const formatTime = (value: any) => {
    if (!value) return "";
    const strVal = String(value);

    if (strVal.includes("T")) {
      const date = new Date(strVal);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    if (strVal.includes(":") && strVal.length <= 5) return strVal;

    try {
      const date = new Date(strVal);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return strVal;
    } catch {
      return strVal;
    }
  };

  const getTimeZoneLabel = () => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const labels: Record<string, string> = {
        "America/Bogota": "Hora Colombia",
        "Europe/Rome": "Hora Italia",
        "America/Mexico_City": "Hora México",
        "America/Lima": "Hora Perú",
        "America/Santiago": "Hora Chile",
        "America/Argentina/Buenos_Aires": "Hora Argentina",
      };

      return labels[zone] || zone.replace("_", " ");
    } catch {
      return "Hora local";
    }
  };

  const categoryLabel = conference.category || "General";
  const speakerName = conference.speaker?.name || "Ponente por confirmar";
  const youtubeLink = getYouTubeLink(conference.location);

  return (
    <div
      className={`card ${isRegistered ? "registered" : ""} ${
        isFull ? "full" : ""
      }`}
      data-reveal="up"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Modal de Perfil del Expositor */}
      {showSpeakerModal && (
        <div 
          className="modal-overlay fade-in" 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
            padding: '20px'
          }}
          onClick={() => setShowSpeakerModal(false)}
        >
          <div 
            className="modal-content" 
            style={{ 
              background: 'white', padding: '2.5rem', borderRadius: '32px', 
              maxWidth: '500px', width: '100%', textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowSpeakerModal(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>
            <div style={{ marginBottom: '1.5rem' }}>
              <img 
                src={conference.speaker?.avatar || "/default-avatar.png"} 
                alt={speakerName} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-color)', padding: '4px' }}
              />
            </div>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', fontWeight: 800, marginBottom: '0.5rem' }}>{speakerName}</h3>
            <p style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.5rem' }}>{conference.speaker?.organization}</p>
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>{conference.speaker?.bio || "No hay biografía disponible para este invitado."}</p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }}
              onClick={() => setShowSpeakerModal(false)}
            >
              Cerrar Perfil
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 20,
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 900,
            background: "#0b3b8f",
            color: "white",
            lineHeight: 1,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
          }}
        >
          {categoryLabel}
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 900,
            backgroundColor: conference.type === "virtual" ? "#0ea5e9" : "#22c55e",
            color: "white",
            lineHeight: 1,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
          }}
        >
          {conference.type === "virtual" ? "🌐 Virtual" : "📍 Presencial"}
        </span>
      </div>

      <div className="card-image-wrapper">
        <img src="/conference-card.jpg" alt={conference.title} className="card-img" />
      </div>

      <div
        className="card-body"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#0052cc",
            fontWeight: 900,
            fontSize: "1.3rem",
            margin: "0 0 10px 0",
            lineHeight: 1.2,
          }}
        >
          {conference.title}
        </h3>

        <div
          className="info"
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <div className="info-row">
            <span>
              🕒 {formatTime(conference.startTime)}
              {conference.endTime ? ` - ${formatTime(conference.endTime)}` : ""}
              <span style={{ color: "#64748b", fontWeight: 600 }}>
                {" "}({getTimeZoneLabel()})
              </span>
            </span>
          </div>

          <div className="info-row">
            <span style={{ fontWeight: 700 }}>
              📍 {conference.type === "virtual" ? "Plataforma Virtual" : conference.location}
            </span>
          </div>

          {/* ── Enlace de transmisión en vivo por YouTube ── */}
          {youtubeLink && (
            <div className="info-row" style={{ marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '7px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255,0,0,0.25)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,0,0,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,0,0,0.25)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Ver transmisión
              </button>
            </div>
          )}
        </div>

        {showVideoModal && youtubeLink && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5000,
              padding: '20px',
            }}
            onClick={() => setShowVideoModal(false)}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '900px',
                background: '#111',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #0f172a, #111827)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                    {conference.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                    {conference.location} — Transmisión en vivo
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                <iframe
                  src={toEmbedUrl(youtubeLink)}
                  title={`Transmisión: ${conference.title}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="origin"
                  allowFullScreen
                  onError={() => setHasVideoError(true)}
                />
              </div>
              {hasVideoError && (
                <div style={{ padding: '1.5rem 2rem', color: 'white', textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                    No se puede reproducir el video en este navegador.
                  </p>
                  <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
                    Abre la transmisión directamente en YouTube.
                  </p>
                  <a
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.9rem 1.6rem',
                      borderRadius: '999px',
                      background: '#ff0000',
                      color: 'white',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Abrir en YouTube ↗
                  </a>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#eef3f8",
            borderRadius: "12px",
            padding: "10px 12px",
            marginTop: "12px",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "2px solid #cbd5e1",
                background: "white",
              }}
            />
            <span style={{ fontWeight: 800, color: "#0f172a" }}>👤 {speakerName}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSpeakerModal(true)}
            style={{
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "6px 10px",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#0b3b8f",
              cursor: "pointer",
            }}
          >
            Ver perfil
          </button>
        </div>

        <div
          className="stock-info"
          style={{
            backgroundColor: getStockColor(),
            padding: "10px",
            borderRadius: "10px",
            marginTop: "12px",
            marginBottom: "10px",
            transition: "background-color 0.5s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <span
              className="stock-label"
              style={{ fontWeight: "bold", color: "#333" }}
            >
              Disponibilidad:
            </span>
            <span
              className="stock-count"
              style={{ fontWeight: "bold", color: "#333" }}
            >
              {isFull ? "Agotado" : `${availableSeats} de ${maxCapacity}`}
            </span>
          </div>

          <div
            className="progress-bar-bg"
            style={{
              backgroundColor: "rgba(0,0,0,0.1)",
              height: "8px",
              borderRadius: "4px",
            }}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.max(0, (availableSeats / maxCapacity) * 100)}%`,
                background: isFull ? "#e74c3c" : "#2ecc71",
                height: "100%",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        <p className="description" style={{ margin: 0 }}>
          {conference.description}
        </p>

        {(conference.documentUrl || conference.documentFile) && (
          <div style={{ marginTop: "10px" }}>
            {conference.documentUrl && (
              <a
                href={conference.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#0052cc",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                🔗 Enlace al Material
              </a>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "auto",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        >
          <button
            className={`btn ${isRegistered ? "btn-registered" : ""} ${
              isFull && !isRegistered ? "btn-full" : ""
            }`}
            onClick={handleRegister}
            disabled={isLoading || isRegistered || isFull}
            style={{
              width: "75%",
              maxWidth: "280px",
              minWidth: "200px",
              background: isRegistered
                ? "#d1d5db"
                : "linear-gradient(135deg, #0f4fd6, #2563eb)",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: 900,
              cursor: isRegistered || isFull ? "not-allowed" : "pointer",
              transition:
                "transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease",
              boxShadow: isRegistered
                ? "none"
                : "0 8px 18px rgba(37, 99, 235, 0.25)",
            }}
            onMouseEnter={(e) => {
              if (isRegistered || isFull) return;
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 14px 26px rgba(37, 99, 235, 0.35)";
              e.currentTarget.style.filter = "brightness(1.05)";
            }}
            onMouseLeave={(e) => {
              if (isRegistered || isFull) return;
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 8px 18px rgba(37, 99, 235, 0.25)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {isLoading
              ? "Procesando..."
              : isRegistered
              ? "✓ Inscrito"
              : isFull
              ? "Cupos Agotados"
              : "Inscribirse"}
          </button>
        </div>
      </div>
    </div>
  );
}