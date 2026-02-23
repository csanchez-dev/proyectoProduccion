import { useState } from "react"
import { conferences as initialConferences } from "../data/conference_mocks"

export default function Invitados() {
    const [conferences] = useState(() => {
        const saved = localStorage.getItem("site_conferences")
        return saved ? JSON.parse(saved) : initialConferences
    })

    // Obtener lista única de ponentes/invitados
    const guests = Array.from(new Set(conferences.map((c: any) => c.speaker.name))).map(name => {
        return conferences.find((c: any) => c.speaker.name === name)?.speaker
    })

    return (
        <div className="invitados-page">
            <div className="section-header">
                <h2>Nuestros Invitados de Honor</h2>
                <p>Conoce a los expertos nacionales e internacionales que nos acompañarán en CONIITI 2026</p>
            </div>

            <div className="guests-grid">
                {guests.map((guest: any, index: number) => (
                    <div key={index} className="guest-card fade-in">
                        <div className="guest-image-container">
                            <img src={guest.avatar || "/default-avatar.png"} alt={guest.name} />
                        </div>
                        <div className="guest-details">
                            <h3>{guest.name}</h3>
                            <p className="guest-org">{guest.organization}</p>
                            <p className="guest-bio">{guest.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
