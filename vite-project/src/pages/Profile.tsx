import { useState } from "react"

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState({
        fullName: "Juan Pérez",
        role: "Estudiante",
        email: "juan.perez@ucatolica.edu.co",
        documentNumber: "1020304050",
        institutionalCode: "506070",
        career: "Ingeniería de Sistemas"
    })

    // Datos simulados de conferencias inscritas
    const registeredConferences = [
        {
            id: 1,
            title: "Inteligencia Artificial en la Industria 4.0",
            date: "2026-10-25",
            time: "09:00 AM",
            location: "Auditorio Principal"
        },
        {
            id: 2,
            title: "Ciberseguridad en Entornos Empresariales",
            date: "2026-10-26",
            time: "02:00 PM",
            location: "Sala de Conferencias B"
        }
    ]

    const handleSave = () => {
        setIsEditing(false)
        alert("Datos actualizados correctamente")
    }

    return (
        <div className="profile-container fade-in">
            <div className="profile-grid">
                {/* Sección de Datos Personales */}
                <div className="profile-card user-info">
                    <div className="card-header">
                        <h3>Mis Datos Personales</h3>
                        <button
                            className="btn-edit"
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        >
                            {isEditing ? "Guardar" : "Editar Perfil"}
                        </button>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <label>Nombre Completo</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.fullName}
                                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                />
                            ) : (
                                <p>{userData.fullName}</p>
                            )}
                        </div>

                        <div className="info-item">
                            <label>Correo Electrónico</label>
                            <p>{userData.email}</p>
                        </div>

                        <div className="info-item">
                            <label>Rol</label>
                            <p>{userData.role}</p>
                        </div>

                        <div className="info-item">
                            <label>Número de Documento</label>
                            <p>{userData.documentNumber}</p>
                        </div>

                        {userData.role === "Estudiante" && (
                            <>
                                <div className="info-item">
                                    <label>Código Institucional</label>
                                    <p>{userData.institutionalCode}</p>
                                </div>
                                <div className="info-item">
                                    <label>Carrera</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.career}
                                            onChange={(e) => setUserData({ ...userData, career: e.target.value })}
                                        />
                                    ) : (
                                        <p>{userData.career}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sección de Conferencias Inscritas */}
                <div className="profile-card user-conferences">
                    <h3>Mis Conferencias Inscritas</h3>
                    <div className="conference-mini-list">
                        {registeredConferences.map(conf => (
                            <div key={conf.id} className="conference-mini-card">
                                <div className="conf-icon">📅</div>
                                <div className="conf-details">
                                    <h4>{conf.title}</h4>
                                    <p>{conf.date} | {conf.time}</p>
                                    <p className="location">📍 {conf.location}</p>
                                </div>
                                <button className="btn-cancel">Cancelar</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
