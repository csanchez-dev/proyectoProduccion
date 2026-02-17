import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Agenda from "./pages/Agenda"

function Home() {
  return <h1>Inicio</h1>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conferencias" element={<Agenda />} />
      </Routes>
        
      <Agenda />
    </Layout>
  )
}
