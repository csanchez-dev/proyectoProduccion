import type { ReactNode } from "react"
import { Link } from "react-router-dom"

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <>
      <header>
        <img
          className="header-banner"
          src="/banner-header.png"
          alt="Banner bandera de italia"
        />

        <div className="logo-container">
          <img
            src="/ucatolica-logo.png"
            alt="Logo Universidad Catolica"
            width={160}
            height={80}
          />
          <img
            src="/logo-coniiti.png"
            alt="Logo Coniiti"
            width={200}
            height={50}
          />
        </div>

        <nav className="navbar">
          <ul className="navbar-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="#invitados">Invitados</Link></li>
            <li><Link to="/conferencias">Agenda</Link></li>
            <li><Link to="/registro">Acceso</Link></li>
            <li><Link to="/perfil">Mi Perfil</Link></li>
            <li><Link to="#acerca-de">Acerca de</Link></li>
            <li><Link to="#contacto">Contacto</Link></li>
          </ul>
        </nav>
      </header>

      <main className="main-container">
        {children}
      </main>

      <footer>© CONIITI 2026</footer>
    </>
  )
}
