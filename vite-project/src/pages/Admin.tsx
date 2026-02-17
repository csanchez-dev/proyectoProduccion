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

    if (!userRole) return <div className="loading">Cargando panel...</div>

    return (
        <div className="admin-container fade-in">
            <div className="admin-header">
                <h1>Panel de Administración</h1>
                <p className="role-badge">{userRole === "SUPER_ADMIN" ? "Super Usuario 1: Control Total" : "Super Usuario 2: Gestor de Contenido"}</p>
            </div>

            <div className="admin-grid">
                <aside className="admin-sidebar">
                    <button
                        className={activeTab === "conferences" ? "active" : ""}
                        onClick={() => setActiveTab("conferences")}
                    >
                        📋 Gestionar Conferencias
                    </button>
                    <button
                        className={activeTab === "guests" ? "active" : ""}
                        onClick={() => setActiveTab("guests")}
                    >
                        👥 Gestionar Invitados
                    </button>
                    {userRole === "SUPER_ADMIN" && (
                        <button
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => setActiveTab("settings")}
                        >
                            ⚙️ Configuración Global
                        </button>
                    )}
                </aside>

                <main className="admin-content">
                    {activeTab === "conferences" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Listado de Conferencias</h2>
                                <button className="btn-add">+ Crear Nueva Conferencia</button>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Ponente</th>
                                        <th>Lugar</th>
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
                                                <button className="btn-edit-sm">✏️ Editar</button>
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
                                <h2>Gestión de Invitados / Ponentes</h2>
                                <button className="btn-add">+ Añadir Invitado</button>
                            </div>
                            <div className="guests-grid">
                                {conferences.map(conf => (
                                    <div key={conf.id} className="guest-admin-card">
                                        <img src={conf.speaker.avatar} alt={conf.speaker.name} />
                                        <div className="guest-info">
                                            <h4>{conf.speaker.name}</h4>
                                            <p>{conf.speaker.organization}</p>
                                        </div>
                                        <button className="btn-edit-sm">Editar Perfil</button>
                                    </div>
                                ))}
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
