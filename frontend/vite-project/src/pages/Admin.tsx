import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { conferences as initialConferences } from "../data/conference_mocks"
import { getEvents, getGenderStats, getConferenceStats, getPageViewsStats } from "../utils/tracker"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts'

export default function Admin() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

    useEffect(() => {
        const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
        window.addEventListener('app-lang-updated', updateLang);
        return () => window.removeEventListener('app-lang-updated', updateLang);
    }, []);

    const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

    const [conferences, setConferences] = useState(() => {
        const saved = localStorage.getItem("site_conferences")
        return saved ? JSON.parse(saved) : initialConferences
    })
    const [deletedConferences, setDeletedConferences] = useState<any[]>(() => {
        const saved = localStorage.getItem("site_deleted_conferences")
        return saved ? JSON.parse(saved) : []
    })
    const [activeTab, setActiveTab] = useState("conferences")
    const [bannerPreview, setBannerPreview] = useState(localStorage.getItem("site_banner") || "/banner-header.png")
    const [logoUniPreview, setLogoUniPreview] = useState(localStorage.getItem("site_logo_uni") || "/ucatolica-logo.png")
    const [logoEventPreview, setLogoEventPreview] = useState(localStorage.getItem("site_logo_evento") || "/logo-coniiti.png")

    // Estados para colores
    const [bgColor, setBgColor] = useState(localStorage.getItem("custom_bg_color") || "#ffffff")
    const [textColor, setTextColor] = useState(localStorage.getItem("custom_text_color") || "#1b1a1a")
    const [headerColor, setHeaderColor] = useState(localStorage.getItem("custom_header_bg") || "#1f2a44")
    const [primaryColor, setPrimaryColor] = useState(localStorage.getItem("custom_primary_color") || "#2563EB")
    const [secondaryColor, setSecondaryColor] = useState(localStorage.getItem("custom_secondary_color") || "#1E293B")

    const dispatchUpdate = () => {
        window.dispatchEvent(new Event('site-config-updated'));
        setBannerPreview(localStorage.getItem("site_banner") || "/banner-header.png");
        setLogoUniPreview(localStorage.getItem("site_logo_uni") || "/ucatolica-logo.png");
        setLogoEventPreview(localStorage.getItem("site_logo_evento") || "/logo-coniiti.png");
        setBgColor(localStorage.getItem("custom_bg_color") || "#ffffff");
        setTextColor(localStorage.getItem("custom_text_color") || "#1b1a1a");
        setHeaderColor(localStorage.getItem("custom_header_bg") || "#1f2a44");
        setPrimaryColor(localStorage.getItem("custom_primary_color") || "#2563EB");
        setSecondaryColor(localStorage.getItem("custom_secondary_color") || "#1E293B");
    };
    const [chartTypes, setChartTypes] = useState<any>({
        views: 'bar',
        gender: 'pie',
        conferences: 'bar'
    })
    const [settingsTab, setSettingsTab] = useState("general")
    const navigate = useNavigate()

    // Gestión de Capacidad de Auditorios
    const [locCapacities, setLocCapacities] = useState(() => {
        const saved = localStorage.getItem("site_location_capacities");
        if (saved) return JSON.parse(saved);
        return {
            "Auditorio Paraninfo": 100,
            "Auditorio Torres": 100,
            "Auditorio Sede 4 - Sala 1": 30,
            "Auditorio Sede 4 - Sala 2": 30,
            "Auditorio Sede 4 - Sala 3": 30,
            "Auditorio Sede 4 - Sala 4": 30,
            "Auditorio Sede 4 - Sala 5": 30,
            "Auditorio Sede 4 - Sala 6": 30
        };
    });

    useEffect(() => {
        localStorage.setItem("site_location_capacities", JSON.stringify(locCapacities));
    }, [locCapacities]);

    useEffect(() => {
        const session = localStorage.getItem("user_session")
        if (session) {
            const user = JSON.parse(session)
            if (user.role === "SUPER_ADMIN" || user.role === "CONTENT_MANAGER") {
                setUserRole(user.role)
            } else {
                navigate("/") // No tiene permisos
            }
        } else {
            navigate("/registro") // No hay sesión
        }
    }, [navigate])

    // Persistencia automática de los cambios
    useEffect(() => {
        localStorage.setItem("site_conferences", JSON.stringify(conferences))
    }, [conferences])

    useEffect(() => {
        localStorage.setItem("site_deleted_conferences", JSON.stringify(deletedConferences))
    }, [deletedConferences])
    const [editingConf, setEditingConf] = useState<any | null>(null)

    const handleDeleteConference = (id: string) => {
        if (confirm("¿Estás seguro de mover esta conferencia a la papelera?")) {
            const confToDelete = conferences.find((c: { id: string }) => c.id === id)
            if (confToDelete) {
                setDeletedConferences([...deletedConferences, confToDelete])
                setConferences(conferences.filter((c: any) => c.id !== id))
            }
        }
    }

    const handleRestoreConference = (id: string) => {
        const confToRestore = deletedConferences.find((c: any) => c.id === id)
        if (confToRestore) {
            setConferences([...conferences, confToRestore])
            setDeletedConferences(deletedConferences.filter((c: any) => c.id !== id))
            alert("Conferencia restaurada")
        }
    }

    const handleEditConference = (conf: { id: string, title: string, description: string, speakerName?: string, startTime: string, endTime: string, location: string, category: string, level: string, speaker: any, career?: string }) => {
        setEditingConf({ ...conf })
    }

    const [showConfForm, setShowConfForm] = useState(false)
    const [newConf, setNewConf] = useState({
        title: "",
        location: "Auditorio Paraninfo",
        description: "",
        speakerName: "",
        startTime: "",
        endTime: "",
        career: "",
        type: "presencial",
        virtualLink: ""
    })

    const handleAddConference = (e: React.FormEvent) => {
        e.preventDefault()

        // Determinar el ponente real (buscar en la lista existente)
        let finalSpeakerName = newConf.speakerName;
        let existingSpeaker = conferences.find((c: any) => c.speaker.name === finalSpeakerName)?.speaker;

        if (finalSpeakerName === "OTRO") {
            finalSpeakerName = (window as any)._tempNewSpeaker || "Invitado Especial";
            existingSpeaker = {
                name: finalSpeakerName,
                organization: "Invitado Externo",
                bio: "Experto invitado al evento",
                avatar: "/default-avatar.png"
            };
        }

        const newId = Date.now().toString()
        const simulatedConf = {
            id: newId,
            title: newConf.title,
            description: newConf.description,
            startTime: newConf.startTime || new Date().toISOString(),
            endTime: newConf.endTime || new Date().toISOString(),
            location: newConf.location,
            type: newConf.type,
            virtualLink: newConf.virtualLink,
            category: "General",
            level: "Básico",
            career: newConf.career || "General",
            speaker: existingSpeaker || {
                name: finalSpeakerName,
                organization: "Por definir",
                bio: "",
                avatar: "/default-avatar.png"
            }
        }
        setConferences([...conferences, simulatedConf])
        setShowConfForm(false)
        setNewConf({ title: "", location: "Auditorio Paraninfo", description: "", speakerName: "", startTime: "", endTime: "", career: "", type: "presencial", virtualLink: "" })
        alert("¡Conferencia agendada con el conferencista seleccionado!")
    }

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        setConferences(conferences.map((c: { id: string }) => c.id === editingConf.id ? editingConf : c))
        setEditingConf(null)
        alert("Cambios guardados correctamente")
    }

    const [showGuestForm, setShowGuestForm] = useState(false)
    const [newGuest, setNewGuest] = useState({
        name: "",
        organization: "",
        bio: "",
        avatar: ""
    })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewGuest({ ...newGuest, avatar: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault()
        const newId = (conferences.length + deletedConferences.length + 1).toString()
        const simulatedConf = {
            id: newId,
            title: `Conferencia de ${newGuest.name}`,
            description: newGuest.bio,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            location: "Pendiente",
            category: "General",
            level: "Básico",
            speaker: { ...newGuest }
        }
        setConferences([...conferences, simulatedConf])
        setShowGuestForm(false)
        setNewGuest({ name: "", organization: "", bio: "", avatar: "" })
        alert("¡Invitado y foto cargados exitosamente!")
    }

    if (!userRole) return <div className="loading">{lang === 'es' ? 'Cargando panel...' : 'Loading panel...'}</div>

    return (
        <div className="admin-container fade-in">
            <div className="admin-header">
                <h1>{t('admin_title')}</h1>
                <p className="role-badge">{userRole === "SUPER_ADMIN" ? t('admin_role_super') : t('admin_role_content')}</p>
            </div>

            <div className="admin-grid">
                <aside className="admin-sidebar">
                    <button
                        className={activeTab === "conferences" ? "active" : ""}
                        onClick={() => setActiveTab("conferences")}
                    >
                        {t('admin_sidebar_agenda')}
                    </button>
                    <button
                        className={activeTab === "guests" ? "active" : ""}
                        onClick={() => setActiveTab("guests")}
                    >
                        {t('admin_sidebar_guests')}
                    </button>
                    <button
                        className={activeTab === "trash" ? "active" : ""}
                        onClick={() => setActiveTab("trash")}
                    >
                        {t('admin_sidebar_trash')}
                    </button>
                    {userRole === "SUPER_ADMIN" && (
                        <button
                            className={activeTab === "analytics" ? "active" : ""}
                            onClick={() => setActiveTab("analytics")}
                        >
                            {t('admin_sidebar_analytics')}
                        </button>
                    )}
                    {userRole === "SUPER_ADMIN" && (
                        <button
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => setActiveTab("settings")}
                        >
                            {t('admin_sidebar_settings')}
                        </button>
                    )}
                </aside>

                <main className="admin-content">
                    {activeTab === "conferences" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Control de Conferencias</h2>
                                <button
                                    className="btn-add"
                                    onClick={() => setShowConfForm(!showConfForm)}
                                >
                                    {showConfForm ? "Cerrar Formulario" : "+ Añadir Nueva"}
                                </button>
                            </div>

                            {showConfForm && (() => {
                                // Obtener lista única de conferencistas disponibles
                                const availableSpeakers = Array.from(new Set(conferences.map((c: any) => c.speaker.name)))
                                    .map(name => conferences.find((c: any) => c.speaker.name === name)?.speaker);

                                return (
                                    <form className="add-guest-form fade-in" onSubmit={handleAddConference}>
                                        <div className="form-group">
                                            <label>Título de la Conferencia</label>
                                            <input
                                                type="text"
                                                required
                                                value={newConf.title}
                                                onChange={e => setNewConf({ ...newConf, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Seleccionar Conferencista / Invitado</label>
                                                <select
                                                    className="admin-select"
                                                    required
                                                    value={newConf.speakerName}
                                                    onChange={e => {
                                                        const selectedName = e.target.value;
                                                        setNewConf({ ...newConf, speakerName: selectedName });
                                                    }}
                                                >
                                                    <option value="">-- Selecciona un invitado --</option>
                                                    {availableSpeakers.map((s, idx) => (
                                                        <option key={idx} value={s.name}>{s.name} ({s.organization})</option>
                                                    ))}
                                                    <option value="OTRO">+ Otro (Escribir nombre)</option>
                                                </select>
                                            </div>
                                            {newConf.speakerName === "OTRO" && (
                                                <div className="form-group">
                                                    <label>Nombre del Nuevo Ponente</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre del nuevo invitado"
                                                        onChange={e => {
                                                            // Guardamos temporalmente en speakerName pero permitimos escribir
                                                            // En el submit manejaremos esto
                                                            (window as any)._tempNewSpeaker = e.target.value;
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Modalidad</label>
                                                <select
                                                    value={newConf.type}
                                                    onChange={e => setNewConf({ ...newConf, type: e.target.value as any })}
                                                    className="admin-select"
                                                >
                                                    <option value="presencial">Presencial</option>
                                                    <option value="virtual">Virtual</option>
                                                </select>
                                            </div>
                                        </div>
                                        {newConf.type === 'virtual' ? (
                                            <div className="form-group">
                                                <label>Enlace de la Reunión (Virtual)</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://zoom.us/j/..."
                                                    value={newConf.virtualLink}
                                                    onChange={e => setNewConf({ ...newConf, virtualLink: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="form-group">
                                                <label>Ubicación (Salón / Auditorio)</label>
                                                <select
                                                    value={newConf.location}
                                                    onChange={e => setNewConf({ ...newConf, location: e.target.value })}
                                                    required
                                                    className="admin-select"
                                                >
                                                    {Object.keys(locCapacities).map(loc => (
                                                        <option key={loc} value={loc}>{loc} (Cap: {locCapacities[loc]})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Carrera Afín</label>
                                            <select
                                                value={newConf.career}
                                                onChange={e => setNewConf({ ...newConf, career: e.target.value })}
                                                required
                                                className="admin-select"
                                            >
                                                <option value="">Selecciona la carrera</option>
                                                <option value="Administración de Empresas">Administración de Empresas</option>
                                                <option value="Arquitectura">Arquitectura</option>
                                                <option value="Derecho">Derecho</option>
                                                <option value="Economía">Economía</option>
                                                <option value="Ingeniería Civil">Ingeniería Civil</option>
                                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                                <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                                                <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                                                <option value="Psicología">Psicología</option>
                                                <option value="Diseño Gráfico">Diseño Gráfico</option>
                                                <option value="General">General / Todas</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Descripción / Resumen</label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={newConf.description}
                                                onChange={e => setNewConf({ ...newConf, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-save-guest">Publicar Conferencia</button>
                                    </form>
                                );
                            })()}

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Ponente</th>
                                        <th>Ubicación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conferences.map((conf: any) => (
                                        <tr key={conf.id}>
                                            <td>{conf.title}</td>
                                            <td>{conf.speaker.name}</td>
                                            <td>{conf.location}</td>
                                            <td className="actions">
                                                <button className="btn-edit-sm" onClick={() => handleEditConference(conf)}>✏️ Editar</button>
                                                <button className="btn-delete-sm" onClick={() => handleDeleteConference(conf.id)}>🗑️ Borrar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === "guests" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Gestión de Invitados</h2>
                                <button
                                    className="btn-add"
                                    onClick={() => setShowGuestForm(!showGuestForm)}
                                >
                                    {showGuestForm ? "Cerrar Formulario" : "+ Nuevo Invitado"}
                                </button>
                            </div>

                            {showGuestForm && (
                                <form className="add-guest-form fade-in" onSubmit={handleAddGuest}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nombre Completo</label>
                                            <input
                                                type="text"
                                                required
                                                value={newGuest.name}
                                                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Organización / Universidad</label>
                                            <input
                                                type="text"
                                                required
                                                value={newGuest.organization}
                                                onChange={(e) => setNewGuest({ ...newGuest, organization: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Foto del Invitado (Cargar desde dispositivo)</label>
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="file-input"
                                            />
                                            {newGuest.avatar && (
                                                <img src={newGuest.avatar} alt="Preview" className="upload-preview" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Bio / Perfil Profesional</label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={newGuest.bio}
                                            onChange={(e) => setNewGuest({ ...newGuest, bio: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn-save-guest">Guardar Invitado</button>
                                </form>
                            )}

                            <div className="guests-grid">
                                {Array.from(new Set(conferences.map((c: any) => c.speaker.name))).map((speakerName: any) => {
                                    const speaker = conferences.find((c: any) => c.speaker.name === speakerName)?.speaker;
                                    return (
                                        <div key={speakerName} className="guest-admin-card fade-in">
                                            <img src={speaker?.avatar || "/default-avatar.png"} alt={speakerName} />
                                            <div className="guest-info">
                                                <h4>{speakerName}</h4>
                                                <p>{speaker?.organization}</p>
                                            </div>
                                            <button className="btn-edit-sm">Editar Datos</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>⚙️ Configuración del Sitio</h2>
                                <p>Personaliza el aspecto y contenido de cada sección del sitio.</p>
                            </div>

                            {/* Sub-navegación de Configuración */}
                            <div className="settings-subnav" style={{
                                display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                                borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '2rem'
                            }}>
                                {[
                                    { id: "general", icon: "⚙️", label: "General" },
                                    { id: "pg-inicio", icon: "🏠", label: "Inicio" },
                                    { id: "pg-invitados", icon: "👥", label: "Invitados" },
                                    { id: "pg-agenda", icon: "📅", label: "Agenda" },
                                    { id: "pg-acerca", icon: "ℹ️", label: "Acerca De" },
                                    { id: "pg-contacto", icon: "✉️", label: "Contacto" },
                                    { id: "pg-aforos", icon: "🏛️", label: "Aforos y Sedes" },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSettingsTab(tab.id)}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: settingsTab === tab.id ? '700' : '500',
                                            background: settingsTab === tab.id ? 'var(--primary-color)' : '#f0f4ff',
                                            color: settingsTab === tab.id ? 'white' : '#374151',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── GENERAL ── */}
                            {settingsTab === "general" && (
                                <form className="settings-form">
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>⚙️ Configuración General</h3>
                                    <div className="form-group">
                                        <label>Nombre del Evento</label>
                                        <input type="text" defaultValue="CONIITI 2026" />
                                    </div>
                                    <div className="form-group">
                                        <label>Tema por País (Colores y Estilos)</label>
                                        <select
                                            defaultValue={localStorage.getItem("site_theme") || "default"}
                                            onChange={(e) => {
                                                const theme = e.target.value;
                                                localStorage.setItem("site_theme", theme);
                                                document.body.className = theme === "default" ? "" : `theme-${theme}`;
                                                dispatchUpdate();
                                            }}
                                            className="theme-select"
                                        >
                                            <option value="default">Estándar (Universidad Católica)</option>
                                            <option value="colombia">Colombia (Amarillo, Azul y Rojo)</option>
                                            <option value="italy">Italia (Verde, Blanco y Rojo)</option>
                                            <option value="mexico">México (Verde y Rojo)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Imagen de Banner (Cabecera)</label>
                                        <div className="banner-edit-zone">
                                            <div className="file-upload-wrapper">
                                                <div className="banner-admin-preview" style={{ marginBottom: '1rem' }}>
                                                    <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 1500000) { alert("La imagen es muy pesada (máx 1.5MB)."); return; }
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                if (reader.result) {
                                                                    try { localStorage.setItem("site_banner", reader.result as string); dispatchUpdate(); }
                                                                    catch { alert("La imagen sigue siendo muy grande para el navegador."); }
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="file-input"
                                                />
                                            </div>
                                            <div className="banner-actions">
                                                <button type="button" className="btn-remove-img" onClick={() => { localStorage.removeItem("site_banner"); dispatchUpdate(); }}>
                                                    Restaurar Original
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Logos de la Institución y Evento (Encabezado)</label>
                                        <div className="logos-edit-grid">
                                            <div className="logo-upload-item">
                                                <span>Logo Universidad</span>
                                                <div className="mini-preview">
                                                    <img src={logoUniPreview} alt="Preview Uni" style={{ height: '40px', objectFit: 'contain', background: '#eee', padding: '5px', borderRadius: '4px' }} />
                                                </div>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) { alert("El logo es muy grande (máx 800KB)."); return; }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => { if (reader.result) { localStorage.setItem("site_logo_uni", reader.result as string); dispatchUpdate(); } };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                                <button type="button" className="btn-remove-img-sm" onClick={() => { localStorage.removeItem("site_logo_uni"); dispatchUpdate(); }}>Restaurar Original</button>
                                            </div>
                                            <div className="logo-upload-item">
                                                <span>Logo CONIITI</span>
                                                <div className="mini-preview">
                                                    <img src={logoEventPreview} alt="Preview Evento" style={{ height: '40px', objectFit: 'contain', background: '#eee', padding: '5px', borderRadius: '4px' }} />
                                                </div>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) { alert("El logo es muy grande (máx 800KB)."); return; }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => { if (reader.result) { localStorage.setItem("site_logo_evento", reader.result as string); dispatchUpdate(); } };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                                <button type="button" className="btn-remove-img-sm" onClick={() => { localStorage.removeItem("site_logo_evento"); dispatchUpdate(); }}>Restaurar Original</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Personalización de Colores</label>
                                        <div className="color-picker-grid">
                                            <div className="color-item">
                                                <span>Fondo General</span>
                                                <input type="color" value={bgColor} onChange={(e) => { localStorage.setItem("custom_bg_color", e.target.value); setBgColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Texto Principal</span>
                                                <input type="color" value={textColor} onChange={(e) => { localStorage.setItem("custom_text_color", e.target.value); setTextColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color de Cabecera</span>
                                                <input type="color" value={headerColor} onChange={(e) => { localStorage.setItem("custom_header_bg", e.target.value); setHeaderColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color Primario (Botones)</span>
                                                <input type="color" value={primaryColor} onChange={(e) => { localStorage.setItem("custom_primary_color", e.target.value); setPrimaryColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color Secundario</span>
                                                <input type="color" value={secondaryColor} onChange={(e) => { localStorage.setItem("custom_secondary_color", e.target.value); setSecondaryColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Modo de Mantenimiento</label>
                                        <input type="checkbox" />
                                    </div>
                                    <div className="admin-actions-footer">
                                        <button type="button" className="btn-submit" onClick={() => alert("Configuración global guardada correctamente")}>
                                            Guardar Cambios Globales
                                        </button>
                                        <button type="button" className="btn-logout" style={{ marginLeft: '1rem', background: '#e74c3c' }}
                                            onClick={() => {
                                                if (confirm("¿Seguro que quieres borrar toda la personalización?")) {
                                                    ["site_banner", "site_logo_uni", "site_logo_evento", "custom_bg_color", "custom_text_color", "custom_header_bg", "custom_primary_color", "custom_secondary_color"].forEach(key => localStorage.removeItem(key));
                                                    dispatchUpdate();
                                                }
                                            }}>
                                            Limpiar y Resetear Diseño
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── PÁGINA: INICIO ── */}
                            {settingsTab === "pg-inicio" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>🏠 Configuración — Página de Inicio</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título Principal (Hero)</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_hero_title") || "CONIITI 2026"}
                                                onChange={e => localStorage.setItem("home_hero_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Subtítulo del Hero</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_hero_subtitle") || "Congreso Internacional de Innovación Tecnológica"}
                                                onChange={e => localStorage.setItem("home_hero_subtitle", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Imagen de Fondo (Hero)</label>
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => { if (reader.result) localStorage.setItem("home_hero_bg", reader.result as string); };
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Texto del Botón Principal</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_btn_text") || "Ver Agenda"}
                                                onChange={e => localStorage.setItem("home_btn_text", e.target.value)} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); alert("Cambios de Inicio guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: INVITADOS ── */}
                            {settingsTab === "pg-invitados" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>👥 Configuración — Página de Invitados</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("guests_title") || "Nuestros Invitados"}
                                                onChange={e => localStorage.setItem("guests_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Subtítulo / Descripción</label>
                                            <textarea rows={2} defaultValue={localStorage.getItem("guests_subtitle") || "Expertos internacionales que compartirán su conocimiento"}
                                                onChange={e => localStorage.setItem("guests_subtitle", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Mostrar Organización del Ponente</label>
                                            <input type="checkbox" defaultChecked={localStorage.getItem("guests_show_org") !== "false"}
                                                onChange={e => localStorage.setItem("guests_show_org", String(e.target.checked))} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); alert("Cambios de Invitados guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: AGENDA ── */}
                            {settingsTab === "pg-agenda" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>📅 Configuración — Página de Agenda</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("agenda_title") || "Agenda CONIITI 2026"}
                                                onChange={e => localStorage.setItem("agenda_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Descripción Introductoria</label>
                                            <textarea rows={2} defaultValue={localStorage.getItem("agenda_subtitle") || "Explora todas las charlas y conferencias del evento"}
                                                onChange={e => localStorage.setItem("agenda_subtitle", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Mostrar Filtros en la Agenda</label>
                                            <input type="checkbox" defaultChecked={localStorage.getItem("agenda_show_filters") !== "false"}
                                                onChange={e => localStorage.setItem("agenda_show_filters", String(e.target.checked))} />
                                        </div>
                                        <div className="form-group">
                                            <label>Número de Columnas (Escritorio)</label>
                                            <select defaultValue={localStorage.getItem("agenda_cols") || "auto"}
                                                onChange={e => localStorage.setItem("agenda_cols", e.target.value)}>
                                                <option value="auto">Automático (recomendado)</option>
                                                <option value="2">2 columnas</option>
                                                <option value="3">3 columnas</option>
                                                <option value="4">4 columnas</option>
                                            </select>
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); alert("Cambios de Agenda guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: ACERCA DE ── */}
                            {settingsTab === "pg-acerca" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>ℹ️ Configuración — Acerca De</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_title") || "Acerca del CONIITI"}
                                                onChange={e => localStorage.setItem("about_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Descripción del Evento</label>
                                            <textarea rows={5} defaultValue={localStorage.getItem("about_description") || "El Congreso Internacional de Innovación Tecnológica reúne a expertos de todo el mundo para compartir avances en ciencia y tecnología."}
                                                onChange={e => localStorage.setItem("about_description", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha del Evento</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_date") || "2026"}
                                                onChange={e => localStorage.setItem("about_date", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Lugar del Evento</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_location") || "Universidad Católica"}
                                                onChange={e => localStorage.setItem("about_location", e.target.value)} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); alert("Cambios de 'Acerca de' guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: CONTACTO ── */}
                            {settingsTab === "pg-contacto" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>✉️ Configuración — Contacto</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_title") || "Contáctanos"}
                                                onChange={e => localStorage.setItem("contact_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Correo Electrónico de Contacto</label>
                                            <input type="email" defaultValue={localStorage.getItem("contact_email") || "coniiti@ucatolica.edu.co"}
                                                onChange={e => localStorage.setItem("contact_email", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Teléfono</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_phone") || "+57 (601) 327 7300"}
                                                onChange={e => localStorage.setItem("contact_phone", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Dirección</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_address") || "Bogotá, Colombia"}
                                                onChange={e => localStorage.setItem("contact_address", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Mensaje en el formulario de contacto</label>
                                            <textarea rows={3} defaultValue={localStorage.getItem("contact_form_msg") || "¿Tienes dudas? Escríbenos y te responderemos a la brevedad."}
                                                onChange={e => localStorage.setItem("contact_form_msg", e.target.value)}></textarea>
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); alert("Cambios de Contacto guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: AFOROS ── */}
                            {settingsTab === "pg-aforos" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>🏛️ Gestión de Aforos y Auditorios</h3>
                                    <p className="hint">Configura la capacidad máxima de cada lugar. Los cambios afectarán el límite de inscripciones en la agenda.</p>

                                    <div className="settings-form" style={{ marginTop: '1.5rem' }}>
                                        <div className="venues-grid" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '2rem'
                                        }}>
                                            {Object.keys(locCapacities).map(loc => {
                                                const conferenceCount = conferences.filter((c: any) => c.location === loc).length;
                                                return (
                                                    <div className="venue-card" key={loc} style={{
                                                        background: 'white',
                                                        padding: '1.2rem',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        border: '1px solid #edf2f7',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.8rem'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: '#2d3748' }}>{loc}</h4>
                                                                <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginTop: '4px' }}>
                                                                    {conferenceCount} {conferenceCount === 1 ? 'conferencia agendada' : 'conferencias agendadas'}
                                                                </span>
                                                            </div>
                                                            {!loc.startsWith("Auditorio Paraninfo") && !loc.startsWith("Auditorio Torres") && conferenceCount === 0 && (
                                                                <button
                                                                    className="btn-delete-sm"
                                                                    style={{ padding: '4px 8px' }}
                                                                    onClick={() => {
                                                                        const newCaps = { ...locCapacities };
                                                                        delete newCaps[loc];
                                                                        setLocCapacities(newCaps);
                                                                    }}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="form-group" style={{ margin: 0 }}>
                                                            <label style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Aforo (Personas)</label>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    value={locCapacities[loc]}
                                                                    onChange={e => {
                                                                        setLocCapacities({ ...locCapacities, [loc]: parseInt(e.target.value) || 0 });
                                                                    }}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '8px',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e2e8f0',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="add-location-box" style={{
                                            marginTop: '1.5rem',
                                            padding: '2rem',
                                            background: '#fff',
                                            borderRadius: '20px',
                                            border: '2px dashed var(--primary-color)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary-color)' }}></div>
                                            <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ✨ Registrar Nuevo Sitio / Auditorio
                                            </h4>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr auto',
                                                gap: '1.5rem',
                                                alignItems: 'end'
                                            }}>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label style={{ fontWeight: 600, color: '#4a5568', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Nombre Completo del Sitio</label>
                                                    <input
                                                        type="text"
                                                        id="new-loc-name"
                                                        placeholder="Ej: Auditorio Central, Sala 202..."
                                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label style={{ fontWeight: 600, color: '#4a5568', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Capacidad de Aforo</label>
                                                    <input
                                                        type="number"
                                                        id="new-loc-cap"
                                                        defaultValue="50"
                                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem' }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-submit"
                                                    style={{ height: '48px', padding: '0 2.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                                    onClick={() => {
                                                        const nameInput = document.getElementById('new-loc-name') as HTMLInputElement;
                                                        const capInput = document.getElementById('new-loc-cap') as HTMLInputElement;
                                                        if (nameInput.value.trim()) {
                                                            setLocCapacities({
                                                                ...locCapacities,
                                                                [nameInput.value.trim()]: parseInt(capInput.value) || 0
                                                            });
                                                            nameInput.value = "";
                                                            alert("¡Sitio añadido! Ahora aparecerá en la lista y en el formulario de conferencias.");
                                                        } else {
                                                            alert("Por favor ingresa un nombre para el sitio.");
                                                        }
                                                    }}
                                                >
                                                    Crear Sitio
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                            <button
                                                type="button"
                                                className="btn-add"
                                                style={{ background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
                                                onClick={() => {
                                                    const currentSede4Salas = Object.keys(locCapacities).filter(k => k.includes("Sede 4"));
                                                    const nextNum = currentSede4Salas.length + 1;
                                                    setLocCapacities({
                                                        ...locCapacities,
                                                        [`Auditorio Sede 4 - Sala ${nextNum}`]: 30
                                                    });
                                                }}
                                            >
                                                ⚡ Sede 4: Agregar Sala Rápido
                                            </button>
                                        </div>

                                        <button className="btn-submit" style={{ marginTop: '2rem', width: '100%' }} onClick={() => { dispatchUpdate(); alert("Configuración de aforos guardada."); }}>
                                            Guardar y Aplicar a Toda la Agenda
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {activeTab === "analytics" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view fade-in">
                            <div className="view-header">
                                <h2>📊 Dashboard de Inteligencia de Datos</h2>
                                <p>Análisis avanzado del comportamiento de usuarios y registros.</p>
                            </div>

                            <div className="analytics-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

                                {/* Gráfica de Visitas */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Vistas por Página</h4>
                                        <select
                                            value={chartTypes.views}
                                            onChange={(e) => setChartTypes({ ...chartTypes, views: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="bar">Barras</option>
                                            <option value="line">Líneas</option>
                                            <option value="pie">Circular</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.views === 'bar' ? (
                                                <BarChart data={getPageViewsStats()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#375fe4" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            ) : chartTypes.views === 'line' ? (
                                                <LineChart data={getPageViewsStats()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="value" stroke="#375fe4" strokeWidth={3} />
                                                </LineChart>
                                            ) : (
                                                <PieChart>
                                                    <Pie data={getPageViewsStats()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {[0, 1, 2, 3, 4].map((_, index) => <Cell key={`cell-${index}`} fill={['#375fe4', '#4998f1', '#1f2a44', '#e74c3c'][index % 4]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Género */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Distribución por Género</h4>
                                        <select
                                            value={chartTypes.gender}
                                            onChange={(e) => setChartTypes({ ...chartTypes, gender: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="pie">Pastel</option>
                                            <option value="bar">Barras</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.gender === 'pie' ? (
                                                <PieChart>
                                                    <Pie data={getGenderStats()} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                                                        <Cell fill="#3498db" />
                                                        <Cell fill="#e91e63" />
                                                        <Cell fill="#95a5a6" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            ) : (
                                                <BarChart data={getGenderStats()}>
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#3498db">
                                                        <Cell fill="#3498db" />
                                                        <Cell fill="#e91e63" />
                                                        <Cell fill="#95a5a6" />
                                                    </Bar>
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Conferencias */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Inscripciones por Conferencia</h4>
                                        <select
                                            value={chartTypes.conferences}
                                            onChange={(e) => setChartTypes({ ...chartTypes, conferences: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="bar">Barras</option>
                                            <option value="scatter">Dispersión</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.conferences === 'bar' ? (
                                                <BarChart data={getConferenceStats()} layout="vertical">
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={100} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#2ecc71" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            ) : (
                                                <ScatterChart>
                                                    <XAxis dataKey="name" />
                                                    <YAxis dataKey="value" name="Inscritos" />
                                                    <ZAxis range={[60, 400]} />
                                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                    <Scatter name="Conferencias" data={getConferenceStats()} fill="#2ecc71" />
                                                </ScatterChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Log de Actividad Reciente */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <h4>Historial de Actividad Global</h4>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', fontSize: '0.8rem' }}>
                                        {getEvents().map((log, i) => (
                                            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><strong style={{ color: 'var(--primary-color)' }}>{log.type}</strong> en {log.path}</span>
                                                <span style={{ color: '#888' }}>{log.timestamp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "trash" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Papelera de Reciclaje</h2>
                            </div>
                            {deletedConferences.length === 0 ? (
                                <div className="no-data">La papelera está vacía</div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deletedConferences.map(conf => (
                                            <tr key={conf.id}>
                                                <td>{conf.title}</td>
                                                <td className="actions">
                                                    <button
                                                        className="btn-edit-sm"
                                                        onClick={() => handleRestoreConference(conf.id)}
                                                    >
                                                        🔄 Restaurar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Modal de Edición de Conferencia */}
                    {editingConf && (
                        <div className="modal-overlay fade-in">
                            <div className="modal-content">
                                <h3>Editar Conferencia</h3>
                                <form onSubmit={handleSaveEdit}>
                                    <div className="form-group">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            value={editingConf.title}
                                            onChange={e => setEditingConf({ ...editingConf, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Conferencista / Invitado</label>
                                        <select
                                            className="admin-select"
                                            value={editingConf.speaker.name}
                                            onChange={e => {
                                                const selectedName = e.target.value;
                                                const selectedSpeaker = conferences.find((c: any) => c.speaker.name === selectedName)?.speaker;
                                                if (selectedSpeaker) {
                                                    setEditingConf({ ...editingConf, speaker: { ...selectedSpeaker } });
                                                }
                                            }}
                                        >
                                            {Array.from(new Set(conferences.map((c: any) => c.speaker.name)))
                                                .map(name => conferences.find((c: any) => c.speaker.name === name)?.speaker)
                                                .map((s, idx) => (
                                                    <option key={idx} value={s.name}>{s.name} ({s.organization})</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Modalidad</label>
                                        <select
                                            value={editingConf.type || 'presencial'}
                                            onChange={e => setEditingConf({ ...editingConf, type: e.target.value as any })}
                                            className="admin-select"
                                        >
                                            <option value="presencial">Presencial</option>
                                            <option value="virtual">Virtual</option>
                                        </select>
                                    </div>
                                    {editingConf.type === 'virtual' ? (
                                        <div className="form-group">
                                            <label>Enlace de la Reunión (Virtual)</label>
                                            <input
                                                type="url"
                                                value={editingConf.virtualLink || ''}
                                                onChange={e => setEditingConf({ ...editingConf, virtualLink: e.target.value })}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Ubicación</label>
                                            <select
                                                value={editingConf.location}
                                                onChange={e => setEditingConf({ ...editingConf, location: e.target.value })}
                                                required
                                                className="admin-select"
                                            >
                                                {Object.keys(locCapacities).map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Carrera Afín</label>
                                        <select
                                            value={editingConf.career}
                                            onChange={e => setEditingConf({ ...editingConf, career: e.target.value })}
                                            className="admin-select"
                                        >
                                            <option value="Administración de Empresas">Administración de Empresas</option>
                                            <option value="Arquitectura">Arquitectura</option>
                                            <option value="Derecho">Derecho</option>
                                            <option value="Economía">Economía</option>
                                            <option value="Ingeniería Civil">Ingeniería Civil</option>
                                            <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                            <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                                            <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                                            <option value="Psicología">Psicología</option>
                                            <option value="Diseño Gráfico">Diseño Gráfico</option>
                                            <option value="General">General / Todas</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            rows={4}
                                            value={editingConf.description}
                                            onChange={e => setEditingConf({ ...editingConf, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="submit" className="btn-submit">Guardar Cambios</button>
                                        <button type="button" className="btn-logout" onClick={() => setEditingConf(null)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div >
        </div >
    )
}
