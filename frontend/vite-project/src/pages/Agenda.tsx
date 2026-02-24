import { useState, useMemo } from "react"
import ConferenceCard from "../components/ConferenceCard"
import { conferences as initialConferences } from "../data/conference_mocks"
import type { Language } from "../utils/i18n"

export default function Agenda() {
  const [lang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

  const [conferencesList] = useState(() => {
    const saved = localStorage.getItem("site_conferences")
    return saved ? JSON.parse(saved) : initialConferences
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [careerFilter, setCareerFilter] = useState("all")

  const categories = useMemo(() => {
    const cats = new Set(conferencesList.map((c: any) => c.category).filter(Boolean))
    return ["all", ...Array.from(cats)] as string[]
  }, [conferencesList])

  const levels = ["all", "Básico", "Intermedio", "Avanzado"]

  const careers = [
    "all",
    "Administración de Empresas",
    "Arquitectura",
    "Derecho",
    "Economía",
    "Ingeniería Civil",
    "Ingeniería de Sistemas",
    "Ingeniería Electrónica",
    "Ingeniería Industrial",
    "Psicología",
    "Diseño Gráfico",
    "General"
  ]

  const filteredConferences = conferencesList.filter((conf: any) => {
    const matchesSearch =
      conf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.speaker.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || conf.category === categoryFilter
    const matchesLevel = levelFilter === "all" || conf.level === levelFilter
    const matchesCareer = careerFilter === "all" || conf.career === careerFilter
    return matchesSearch && matchesCategory && matchesLevel && matchesCareer
  })

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setLevelFilter("all")
    setCareerFilter("all")
  }

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || levelFilter !== "all" || careerFilter !== "all"

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
        <h1 className="agenda-title">
          {lang === 'es' ? '📅 Agenda CONIITI 2026' : '📅 CONIITI 2026 Agenda'}
        </h1>
        <p className="agenda-subtitle">
          {lang === 'es'
            ? 'Explora todas las charlas y conferencias del evento'
            : 'Explore all the talks and conferences of the event'}
        </p>

        {/* ── Controles de búsqueda y filtros ── */}
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

          {/* Filtro Carrera */}
          <select value={careerFilter} onChange={(e) => setCareerFilter(e.target.value)} style={selectStyle}>
            <option value="all">🎓 {lang === 'es' ? "Todas las Carreras" : "All Careers"}</option>
            {careers.filter(c => c !== "all").map(career => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>

          {/* Filtro Categoría */}
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
            <option value="all">🏷️ {lang === 'es' ? "Todas las Categorías" : "All Categories"}</option>
            {categories.filter(c => c !== "all").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Filtro Nivel */}
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={selectStyle}>
            <option value="all">📊 {lang === 'es' ? "Todos los Niveles" : "All Levels"}</option>
            {levels.filter(l => l !== "all").map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

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

        {/* Contador de resultados */}
        <p className="results-count">
          {filteredConferences.length} {lang === 'es'
            ? `conferencia${filteredConferences.length !== 1 ? 's' : ''} encontrada${filteredConferences.length !== 1 ? 's' : ''}`
            : `conference${filteredConferences.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* ── Grilla de conferencias ── */}
      <div className="agenda">
        {filteredConferences.length > 0 ? (
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
