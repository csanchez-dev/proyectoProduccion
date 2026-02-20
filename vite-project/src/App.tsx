import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Agenda from "./pages/Agenda"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Admin from "./pages/Admin"
import Invitados from "./pages/Invitados"

import Home from "./pages/Home"

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conferencias" element={<Agenda />} />
        <Route path="/invitados" element={<Invitados />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}
