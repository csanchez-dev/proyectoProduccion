import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"
import { signIn, register } from "../services/api"
import { toast } from "sonner"

export default function Register() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  useEffect(() => {
    const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
    window.addEventListener('app-lang-updated', updateLang);
    return () => window.removeEventListener('app-lang-updated', updateLang);
  }, []);

  const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.acceptTerms) {
      toast.warning("Debes aceptar la política de tratamiento de datos.");
      return
    }

    setIsLoading(true)
    try {
      const mappedRole = role === "student" ? "ESTUDIANTE" : role === "professor" ? "DOCENTE" : "INVITADO";

      try {
        await register({ ...formData, rol: mappedRole })
        const { error: authError } = await signIn(formData.email, formData.password)

        if (authError) {
          navigate("/login")
          return
        }
      } catch (backendError: any) {
        const errorMsg = backendError.message || "";
        if (errorMsg.includes("documento") || errorMsg.includes("código institucional") || errorMsg.includes("registrado")) {
          throw new Error(errorMsg);
        }

        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
        const existsCC = usuariosGuardados.some((u: any) => u.documentNumber === formData.documentNumber);
        const existsCode = mappedRole === 'ESTUDIANTE' && usuariosGuardados.some((u: any) => u.institutionalCode === formData.institutionalCode);

        if (existsCC) throw new Error("El número de documento ya se encuentra registrado (Local).");
        if (existsCode) throw new Error("El código institucional ya se encuentra registrado por otro estudiante (Local).");

        usuariosGuardados.push({ ...formData, role: mappedRole });
        localStorage.setItem('usuarios_locales', JSON.stringify(usuariosGuardados));
      }

      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        role: mappedRole,
        gender: formData.gender
      }
      localStorage.setItem("user_session", JSON.stringify(userData))
      window.dispatchEvent(new Event('user-session-updated'))

      setFormData({
        fullName: "",
        documentType: "CC",
        documentNumber: "",
        email: "",
        password: "",
        institutionalCode: "",
        career: "",
        gender: "",
        acceptTerms: false
      });
      setRole("student");
      navigate("/perfil")
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card fade-in">
        <div className="registration-header-premium">
          <div className="icon-badge">📝</div>
          <h2>{t('register_title')}</h2>
          <p>{lang === 'es' ? "Únete al CONIITI 2026 y vive la experiencia tecnológica" : "Join CONIITI 2026 and live the technological experience"}</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group">
            <label>¿Quién eres?</label>
            <div className="role-selector">
              <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>Estudiante</button>
              <button type="button" className={role === "professor" ? "active" : ""} onClick={() => setRole("professor")}>Profesor</button>
              <button type="button" className={role === "guest" ? "active" : ""} onClick={() => setRole("guest")}>Invitado</button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Nombres y Apellidos Completos</label>
            <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" required value={formData.password} onChange={handleInputChange} />
          </div>

          {role && (
            <div className="fade-in">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="documentType">Tipo de Documento</label>
                  <select id="documentType" name="documentType" value={formData.documentType} onChange={handleInputChange}>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="documentNumber">Número</label>
                  <input type="text" id="documentNumber" name="documentNumber" required value={formData.documentNumber} onChange={handleInputChange} />
                </div>
              </div>

              {role === "student" && (
                <div className="form-row fade-in">
                  <div className="form-group">
                    <label htmlFor="institutionalCode">Código</label>
                    <input type="text" id="institutionalCode" name="institutionalCode" required value={formData.institutionalCode} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="career">Carrera</label>
                    <select id="career" name="career" required value={formData.career} onChange={handleInputChange}>
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

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="gender">{t('register_gender')}</label>
            <select id="gender" name="gender" required value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option value="">{lang === 'es' ? "Selecciona tu género" : "Select your gender"}</option>
              <option value="Masculino">{t('register_gender_male')}</option>
              <option value="Femenino">{t('register_gender_female')}</option>
              <option value="Otro">{t('register_gender_other')}</option>
            </select>
          </div>

          <div className="form-group checkbox-group fade-in">
            <input type="checkbox" id="acceptTerms" name="acceptTerms" required checked={formData.acceptTerms} onChange={handleInputChange} />
            <label htmlFor="acceptTerms">
              Acepto la <a href="#politica" onClick={(e) => { e.preventDefault(); setShowPolicyModal(true); }}>política de tratamiento de datos personales</a> y términos y condiciones.
            </label>
          </div>

          <button type="submit" className="btn-submit premium-btn" disabled={isLoading}>
            {isLoading ? (lang === 'es' ? "Registrando..." : "Registering...") : t('register_submit')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{lang === 'es' ? "¿Ya tienes una cuenta?" : "Already have an account?"}{" "} <Link to="/login" className="accent-link">{lang === 'es' ? "Inicia sesión" : "Login here"}</Link></p>
        </div>
      </div>

      {showPolicyModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'left' }}>
            <h3 style={{ color: '#1f2a44', marginBottom: '1rem' }}>Política de Datos</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
              Sus datos serán usados exclusivamente para fines académicos y de gestión del CONIITI 2026 de acuerdo con la Ley 1581 de 2012.
            </p>
            <button className="btn-submit" onClick={() => setShowPolicyModal(false)} style={{ marginTop: '1.5rem' }}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  )
}
