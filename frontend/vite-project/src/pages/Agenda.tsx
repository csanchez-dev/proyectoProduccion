import React, { useState, useEffect } from "react"
import DayTabs, { type DayOption } from "../components/DayTabs";
import ConferenceCard from "../components/ConferenceCard"
import { conferences as initialConferences } from "../data/conference_mocks"
import type { Language } from "../utils/i18n"
import { getPonencias } from "../services/api";

export default function Agenda() {
  const [days, setDays] = useState<DayOption[]>(() => {
    const saved = localStorage.getItem("agenda_days_info");
    return saved ? JSON.parse(saved) : [
      { id: "day1", label: "Día 1" },
      { id: "day2", label: "Día 2" },
      { id: "day3", label: "Día 3" },
    ];
  });

  const [activeDayId, setActiveDayId] = useState<string>(days[0]?.id || "day1");

  const [lang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

  const [conferencesList, setConferencesList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const data = await getPonencias();
        if (data && data.length > 0) {
          setConferencesList(data);
        } else {
          // Fallback to mocks if DB is empty for now
          const saved = localStorage.getItem("site_conferences")
          setConferencesList(saved ? JSON.parse(saved) : initialConferences);
        }
      } catch (err) {
        console.error("Error al cargar conferencias de la API:", err);
        const saved = localStorage.getItem("site_conferences")
        setConferencesList(saved ? JSON.parse(saved) : initialConferences);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConferences();
  }, []);

  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const [filterConfig, setFilterConfig] = useState<any[]>(() => {
    const saved = localStorage.getItem("agenda_filters_config");
    if (saved) return JSON.parse(saved);

    // Configuración inicial por defecto basada en el pedido del usuario
    return [
      {
        id: "modality",
        label: "Modalidad",
        property: "type",
        icon: "📍",
        options: [
          { value: "all", label: "Todas las Modalidades" },
          { value: "presencial", label: "Presencial" },
          { value: "virtual", label: "Virtual" }
        ]
      },
      {
        id: "career",
        label: "Carrera",
        property: "career",
        icon: "🎓",
        options: [
          { value: "all", label: "Todas las Carreras" },
          { value: "Administración de Empresas", label: "Administración de Empresas" },
          { value: "Arquitectura", label: "Arquitectura" },
          { value: "Derecho", label: "Derecho" },
          { value: "Economía", label: "Economía" },
          { value: "Ingeniería Civil", label: "Ingeniería Civil" },
          { value: "Ingeniería de Sistemas", label: "Ingeniería de Sistemas" },
          { value: "Ingeniería Electrónica", label: "Ingeniería Electrónica" },
          { value: "Ingeniería Industrial", label: "Ingeniería Industrial" },
          { value: "Psicología", label: "Psicología" },
          { value: "Diseño Gráfico", label: "Diseño Gráfico" },
          { value: "General", label: "General" }
        ]
      }
    ];
  });

  const [config, setConfig] = useState({
    title: localStorage.getItem("agenda_title") || (lang === 'es' ? '📅 Agenda CONIITI 2026' : '📅 CONIITI 2026 Agenda'),
    subtitle: localStorage.getItem("agenda_subtitle") || (lang === 'es' ? 'Explora todas las charlas y conferencias del evento' : 'Explore all the talks and conferences of the event'),
    showFilters: localStorage.getItem("agenda_show_filters") !== "false",
    columns: localStorage.getItem("agenda_cols") || "auto"
  });

  const refreshConfig = () => {
    setConfig({
      title: localStorage.getItem("agenda_title") || (lang === 'es' ? '📅 Agenda CONIITI 2026' : '📅 CONIITI 2026 Agenda'),
      subtitle: localStorage.getItem("agenda_subtitle") || (lang === 'es' ? 'Explora todas las charlas y conferencias del evento' : 'Explore all the talks and conferences of the event'),
      showFilters: localStorage.getItem("agenda_show_filters") !== "false",
      columns: localStorage.getItem("agenda_cols") || "auto"
    });
    const savedDays = localStorage.getItem("agenda_days_info");
    if (savedDays) setDays(JSON.parse(savedDays));

    const savedFilters = localStorage.getItem("agenda_filters_config");
    if (savedFilters) setFilterConfig(JSON.parse(savedFilters));
  };

  useEffect(() => {
    window.addEventListener('site-config-updated', refreshConfig);
    return () => window.removeEventListener('site-config-updated', refreshConfig);
  }, [lang]);

  const filteredConferences = conferencesList.filter((conf: any) => {
    const matchesSearch =
      conf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.speaker.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Lógica de filtrado dinámica
    const matchesDynamicFilters = filterConfig.every(filter => {
      const selectedValue = activeFilters[filter.id] || "all";
      if (selectedValue === "all") return true;
      return conf[filter.property] === selectedValue;
    });

    const confDayId = conf.dayId ?? conf.day ?? conf.day_id ?? conf.dayNumber ?? conf.date
    const matchesDay = !confDayId || confDayId === activeDayId

    return matchesSearch && matchesDynamicFilters && matchesDay
  })

  const clearFilters = () => {
    setSearchTerm("")
    setActiveFilters({})
  }

  const hasActiveFilters = searchTerm || Object.values(activeFilters).some(v => v !== "all" && v !== "")

  const selectStyle: React.CSSProperties = {
    padding: '0.72rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    outline: 'none',
    minWidth: '170px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: 'white',
    color: '#374151',
    transition: 'border-color 0.2s',
  }

  return (
    <section className="agenda-page">
      {/* ── Header ── */}
      <div className="agenda-header-section">
        <h1 className="agenda-title">{config.title}</h1>
        <p className="agenda-subtitle">{config.subtitle}</p>
        <DayTabs days={days} activeDayId={activeDayId} onChange={setActiveDayId} />

        {/* ── Controles de búsqueda y filtros ── */}
        {config.showFilters && (
          <div className="agenda-controls-card">
            {/* Buscador */}
            <div className="search-box" style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
              <input
                type="text"
                placeholder={lang === 'es' ? "Buscar por charla o ponente..." : "Search by talk or speaker..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  background: 'white',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Filtros Dinámicos */}
            {filterConfig.map(filter => (
              <select
                key={filter.id}
                value={activeFilters[filter.id] || "all"}
                onChange={(e) => setActiveFilters({ ...activeFilters, [filter.id]: e.target.value })}
                style={selectStyle}
              >
                {filter.options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "all" ? `${filter.icon} ${opt.label}` : opt.label}
                  </option>
                ))}
              </select>
            ))}

            {/* Botón limpiar (solo si hay filtros activos) */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.72rem 1.2rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  background: '#fff0f0',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e74c3c'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#e74c3c'; }}
              >
                ✕ {lang === 'es' ? 'Limpiar' : 'Clear'}
              </button>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        <p className="results-count">
          {filteredConferences.length} {lang === 'es'
            ? `conferencia${filteredConferences.length !== 1 ? 's' : ''} encontrada${filteredConferences.length !== 1 ? 's' : ''}`
            : `conference${filteredConferences.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* ── Grilla de conferencias ── */}
      <div className="agenda" style={config.columns !== "auto" ? { gridTemplateColumns: `repeat(${config.columns}, 1fr)` } : {}}>
        {isLoading ? (
          <div className="loading-container" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
            <div className="shimmer-card" style={{ height: '200px', borderRadius: '20px', background: '#f0f0f0' }}></div>
            <p style={{ marginTop: '1rem', color: '#666' }}>{lang === 'es' ? 'Cargando conferencias reales desde la API...' : 'Loading real conferences from the API...'}</p>
          </div>
        ) : filteredConferences.length > 0 ? (
          filteredConferences.map((conf: any) => (
            <ConferenceCard key={conf.id} conference={conf} />
          ))
        ) : (
          <div className="agenda-empty">
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🔎</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
              {lang === 'es' ? 'No se encontraron conferencias' : 'No conferences found'}
            </h3>
            <p style={{ color: '#9ca3af' }}>
              {lang === 'es'
                ? 'Prueba con otros términos de búsqueda o ajusta los filtros.'
                : 'Try other search terms or adjust the filters.'}
            </p>
            <button onClick={clearFilters} className="btn" style={{ marginTop: '1.5rem', padding: '10px 28px' }}>
              {lang === 'es' ? 'Limpiar filtros' : 'Clear filters'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
