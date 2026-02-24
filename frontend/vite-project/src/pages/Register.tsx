import { useState, useEffect } from "react"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"

export default function Register() {
  const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

  useEffect(() => {
    const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
    window.addEventListener('app-lang-updated', updateLang);
    return () => window.removeEventListener('app-lang-updated', updateLang);
  }, []);

  const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

  const [isLogin, setIsLogin] = useState(false)
  const [role, setRole] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    documentType: "CC",
    documentNumber: "",
    email: "",
    password: "",
    institutionalCode: "",
    career: "",
    gender: "",
    acceptTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      console.log("Iniciando sesión con:", formData.email)

      // Lógica de Super Usuarios
      let role = "USER"
      let name = "Usuario"

      if (formData.email === "superadmin@coniiti.com" && formData.password === "super123") {
        role = "SUPER_ADMIN"
        name = "Super Admin"
      } else if (formData.email === "admin@coniiti.com" && formData.password === "admin12") {
        role = "CONTENT_MANAGER"
        name = "Gestor"
      }

      localStorage.setItem("user_session", JSON.stringify({
        email: formData.email,
        role: role,
        fullName: name
      }))

      alert(`¡Bienvenido de nuevo, ${name}!`)
      window.location.href = role !== "USER" ? "/admin" : "/"
    } else {
      if (!formData.acceptTerms) {
        alert("Debes aceptar la política de tratamiento de datos para continuar.")
        return
      }
      console.log("Registrando usuario:", { role, ...formData })
      localStorage.setItem("user_session", JSON.stringify({ email: formData.email, fullName: formData.fullName, gender: formData.gender }))

      // Actualizar estadísticas de género para el dashboard
      if (formData.gender) {
        const stats = JSON.parse(localStorage.getItem('gender_stats') || JSON.stringify([
          { name: 'Masculino', value: 45 },
          { name: 'Femenino', value: 38 },
          { name: 'Otro', value: 12 }
        ]));
        const genderIndex = stats.findIndex((s: any) => s.name === formData.gender);
        if (genderIndex >= 0) {
          stats[genderIndex].value += 1;
        }
        localStorage.setItem('gender_stats', JSON.stringify(stats));
      }

      alert("¡Cuenta creada exitosamente!")
      window.location.href = "/perfil" // Redirigir y recargar
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="tab-header">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            {t('register_login_tab')}
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            {t('register_create_tab')}
          </button>
        </div>

        <h2>{isLogin ? (lang === 'es' ? "Bienvenido de nuevo" : "Welcome back") : t('register_title')}</h2>
        <p>{isLogin
          ? (lang === 'es' ? "Ingresa tus credenciales para acceder" : "Enter your credentials to access")
          : (lang === 'es' ? "Completa tus datos para registrarte en el CONIITI 2026" : "Complete your details to register for CONIITI 2026")
        }</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group fade-in">
              <label>¿Quién eres?</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={role === "student" ? "active" : ""}
                  onClick={() => setRole("student")}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  className={role === "professor" ? "active" : ""}
                  onClick={() => setRole("professor")}
                >
                  Profesor
                </button>
                <button
                  type="button"
                  className={role === "guest" ? "active" : ""}
                  onClick={() => setRole("guest")}
                >
                  Invitado
                </button>
              </div>
            </div>
          )}

          <div className="fade-in">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
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

            {!isLogin && role && (
              <div className="fade-in">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="documentType">Tipo de Documento</label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="documentNumber">Número</label>
                    <input
                      type="text"
                      id="documentNumber"
                      name="documentNumber"
                      required
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {role === "student" && (
                  <div className="form-row fade-in">
                    <div className="form-group">
                      <label htmlFor="institutionalCode">Código</label>
                      <input
                        type="text"
                        id="institutionalCode"
                        name="institutionalCode"
                        required
                        value={formData.institutionalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="career">Carrera</label>
                      <select
                        id="career"
                        name="career"
                        required
                        value={formData.career}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecciona tu carrera</option>
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
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isLogin && (
              <div className="form-group fade-in" style={{ marginTop: '1rem' }}>
                <label htmlFor="gender">{t('register_gender')}</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="">{lang === 'es' ? "Selecciona tu género" : "Select your gender"}</option>
                  <option value="Masculino">{t('register_gender_male')}</option>
                  <option value="Femenino">{t('register_gender_female')}</option>
                  <option value="Otro">{t('register_gender_other')}</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div className="form-group checkbox-group fade-in">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                />
                <label htmlFor="acceptTerms">
                  Acepto la <a href="#politica" onClick={(e) => { e.preventDefault(); alert("Política de Tratamiento de Datos: Sus datos serán usados exclusivamente para fines académicos y de gestión del CONIITI 2026 de acuerdo con la Ley 1581 de 2012.") }}>política de tratamiento de datos personales</a> y términos y condiciones.
                </label>
              </div>
            )}

            <button type="submit" className="btn-submit">
              {isLogin ? t('login_submit') : t('register_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
