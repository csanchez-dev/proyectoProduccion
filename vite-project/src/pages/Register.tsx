import { useState } from "react"

export default function Register() {
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
      alert("¡Inicio de sesión exitoso!")
    } else {
      if (!formData.acceptTerms) {
        alert("Debes aceptar la política de tratamiento de datos para continuar.")
        return
      }
      console.log("Registrando usuario:", { role, ...formData })
      alert("¡Cuenta creada exitosamente!")
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
            Iniciar Sesión
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Crear Cuenta
          </button>
        </div>

        <h2>{isLogin ? "Bienvenido de nuevo" : "Crea tu Cuenta"}</h2>
        <p>{isLogin ? "Ingresa tus credenciales para acceder" : "Completa tus datos para registrarte en el CONIITI 2026"}</p>

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
              {isLogin ? "Entrar" : "Registrarse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
