import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { conferences as initialConferences } from "../data/conference_mocks"

export default function Admin() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const [conferences, setConferences] = useState(() => {
        const saved = localStorage.getItem("site_conferences")
        return saved ? JSON.parse(saved) : initialConferences
    })
    const [deletedConferences, setDeletedConferences] = useState<any[]>(() => {
        const saved = localStorage.getItem("site_deleted_conferences")
        return saved ? JSON.parse(saved) : []
    })
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
            const confToDelete = conferences.find((c: any) => c.id === id)
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

    const handleEditConference = (conf: any) => {
        setEditingConf({ ...conf })
    }

    const [showConfForm, setShowConfForm] = useState(false)
    const [newConf, setNewConf] = useState({
        title: "",
        location: "",
        description: "",
        speakerName: "",
        startTime: "",
        endTime: ""
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
            speaker: {
                name: newConf.speakerName,
                organization: "Por definir",
                bio: "",
                avatar: "/default-avatar.png"
            }
        }
        setConferences([...conferences, simulatedConf])
        setShowConfForm(false)
        setNewConf({ title: "", location: "", description: "", speakerName: "", startTime: "", endTime: "" })
        alert("¡Conferencia agendada exitosamente!")
    }

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault()
        setConferences(conferences.map(c => c.id === editingConf.id ? editingConf : c))
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
                    <button
                        className={activeTab === "trash" ? "active" : ""}
                        onClick={() => setActiveTab("trash")}
                    >
                        🗑️ Papelera
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
                                    {conferences.map(conf => (
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
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                localStorage.setItem("site_banner", reader.result as string);
                                                                alert("¡Banner cargado con éxito! Recarga para ver el cambio.");
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
                                                    alert("Banner restaurado al original.");
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
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                localStorage.setItem("site_logo_uni", reader.result as string);
                                                                alert("Logo de Universidad cargado correctamente.");
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
                                                    alert("Logo de Universidad restaurado.");
                                                }}
                                            >
                                                Restaurar Original
                                            </button>
                                        </div>
                                        <div className="logo-upload-item">
                                            <span>Logo CONIITI</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) {
                                                                localStorage.setItem("site_logo_evento", reader.result as string);
                                                                alert("Logo del Evento cargado correctamente.");
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
                                                    alert("Logo del Evento restaurado.");
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
                                                defaultValue={localStorage.getItem("custom_bg_color") || "#ffffff"}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_bg_color", color);
                                                    document.documentElement.style.setProperty('--site-bg', color);
                                                }}
                                            />
                                        </div>
                                        <div className="color-item">
                                            <span>Texto Principal</span>
                                            <input
                                                type="color"
                                                defaultValue={localStorage.getItem("custom_text_color") || "#1b1a1a"}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_text_color", color);
                                                    document.documentElement.style.setProperty('--site-text', color);
                                                }}
                                            />
                                        </div>
                                        <div className="color-item">
                                            <span>Color de Cabecera</span>
                                            <input
                                                type="color"
                                                defaultValue={localStorage.getItem("custom_header_bg") || "#1f2a44"}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    localStorage.setItem("custom_header_bg", color);
                                                    document.documentElement.style.setProperty('--header-bg', color);
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
