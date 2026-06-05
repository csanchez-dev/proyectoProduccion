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

    // Obtener lista única de ponentes/invitados con su respectivo año
    const allGuests = Array.from(new Set(conferences.map((c: any) => c.speaker?.name || c.speaker?.nombre))).filter(Boolean).map(name => {
        const conf = conferences.find((c: any) => (c.speaker?.name || c.speaker?.nombre) === name);
        return {
            ...conf?.speaker,
            year: conf?.year || 2026
        };
    });

    const [selectedYear, setSelectedYear] = useState<string>("all");

    const filteredGuests = allGuests.filter((guest: any) => {
        if (selectedYear === "all") return true;
        return guest.year.toString() === selectedYear;
    });

    const selectStyle: React.CSSProperties = {
        padding: '0.72rem 1rem',
        borderRadius: '12px',
        border: '1.5px solid #e5e7eb',
        outline: 'none',
        minWidth: '170px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        background: 'white',
        color: '#374151',
        transition: 'border-color 0.2s',
        marginBottom: '2rem'
    };

    return (
        <div className="invitados-page">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>{config.title}</h2>
                <p>{config.subtitle}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0 1rem' }}>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={selectStyle}
                >
                    <option value="all">📅 Todos los Años</option>
                    <option value="2026">2026 (Actual)</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>
            </div>

            <div className="guests-grid">
                {filteredGuests.length > 0 ? filteredGuests.map((guest: any, index: number) => {
                    const guestName = guest?.name || guest?.nombre || "Invitado Especial";
                    const guestOrg = guest?.organization || guest?.organizacion || "Independiente";
                    const guestAvatar = guest?.avatar || guest?.avatar_url || "/default-avatar.png";
                    const guestBio = guest?.bio || "";
                    const guestYear = guest?.year || 2026;

                    return (
                        <div key={index} className="guest-card fade-in premium-glass-card">
                            <div className="guest-image-container" style={{ position: 'relative' }}>
                                <img src={guestAvatar} alt={guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {guestYear}
                                </div>
                            </div>
                            <div className="guest-details">
                                <h3>{guestName}</h3>
                                <p className="guest-org">{guestOrg}</p>
                                <p className="guest-bio">{guestBio}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👥</span>
                        <h3>No se encontraron invitados para este año.</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
