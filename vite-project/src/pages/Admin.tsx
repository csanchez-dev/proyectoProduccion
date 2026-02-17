import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { conferences as initialConferences } from "../data/conference_mocks"

export default function Admin() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const [conferences, setConferences] = useState(initialConferences)
    const [activeTab, setActiveTab] = useState("conferences")
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

    const handleDeleteConference = (id: string) => {
        if (confirm("¿Estás seguro de eliminar esta conferencia?")) {
            setConferences(conferences.filter(c => c.id !== id))
        }
    }

    const [showGuestForm, setShowGuestForm] = useState(false)
    const [newGuest, setNewGuest] = useState({
        name: "",
        organization: "",
        bio: "",
        avatar: ""
    })

    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault()
        // En una app real, esto sería un POST a una API
        // Aquí simulamos añadiendo un nuevo objeto a la estructura
        const newId = (conferences.length + 1).toString()
        const simulatedConf = {
            id: newId,
            title: `Conferencia de ${newGuest.name}`,
            description: newGuest.bio,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            location: "TBD",
            category: "General",
            level: "Básico",
            speaker: { ...newGuest }
        }
        setConferences([...conferences, simulatedConf])
        setShowGuestForm(false)
        setNewGuest({ name: "", organization: "", bio: "", avatar: "" })
        alert("¡Nuevo invitado añadido exitosamente!")
    }

    if (!userRole) return <div className="loading">Cargando panel...</div>

    return (
        <div className="admin-container fade-in">
            <div className="admin-header">
                <h1>Panel de Gestión Superior</h1>
                <p className="role-badge">{userRole === "SUPER_ADMIN" ? "Super Usuario 1: Acceso Total" : "Super Usuario 2: Gestión de Contenido"}</p>
            </div>

            <div className="admin-grid">
                <aside className="admin-sidebar">
                    <button
                        className={activeTab === "conferences" ? "active" : ""}
                        onClick={() => setActiveTab("conferences")}
                    >
                        📋 Agenda de Conferencias
                    </button>
                    <button
                        className={activeTab === "guests" ? "active" : ""}
                        onClick={() => setActiveTab("guests")}
                    >
                        👥 Listado de Invitados
                    </button>
                    {userRole === "SUPER_ADMIN" && (
                        <button
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => setActiveTab("settings")}
                        >
                            ⚙️ Configuración de Página
                        </button>
                    )}
                </aside>

                <main className="admin-content">
                    {activeTab === "conferences" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Control de Conferencias</h2>
                                <button className="btn-add">+ Añadir Nueva</button>
                            </div>
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
                                    {conferences.map(conf => (
                                        <tr key={conf.id}>
                                            <td>{conf.title}</td>
                                            <td>{conf.speaker.name}</td>
                                            <td>{conf.location}</td>
                                            <td className="actions">
                                                <button className="btn-edit-sm">✏️</button>
                                                <button className="btn-delete-sm" onClick={() => handleDeleteConference(conf.id)}>🗑️</button>
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
                                        <label>URL de la Foto</label>
                                        <input
                                            type="text"
                                            placeholder="https://... (deja vacío para avatar por defecto)"
                                            value={newGuest.avatar}
                                            onChange={(e) => setNewGuest({ ...newGuest, avatar: e.target.value || "/default-avatar.png" })}
                                        />
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
                                {Array.from(new Set(conferences.map(c => c.speaker.name))).map(speakerName => {
                                    const speaker = conferences.find(c => c.speaker.name === speakerName)?.speaker;
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
                                        <input
                                            type="text"
                                            placeholder="URL de la imagen (ej: https://...)"
                                            defaultValue={localStorage.getItem("site_banner") || "/banner-header.png"}
                                            id="bannerInput"
                                        />
                                        <div className="banner-actions">
                                            <button
                                                type="button"
                                                className="btn-update-img"
                                                onClick={() => {
                                                    const val = (document.getElementById('bannerInput') as HTMLInputElement).value;
                                                    localStorage.setItem("site_banner", val);
                                                    alert("Banner actualizado. Recarga la página para ver los cambios.");
                                                }}
                                            >
                                                Actualizar Foto
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-remove-img"
                                                onClick={() => {
                                                    localStorage.setItem("site_banner", "");
                                                    (document.getElementById('bannerInput') as HTMLInputElement).value = "";
                                                    alert("Banner eliminado.");
                                                }}
                                            >
                                                Quitar Foto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Modo de Mantenimiento</label>
                                    <input type="checkbox" />
                                </div>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    onClick={() => alert("Configuración global guardada correctamente")}
                                >
                                    Guardar Cambios Globales
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
