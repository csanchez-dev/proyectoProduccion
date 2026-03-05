import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { updatePerfil } from "../services/api"
import { Scanner } from '@yudiel/react-qr-scanner'

export default function Profile() {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState({
        fullName: "Cargando...",
        role: "",
        email: "",
        documentNumber: "",
        institutionalCode: "",
        career: "",
        gender: ""
    })

    // Estado para las conferencias inscritas (Vacío por defecto para nuevos usuarios)
    const [conferences, setConferences] = useState<any[]>([])

    // Estado del scanner QR
    const [showScanner, setShowScanner] = useState(false)
    const [scanResult, setScanResult] = useState<string | null>(null)

    // Estados para cambio de contraseña
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            alert("Por favor completa ambos campos de contraseña.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        if (newPassword.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            // Actualizar en el simulador local para que el login funcione con la nueva pass
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
            const index = usuariosGuardados.findIndex((u: any) => u.email === userData.email);

            if (index !== -1) {
                usuariosGuardados[index].password = newPassword;
                localStorage.setItem('usuarios_locales', JSON.stringify(usuariosGuardados));

                // Limpiar campos
                setNewPassword("");
                setConfirmPassword("");
                alert("✅ Contraseña actualizada correctamente.");
            } else {
                alert("No se encontró el registro del usuario para actualizar la contraseña.");
            }
        } catch (err) {
            console.error("Error al cambiar contraseña:", err);
            alert("Hubo un error al intentar cambiar la contraseña.");
        }
    }

    const loadUserConferences = () => {
        const sessionData = localStorage.getItem("user_session");
        if (sessionData) {
            const parsedSession = JSON.parse(sessionData);
            const userRegs = JSON.parse(localStorage.getItem(`registrations_${parsedSession.email}`) || '[]');
            setConferences(userRegs);
        }
    };

    useEffect(() => {
        // Leer sesión activa
        const sessionData = localStorage.getItem("user_session");
        if (sessionData) {
            const parsedSession = JSON.parse(sessionData);

            // Buscar si hay datos más completos en el simulador local (usuarios_locales)
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
            const usuarioCompleto = usuariosGuardados.find((u: any) => u.email === parsedSession.email) || {};

            // Mezclar datos
            setUserData({
                fullName: parsedSession.fullName || usuarioCompleto.fullName || "Usuario",
                role: parsedSession.role || usuarioCompleto.role || "ESTUDIANTE",
                email: parsedSession.email || "",
                documentNumber: usuarioCompleto.documentNumber || "No registrado",
                institutionalCode: usuarioCompleto.institutionalCode || "No registrado",
                career: usuarioCompleto.career || "No registrada",
                gender: parsedSession.gender || usuarioCompleto.gender || "No especificado"
            });

            loadUserConferences();
        } else {
            navigate("/login")
        }

        // Sincronizar cambios en tiempo real (por si se inscribe en otra pestaña)
        window.addEventListener('storage', loadUserConferences);
        window.addEventListener('site-config-updated', loadUserConferences);
        return () => {
            window.removeEventListener('storage', loadUserConferences);
            window.removeEventListener('site-config-updated', loadUserConferences);
        };
    }, [])

    const handleSave = async () => {
        try {
            // 1. Guardar primero en el estado local de todo el navegador
            const sessionData = JSON.parse(localStorage.getItem("user_session") || "{}");
            const updatedSession = { ...sessionData, fullName: userData.fullName, career: userData.career };
            localStorage.setItem("user_session", JSON.stringify(updatedSession));

            // 2. Guardar en el simulador 'offline' para cuando cambie de página o desloguee
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
            const index = usuariosGuardados.findIndex((u: any) => u.email === userData.email);
            if (index !== -1) {
                usuariosGuardados[index].fullName = userData.fullName;
                usuariosGuardados[index].career = userData.career;
                localStorage.setItem('usuarios_locales', JSON.stringify(usuariosGuardados));
            }

            // 3. Intentar guardar en backend real
            await updatePerfil({
                nombre_completo: userData.fullName,
                carrera: userData.career
            });

            setIsEditing(false)
            alert("✅ Datos actualizados correctamente en servidor y localmente.")
        } catch (err: any) {
            console.warn("No se pudo conectar al servidor para actualizar:", err);
            setIsEditing(false)
            alert("✅ (Modo Offline) Datos actualizados y guardados localmente.");
        }
    }

    const handleCancel = (id: number) => {
        if (confirm("¿Estás seguro de que deseas cancelar tu inscripción a esta conferencia?")) {
            const updatedConfs = conferences.filter(conf => conf.id !== id);
            setConferences(updatedConfs);

            // Actualizar localStorage
            const sessionData = localStorage.getItem("user_session");
            if (sessionData) {
                const currentUser = JSON.parse(sessionData);
                localStorage.setItem(`registrations_${currentUser.email}`, JSON.stringify(updatedConfs));

                // Opcional: devolver cupo a las estadísticas globales
                const stats = JSON.parse(localStorage.getItem('conf_stats') || '[]');
                const confToCancel = conferences.find(c => c.id === id);
                if (confToCancel) {
                    const confIndex = stats.findIndex((s: any) => s.name === confToCancel.title);
                    if (confIndex >= 0 && stats[confIndex].value > 0) {
                        stats[confIndex].value -= 1;
                        localStorage.setItem('conf_stats', JSON.stringify(stats));
                    }
                }
            }
            alert("❌ Inscripción cancelada.");
        }
    }

    const handleScan = (result: any) => {
        if (result && result[0]) {
            const scannedText = result[0].rawValue;
            console.log("Scanned:", scannedText);

            if (scannedText.startsWith("CONF_ATTENDANCE_")) {
                const confId = scannedText.split("CONF_ATTENDANCE_")[1];
                setShowScanner(false);

                // Actualizar estado y localStorage
                const updatedConfs = conferences.map(c =>
                    String(c.id) === confId ? { ...c, attended: true } : c
                );
                setConferences(updatedConfs);

                const sessionData = localStorage.getItem("user_session");
                if (sessionData) {
                    const currentUser = JSON.parse(sessionData);
                    localStorage.setItem(`registrations_${currentUser.email}`, JSON.stringify(updatedConfs));
                }

                setScanResult(`¡Asistencia registrada con éxito! Ya puedes ver tu certificado en el historial.`);
                setTimeout(() => setScanResult(null), 4000);
            } else {
                setScanResult("Código QR no válido para asistencia.");
                setShowScanner(false);
                setTimeout(() => setScanResult(null), 4000);
            }
        }
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

                        {(userData.role !== "INVITADO" && userData.role !== "SUPER_ADMIN") && (
                            <div className="info-item">
                                <label>Número de Documento</label>
                                <p>{userData.documentNumber}</p>
                            </div>
                        )}

                        {userData.role === "ESTUDIANTE" && (
                            <>
                                <div className="info-item">
                                    <label>Código Institucional</label>
                                    <p>{userData.institutionalCode}</p>
                                </div>
                                <div className="info-item">
                                    <label>Carrera</label>
                                    {isEditing ? (
                                        <select
                                            value={userData.career}
                                            onChange={(e) => setUserData({ ...userData, career: e.target.value })}
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
                                        </select>
                                    ) : (
                                        <p>{userData.career}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sección: Cambio de Contraseña */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1.2px solid #e5e7eb' }}>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🔒 Seguridad - Cambiar Contraseña</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Dejar vacío para no cambiar"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="info-item">
                                <label>Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Repite la nueva contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>
                        {newPassword && (
                            <button
                                className="btn-save"
                                style={{ marginTop: '1.5rem', width: 'auto', padding: '10px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={handleChangePassword}
                            >
                                Actualizar Contraseña
                            </button>
                        )}
                    </div>
                </div>

                {/* Sección de Conferencias Inscritas */}
                <div className="profile-card user-conferences">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Mis Conferencias Inscritas</h3>
                        <button
                            className="btn-submit premium-btn"
                            style={{ padding: '8px 16px', margin: 0, width: 'auto' }}
                            onClick={() => {
                                setShowScanner(true);
                                setScanResult(null);
                            }}
                        >
                            📷 Escanear QR Asistencia
                        </button>
                    </div>

                    {scanResult && (
                        <div style={{ padding: '10px', background: scanResult.includes("éxito") || scanResult.includes("registrada") ? '#e8f5e9' : '#ffebee', color: scanResult.includes("éxito") || scanResult.includes("registrada") ? '#2e7d32' : '#c62828', borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${scanResult.includes("éxito") || scanResult.includes("registrada") ? '#a5d6a7' : '#ef9a9a'}` }}>
                            {scanResult}
                        </div>
                    )}

                    <div className="conference-mini-list">
                        {conferences.filter(c => !c.attended).length > 0 ? (
                            conferences.filter(c => !c.attended).map(conf => (
                                <div key={conf.id} className="conference-mini-card">
                                    <div className="conf-icon">📅</div>
                                    <div className="conf-details">
                                        <h4>{conf.title}</h4>
                                        <p>{conf.dayId ? conf.dayId.replace('day', 'Día ') : (conf.date || 'Día 1')} | {conf.startTime || conf.time} {conf.endTime ? `- ${conf.endTime}` : ''}</p>
                                        <p className="location">📍 {conf.type === 'virtual' ? 'Plataforma Virtual' : conf.location}</p>
                                        {conf.type === 'virtual' && conf.virtualLink && (
                                            <a
                                                href={conf.virtualLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#0052cc', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}
                                            >
                                                🔗 Unirse a la Reunión
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        className="btn-cancel"
                                        onClick={() => handleCancel(conf.id)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No tienes conferencias pendientes.</p>
                        )}
                    </div>
                </div>

                {/* HISTORIAL DE ASISTENCIAS */}
                <div className="profile-card user-conferences">
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#27ae60' }}>🎓 Certificados de Asistencia (Historial)</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>Registros de las conferencias a las que ya asististe exitosamente.</p>
                    </div>

                    <div className="conference-mini-list">
                        {conferences.filter(c => c.attended).length > 0 ? (
                            conferences.filter(c => c.attended).map(conf => (
                                <div key={conf.id} className="conference-mini-card" style={{ borderLeft: '4px solid #27ae60', background: '#f8fff9' }}>
                                    <div className="conf-icon">✅</div>
                                    <div className="conf-details" style={{ width: '100%' }}>
                                        <h4 style={{ color: '#27ae60' }}>{conf.title}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                            <p><strong>Fecha/Hora:</strong> {conf.dayId ? conf.dayId.replace('day', 'Día ') : (conf.date || 'Día 1')} | {conf.startTime || conf.time} {conf.endTime ? `- ${conf.endTime}` : ''}</p>
                                            <p><strong>Lugar:</strong> {conf.location}</p>
                                            <p><strong>Estado:</strong> Confirmada presencialmente por Escáner QR</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                        <span style={{ background: '#27ae60', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>COMPLETADO</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">Todavía no has asistido a ninguna conferencia.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Scanner QR */}
            {showScanner && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div className="modal-content fade-in" style={{ background: '#000', padding: '1rem', borderRadius: '12px', width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Enfoca el código QR</h3>

                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <Scanner onScan={handleScan} />
                        </div>

                        <button
                            className="btn-cancel"
                            style={{ width: '100%', marginTop: '1rem', background: '#e74c3c', color: 'white' }}
                            onClick={() => setShowScanner(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
