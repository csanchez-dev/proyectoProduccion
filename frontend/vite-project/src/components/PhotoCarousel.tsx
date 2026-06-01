import { useState, useEffect, useRef } from "react";

interface Photo {
  id: string;
  url: string;
  name: string;
  date: string;
  tag: string;
}

const CAROUSEL_PHOTOS: Photo[] = [
  {
    id: "c1",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
    name: "Conferencia Inaugural CONIITI",
    date: "CONIITI",
    tag: "Apertura"
  },
  {
    id: "c2",
    url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&auto=format&fit=crop",
    name: "Presentación de Proyectos Innovadores",
    date: "CONIITI",
    tag: "Ponencias"
  },
  {
    id: "c3",
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop",
    name: "Panel de Expertos en Tecnologías Emergentes",
    date: "CONIITI",
    tag: "Panel"
  },
  {
    id: "c4",
    url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&auto=format&fit=crop",
    name: "Networking y Alianzas Profesionales",
    date: "CONIITI",
    tag: "Networking"
  },
  {
    id: "c5",
    url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&auto=format&fit=crop",
    name: "Taller Práctico de IA",
    date: "CONIITI",
    tag: "Workshop"
  }
];

export default function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === CAROUSEL_PHOTOS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? CAROUSEL_PHOTOS.length - 1 : prev - 1));
  };

  const selectSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex]);

  return (
    <div
      className="carousel-container premium-glass-card"
      style={{
        position: "relative",
        width: "100%",
        height: "450px",
        overflow: "hidden",
        margin: "2rem auto",
        padding: "10px",
        border: "1px solid rgba(255,255,255,0.4)"
      }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slides */}
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "18px", overflow: "hidden" }}>
        {CAROUSEL_PHOTOS.map((photo, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={photo.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
                pointerEvents: isActive ? "auto" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f172a"
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: isActive ? "scale(1)" : "scale(1.05)",
                  transition: "transform 1.2s ease-in-out"
                }}
              />
              {/* Overlay content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "3rem 2rem 2rem",
                  background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className="glass-badge-premium" style={{ background: "var(--primary-color)", color: "white", padding: "4px 10px", fontSize: "0.7rem" }}>
                    {photo.tag}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                    {photo.date}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {photo.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        style={{
          position: "absolute",
          top: "50%",
          left: "25px",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary-color)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        ◀
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        style={{
          position: "absolute",
          top: "50%",
          right: "25px",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary-color)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        ▶
      </button>

      {/* Indicators/Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 10
        }}
      >
        {CAROUSEL_PHOTOS.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => selectSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: isActive ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: isActive ? "white" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
