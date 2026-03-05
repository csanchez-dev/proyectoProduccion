import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/api"
import { updatePassword } from "../services/api"

export default function ResetPassword() {
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [isSessionActive, setIsSessionActive] = useState(false)

    useEffect(() => {
        // Verificar si existe una sesion de recuperación
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                setIsSessionActive(true)
            } else {
                // Supabase a veces tarda un momento en registrar la sesión desde el hash de la URL
                const { data: authListener } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        if (event === "PASSWORD_RECOVERY" || session) {
                            setIsSessionActive(true)
                        }
                    }
                )
                return () => {
                    authListener.subscription.unsubscribe()
                }
            }
        }
        checkSession()
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")

        if (password !== confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden.")
            return
        }

        if (password.length < 6) {
            setErrorMsg("La contraseña debe tener al menos 6 caracteres.")
            return
        }

        setIsLoading(true)

        try {
            const { error } = await updatePassword(password)

            if (error) {
                throw error
            }

            // Una vez actualizada, el usuario ya tiene sesión activa o lo enviamos a login
            alert("¡Contraseña actualizada con éxito! Serás redirigido para iniciar sesión de nuevo.")

            // Cerrar la sesión actual (de recuperación) e ir a login
            await supabase.auth.signOut()
            navigate("/login")
        } catch (err: any) {
            console.error("Error al actualizar la contraseña:", err)
            setErrorMsg(err.message || "No se pudo actualizar la contraseña. Revisa que el enlace siga siendo válido.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isSessionActive) {
        return (
            <div className="register-container">
                <div className="register-card fade-in" style={{ padding: "4rem 2rem" }}>
                    <h2>Enlace Inválido o Expirado</h2>
                    <p style={{ marginTop: "1rem", color: "#666" }}>
                        Estamos esperando que el enlace seguro cargue, o tal vez ya ha expirado. Por favor, solicita un nuevo enlace de restablecimiento desde la página de inicio de sesión.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="btn-submit premium-btn"
                        style={{ marginTop: "2rem" }}
                    >
                        Volver al Inicio de Sesión
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="register-container">
            <div className="register-card fade-in">
                <div className="login-header-premium">
                    <div className="icon-badge">🔑</div>
                    <h2>Nueva Contraseña</h2>
                    <p>Ingresa y confirma tu nueva contraseña</p>
                </div>

                <form onSubmit={handleReset} className="premium-form">
                    <div className="form-group">
                        <label htmlFor="password">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                        />
                    </div>

                    {errorMsg && (
                        <div style={{ color: "#e74c3c", marginBottom: "1rem", fontSize: "0.9rem", marginTop: "-0.5rem", textAlign: "left" }}>
                            {errorMsg}
                        </div>
                    )}

                    <button type="submit" className="btn-submit premium-btn" disabled={isLoading}>
                        {isLoading ? "Actualizando..." : "Restablecer Contraseña"}
                    </button>
                </form>
            </div>
        </div>
    )
}
