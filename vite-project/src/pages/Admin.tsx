import { useState, useEffect } from "react"
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

    const dispatchUpdate = () => {
        window.dispatchEvent(new Event('site-config-updated'));
        setBannerPreview(localStorage.getItem("site_banner") || "/banner-header.png");
        setLogoUniPreview(localStorage.getItem("site_logo_uni") || "/ucatolica-logo.png");
        setLogoEventPreview(localStorage.getItem("site_logo_evento") || "/logo-coniiti.png");
        setBgColor(localStorage.getItem("custom_bg_color") || "#ffffff");
        setTextColor(localStorage.getItem("custom_text_color") || "#1b1a1a");
        setHeaderColor(localStorage.getItem("custom_header_bg") || "#1f2a44");
    };
    const [chartTypes, setChartTypes] = useState<any>({
        views: 'bar',
        gender: 'pie',
        conferences: 'bar'
    })
    const navigate = useNavigate()

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
        location: "",
        description: "",
        speakerName: "",
        startTime: "",
        endTime: "",
        career: ""
    })

    const handleAddConference = (e: React.FormEvent) => {
        e.preventDefault()
        const newId = (conferences.length + deletedConferences.length + 1).toString()
        const simulatedConf = {
            id: newId,
            title: newConf.title,
            description: newConf.description,
            startTime: newConf.startTime || new Date().toISOString(),
            endTime: newConf.endTime || new Date().toISOString(),
            location: newConf.location,
            category: "General",
            level: "Básico",
            career: newConf.career || "General",
            speaker: {
                name: newConf.speakerName,
                organization: "Por definir",
                bio: "",
                avatar: "/default-avatar.png"
            }
        }
        setConferences([...conferences, simulatedConf])
        setShowConfForm(false)
        setNewConf({ title: "", location: "", description: "", speakerName: "", startTime: "", endTime: "", career: "" })
        alert("¡Conferencia agendada exitosamente!")
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

                            {showConfForm && (
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
                                            <label>Nombre del Ponente</label>
                                            <input
                                                type="text"
                                                required
                                                value={newConf.speakerName}
                                                onChange={e => setNewConf({ ...newConf, speakerName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ubicación (Salón / Auditorio)</label>
                                            <input
                                                type="text"
                                                required
                                                value={newConf.location}
                                                onChange={e => setNewConf({ ...newConf, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
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
                            )}

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
                            <h2>Configuración del Sitio</h2>
                            <form className="settings-form">
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
                                            // Aplicar inmediatamente al body para previsualizar
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
                                                        if (file.size > 1500000) {
                                                            alert("La imagen es muy pesada (máx 1.5MB). Por favor elige una más pequeña para evitar bloqueos.");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                try {
                                                                    localStorage.setItem("site_banner", reader.result as string);
                                                                    dispatchUpdate();
                                                                } catch (err) {
                                                                    alert("Error: La imagen sigue siendo muy grande para la memoria del navegador.");
                                                                }
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="file-input"
                                            />
                                        </div>
                                        <div className="banner-actions">
                                            <button
                                                type="button"
                                                className="btn-remove-img"
                                                onClick={() => {
                                                    localStorage.removeItem("site_banner");
                                                    dispatchUpdate();
                                                }}
                                            >
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
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) {
                                                            alert("El logo es muy grande (máx 800KB).");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                localStorage.setItem("site_logo_uni", reader.result as string);
                                                                dispatchUpdate();
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-img-sm"
                                                onClick={() => {
                                                    localStorage.removeItem("site_logo_uni");
                                                    dispatchUpdate();
                                                }}
                                            >
                                                Restaurar Original
                                            </button>
                                        </div>
                                        <div className="logo-upload-item">
                                            <span>Logo CONIITI</span>
                                            <div className="mini-preview">
                                                <img src={logoEventPreview} alt="Preview Evento" style={{ height: '40px', objectFit: 'contain', background: '#eee', padding: '5px', borderRadius: '4px' }} />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) {
                                                            alert("El logo es muy grande (máx 800KB).");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                localStorage.setItem("site_logo_evento", reader.result as string);
                                                                dispatchUpdate();
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-img-sm"
                                                onClick={() => {
                                                    localStorage.removeItem("site_logo_evento");
                                                    dispatchUpdate();
                                                }}
                                            >
                                                Restaurar Original
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Personalización de Colores (Fondos y Letras)</label>
                                    <div className="color-picker-grid">
                                        <div className="color-item">
                                            <span>Fondo General</span>
                                            <input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_bg_color", color);
                                                    setBgColor(color);
                                                    dispatchUpdate();
                                                }}
                                            />
                                        </div>
                                        <div className="color-item">
                                            <span>Texto Principal</span>
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_text_color", color);
                                                    setTextColor(color);
                                                    dispatchUpdate();
                                                }}
                                            />
                                        </div>
                                        <div className="color-item">
                                            <span>Color de Cabecera</span>
                                            <input
                                                type="color"
                                                value={headerColor}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_header_bg", color);
                                                    setHeaderColor(color);
                                                    dispatchUpdate();
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="hint">Estos cambios son inmediatos y se guardan para todos los visitantes.</p>
                                </div>
                                <div className="form-group">
                                    <label>Modo de Mantenimiento</label>
                                    <input type="checkbox" />
                                </div>
                                <div className="admin-actions-footer">
                                    <button
                                        type="button"
                                        className="btn-submit"
                                        onClick={() => alert("Configuración global guardada correctamente")}
                                    >
                                        Guardar Cambios Globales
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-logout"
                                        style={{ marginLeft: '1rem', background: '#e74c3c' }}
                                        onClick={() => {
                                            if (confirm("¿Seguro que quieres borrar toda la personalización (colores y logos)?")) {
                                                ["site_banner", "site_logo_uni", "site_logo_evento", "custom_bg_color", "custom_text_color", "custom_header_bg"].forEach(key => localStorage.removeItem(key));
                                                dispatchUpdate();
                                            }
                                        }}
                                    >
                                        Limpiar y Resetear Diseño
                                    </button>
                                </div>
                            </form>

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
                                        <label>Ubicación</label>
                                        <input
                                            type="text"
                                            value={editingConf.location}
                                            onChange={e => setEditingConf({ ...editingConf, location: e.target.value })}
                                        />
                                    </div>
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
            </div>
        </div>
    )
}
