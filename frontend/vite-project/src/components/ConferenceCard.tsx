import { useState, useEffect } from "react"
import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  const [maxCapacity, setMaxCapacity] = useState(() => {
    if (conference.type === "virtual") return 500
    const capacities = JSON.parse(
      localStorage.getItem("site_location_capacities") || "{}"
    )
    return capacities[conference.location] || 150
  })

  const [isRegistered, setIsRegistered] = useState(() => {
    const sessionData = localStorage.getItem("user_session")
    if (!sessionData) return false
    const currentUser = JSON.parse(sessionData)
    const userRegs = JSON.parse(
      localStorage.getItem(`registrations_${currentUser.email}`) || "[]"
    )
    return userRegs.some((r: any) => r.id === conference.id)
  })

  const [isLoading, setIsLoading] = useState(false)

  const [availableSeats, setAvailableSeats] = useState(() => {
    const savedStats = JSON.parse(localStorage.getItem("conf_stats") || "[]")
    const confStat = savedStats.find((s: any) => s.name === conference.title)
    return confStat ? maxCapacity - confStat.value : maxCapacity
  })

  const isFull = availableSeats <= 0

  const getStockColor = () => {
    if (availableSeats <= 0) return "#ff4d4d"
    if (availableSeats <= 50) return "#ffa500"
    if (availableSeats <= 100) return "#fff9c4"
    return "#c8e6c9"
  }

  useEffect(() => {
    const refreshCapacity = () => {
      const capacities = JSON.parse(
        localStorage.getItem("site_location_capacities") || "{}"
      )
      const newMax =
        conference.type === "virtual"
          ? 500
          : capacities[conference.location] || 150

      setMaxCapacity(newMax)

      const savedStats = JSON.parse(localStorage.getItem("conf_stats") || "[]")
      const confStat = savedStats.find((s: any) => s.name === conference.title)
      setAvailableSeats(confStat ? newMax - confStat.value : newMax)
    }

    window.addEventListener("site-config-updated", refreshCapacity)
    window.addEventListener("storage", refreshCapacity)

    return () => {
      window.removeEventListener("site-config-updated", refreshCapacity)
      window.removeEventListener("storage", refreshCapacity)
    }
  }, [conference.location, conference.title, conference.type])

  const handleRegister = () => {
    if (isRegistered || isFull) return

    const sessionData = localStorage.getItem("user_session")
    if (!sessionData) {
      alert("Debes iniciar sesión para inscribirte en conferencias.")
      window.location.href = "/login"
      return
    }

    const currentUser = JSON.parse(sessionData)
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setIsRegistered(true)
      setAvailableSeats((prev: number) => prev - 1)

      const stats = JSON.parse(localStorage.getItem("conf_stats") || "[]")
      const confIndex = stats.findIndex((s: any) => s.name === conference.title)

      if (confIndex >= 0) {
        stats[confIndex].value += 1
      } else {
        stats.push({ name: conference.title, value: 1 })
      }

      localStorage.setItem("conf_stats", JSON.stringify(stats))

      const userRegKey = `registrations_${currentUser.email}`
      const userRegs = JSON.parse(localStorage.getItem(userRegKey) || "[]")

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
      }

      if (
        !userRegs.some(
          (r: any) =>
            String(r.id) === String(normalized.id) || r.title === normalized.title
        )
      ) {
        userRegs.push(normalized)
        localStorage.setItem(userRegKey, JSON.stringify(userRegs))
        window.dispatchEvent(new Event("storage"))
      }

      alert("🎉 ¡Inscripción exitosa! Puedes verla en tu perfil.")
    }, 1500)
  }

  const formatTime = (value: string) => {
    if (!value) return ""

    if (value.includes("T")) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }
    }

    if (value.includes(":") && value.length <= 5) return value

    try {
      return new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return value
    }
  }

  const getTimeZoneLabel = () => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const labels: Record<string, string> = {
        "America/Bogota": "Hora Colombia",
        "Europe/Rome": "Hora Italia",
        "America/Mexico_City": "Hora México",
        "America/Lima": "Hora Perú",
        "America/Santiago": "Hora Chile",
        "America/Argentina/Buenos_Aires": "Hora Argentina",
      }

      return labels[zone] || zone.replace("_", " ")
    } catch {
      return "Hora local"
    }
  }

  const categoryLabel = conference.category || "General"
  const speakerName = conference.speaker?.name || "Ponente por confirmar"

  return (
    <div
      className={`card ${isRegistered ? "registered" : ""} ${
        isFull ? "full" : ""
      }`}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
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
        </div>

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
              if (isRegistered || isFull) return
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"
              e.currentTarget.style.boxShadow =
                "0 14px 26px rgba(37, 99, 235, 0.35)"
              e.currentTarget.style.filter = "brightness(1.05)"
            }}
            onMouseLeave={(e) => {
              if (isRegistered || isFull) return
              e.currentTarget.style.transform = "translateY(0) scale(1)"
              e.currentTarget.style.boxShadow =
                "0 8px 18px rgba(37, 99, 235, 0.25)"
              e.currentTarget.style.filter = "brightness(1)"
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
  )
}