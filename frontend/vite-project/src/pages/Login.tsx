import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"
import { signIn, apiFetch } from "../services/api"

export default function Login() {

    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
        window.addEventListener('app-lang-updated', updateLang);
        return () => window.removeEventListener('app-lang-updated', updateLang);
    }, []);

    const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Auth con Supabase
            const { data: _data, error } = await signIn(formData.email, formData.password)
            if (error) throw error

            // 2. Obtener perfil desde nuestra API para saber el rol
            const perfil = await apiFetch('/usuarios/perfil');

            const userData = {
                email: formData.email,
                role: perfil.rol || 'USER',
                fullName: perfil.nombre_completo || 'Usuario'
            }

            localStorage.setItem("user_session", JSON.stringify(userData))

            alert(`¡Bienvenido de nuevo, ${userData.fullName}!`)
            window.location.href = userData.role !== "USER" ? "/admin" : "/"
        } catch (err: any) {
            console.warn("Fallo el login con Supabase, intentando fallback local...", err.message);

            // Fallback para Super Usuarios si la DB está vacía o hay error (PRODUCCIÓN: quitar esto)
            if (formData.email === "superadmin@coniiti.com" && formData.password === "super123") {
                localStorage.setItem("user_session", JSON.stringify({ email: formData.email, role: 'SUPER_ADMIN', fullName: 'Super Admin' }))
                window.location.href = "/admin";
                return;
            }

            // Fallback para registros locales que no pudieron guardarse en Supabase (offline/rate-limit)
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
            const usuarioLocal = usuariosGuardados.find((u: any) => u.email === formData.email && u.password === formData.password);

            if (usuarioLocal) {
                const localUserData = {
                    email: usuarioLocal.email,
                    role: usuarioLocal.role || 'USER',
                    fullName: usuarioLocal.fullName || 'Usuario Local'
                };
                localStorage.setItem("user_session", JSON.stringify(localUserData));
                alert(`¡Bienvenido de nuevo (Modo Local), ${localUserData.fullName}!`);
                window.location.href = localUserData.role !== "USER" ? "/admin" : "/perfil";
                return;
            }

            alert(`Error al iniciar sesión: ${err.message || 'Credenciales inválidas y no se encontró usuario local'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card fade-in">
                <div className="login-header-premium">
                    <div className="icon-badge">🔒</div>
                    <h2>{lang === 'es' ? "Iniciar Sesión" : "Login"}</h2>
                    <p>{lang === 'es' ? "Ingresa tus credenciales para acceder al panel" : "Enter your credentials to access the panel"}</p>
                </div>

                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-group">
                        <label htmlFor="email">{lang === 'es' ? "Correo Electrónico" : "Email Address"}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="admin@coniiti.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{lang === 'es' ? "Contraseña" : "Password"}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="********"
                        />
                    </div>

                    <button type="submit" className="btn-submit premium-btn" disabled={isLoading}>
                        {isLoading ? (lang === 'es' ? "Iniciando..." : "Logging in...") : t('login_submit')}
                    </button>

                </form>

                <div className="auth-footer">
                    <p>
                        {lang === 'es' ? "¿No tienes una cuenta?" : "Don't have an account?"}{" "}
                        <Link to="/registro" className="accent-link">
                            {lang === 'es' ? "Regístrate aquí" : "Register here"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
