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

  // Obtener categorías únicas para los filtros
  const categories = useMemo(() => {
    const cats = new Set(conferencesList.map((c: any) => c.category))
    return ["all", ...Array.from(cats)]
  }, [conferencesList])

  const levels = ["all", "Básico", "Intermedio", "Avanzado"]

  const filteredConferences = conferencesList.filter((conf: any) => {
    const matchesSearch = conf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.speaker.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || conf.category === categoryFilter
    const matchesLevel = levelFilter === "all" || conf.level === levelFilter

    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <section className="agenda-page">
      <div className="agenda-header-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>
          {lang === 'es' ? 'Agenda CONIITI 2026' : 'CONIITI 2026 Agenda'}
        </h1>

        <div className="agenda-controls" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div className="search-box" style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
            <input
              type="text"
              placeholder={lang === 'es' ? "Buscar por charla o ponente..." : "Search by talk or speaker..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.5rem',
                borderRadius: '12px',
                border: '1px solid #eee',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = '#eee'}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee', outline: 'none', minWidth: '150px' }}
          >
            <option value="all">{lang === 'es' ? "Todas las Categorías" : "All Categories"}</option>
            {categories.filter(c => c !== "all").map(cat => (
              <option key={cat as string} value={cat as string}>{cat as string}</option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee', outline: 'none', minWidth: '150px' }}
          >
            <option value="all">{lang === 'es' ? "Todos los Niveles" : "All Levels"}</option>
            {levels.filter(l => l !== "all").map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="agenda">
        {filteredConferences.length > 0 ? (
          filteredConferences.map((conf: any) => (
            <ConferenceCard key={conf.id} conference={conf} />
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '4rem',
            color: '#888',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🔎</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{lang === 'es' ? 'No se encontraron conferencias' : 'No conferences found'}</h3>
            <p>{lang === 'es' ? 'Prueba con otros términos de búsqueda o ajusta los filtros.' : 'Try other search terms or adjust the filters.'}</p>
            <button
              onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setLevelFilter("all"); }}
              style={{
                marginTop: '1.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {lang === 'es' ? 'Limpiar filtros' : 'Clear filters'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
