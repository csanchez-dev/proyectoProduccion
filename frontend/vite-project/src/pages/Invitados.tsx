import { useState, useEffect } from "react";
import { conferences as initialConferences } from "../data/conference_mocks";
import { getPonencias } from "../services/api";

export default function Invitados() {
    const [conferences, setConferences] = useState<any[]>([]);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const data = await getPonencias();
                if (data && data.length > 0) {
                    console.info('[Invitados] Datos desde API:', data.length);
                    setConferences(data);
                } else {
                    const saved = localStorage.getItem("site_conferences");
                    const parsed = saved ? JSON.parse(saved) : null;
                    setConferences((parsed && parsed.length > 0) ? parsed : initialConferences);
                }
            } catch (_err) {
                const saved = localStorage.getItem("site_conferences");
                const parsed = saved ? JSON.parse(saved) : null;
                setConferences((parsed && parsed.length > 0) ? parsed : initialConferences);
            }
        };
        fetchGuests();
    }, []);

    const [config, setConfig] = useState({
        title: localStorage.getItem("guests_title") || "Nuestros Invitados de Honor",
        subtitle: localStorage.getItem("guests_subtitle") || "Conoce a los expertos nacionales e internacionales que nos acompañarán en CONIITI 2026"
    });

    const refreshConfig = () => {
        setConfig({
            title: localStorage.getItem("guests_title") || "Nuestros Invitados de Honor",
            subtitle: localStorage.getItem("guests_subtitle") || "Conoce a los expertos nacionales e internacionales que nos acompañarán en CONIITI 2026"
        });
    };

    useEffect(() => {
        window.addEventListener('site-config-updated', refreshConfig);
        return () => window.removeEventListener('site-config-updated', refreshConfig);
    }, []);

    // Obtener lista única de ponentes/invitados
    const guests = Array.from(new Set(conferences.map((c: any) => c.speaker?.name || c.speaker?.nombre))).filter(Boolean).map(name => {
        return conferences.find((c: any) => (c.speaker?.name || c.speaker?.nombre) === name)?.speaker;
    });

    return (
        <div className="invitados-page">
            <div className="section-header">
                <h2>{config.title}</h2>
                <p>{config.subtitle}</p>
            </div>

            <div className="guests-grid">
                {guests.map((guest: any, index: number) => {
                    const guestName = guest?.name || guest?.nombre || "Invitado Especial";
                    const guestOrg = guest?.organization || guest?.organizacion || "Independiente";
                    const guestAvatar = guest?.avatar || guest?.avatar_url || "/default-avatar.png";
                    const guestBio = guest?.bio || "";

                    return (
                        <div key={index} className="guest-card fade-in">
                            <div className="guest-image-container">
                                <img src={guestAvatar} alt={guestName} />
                            </div>
                            <div className="guest-details">
                                <h3>{guestName}</h3>
                                <p className="guest-org">{guestOrg}</p>
                                <p className="guest-bio">{guestBio}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
