import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Agenda from "./pages/Agenda"
import Register from "./pages/Register"
import Profile from "./pages/Profile"

function Home() {
  return <h1>Inicio</h1>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conferencias" element={<Agenda />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </Layout>
  )
}
