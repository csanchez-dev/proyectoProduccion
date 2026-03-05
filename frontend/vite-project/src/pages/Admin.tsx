import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { conferences as initialConferences } from "../data/conference_mocks"
import { getEvents, getGenderStats, getConferenceStats, getPageViewsStats, getLoadTimeStats, getImageLoadStats, getResourceSizeStats, getAdvancedStatsByPage } from "../utils/tracker"
import { translations, getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts'
import QRCode from 'react-qr-code'
import { toast } from "sonner"

export default function Admin() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

    useEffect(() => {
        const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es');
        window.addEventListener('app-lang-updated', updateLang);
        return () => window.removeEventListener('app-lang-updated', updateLang);
    }, []);

    const t = (key: keyof typeof translations.es) => getTranslation(key, lang)

    const [conferences, setConferences] = useState<any[]>([])
    const [deletedConferences, setDeletedConferences] = useState<any[]>(() => {
        const saved = localStorage.getItem("site_deleted_conferences")
        return saved ? JSON.parse(saved) : []
    })

    const [activeTab, setActiveTab] = useState("conferences")
    const [bannerPreview, setBannerPreview] = useState(localStorage.getItem("site_banner") || "/banner-header.png")
    const [logoUniPreview, setLogoUniPreview] = useState(localStorage.getItem("site_logo_uni") || "/ucatolica-logo.png")
    const [logoEventPreview, setLogoEventPreview] = useState(localStorage.getItem("site_logo_evento") || "/logo-coniiti.png")

    // Estados para colores
    const [bgColor, setBgColor] = useState(localStorage.getItem("custom_bg_color") || "#ffffff")
    const [textColor, setTextColor] = useState(localStorage.getItem("custom_text_color") || "#1b1a1a")
    const [headerColor, setHeaderColor] = useState(localStorage.getItem("custom_header_bg") || "#1f2a44")
    const [primaryColor, setPrimaryColor] = useState(localStorage.getItem("custom_primary_color") || "#2563EB")
    const [secondaryColor, setSecondaryColor] = useState(localStorage.getItem("custom_secondary_color") || "#1E293B")

    const dispatchUpdate = () => {
        window.dispatchEvent(new Event('site-config-updated'));
        setBannerPreview(localStorage.getItem("site_banner") || "/banner-header.png");
        setLogoUniPreview(localStorage.getItem("site_logo_uni") || "/ucatolica-logo.png");
        setLogoEventPreview(localStorage.getItem("site_logo_evento") || "/logo-coniiti.png");
        setBgColor(localStorage.getItem("custom_bg_color") || "#ffffff");
        setTextColor(localStorage.getItem("custom_text_color") || "#1b1a1a");
        setHeaderColor(localStorage.getItem("custom_header_bg") || "#1f2a44");
        setPrimaryColor(localStorage.getItem("custom_primary_color") || "#2563EB");
        setSecondaryColor(localStorage.getItem("custom_secondary_color") || "#1E293B");
    };
    const [chartTypes, setChartTypes] = useState<any>({
        views: 'bar',
        gender: 'pie',
        conferences: 'bar',
        performance: 'bar'
    })
    const [selectedPerfPage, setSelectedPerfPage] = useState("/")
    const [settingsTab, setSettingsTab] = useState("general")
    const navigate = useNavigate()

    // Gestión de Capacidad de Auditorios
    const [locCapacities, setLocCapacities] = useState(() => {
        const saved = localStorage.getItem("site_location_capacities");
        if (saved) return JSON.parse(saved);
        return {
            "Auditorio Paraninfo": 100,
            "Auditorio Torres": 100,
            "Auditorio Sede 4 - Sala 1": 30,
            "Auditorio Sede 4 - Sala 2": 30,
            "Auditorio Sede 4 - Sala 3": 30,
            "Auditorio Sede 4 - Sala 4": 30,
            "Auditorio Sede 4 - Sala 5": 30,
            "Auditorio Sede 4 - Sala 6": 30
        };
    });

    useEffect(() => {
        localStorage.setItem("site_location_capacities", JSON.stringify(locCapacities));
    }, [locCapacities]);

    useEffect(() => {
        const session = localStorage.getItem("user_session")
        if (session) {
            const user = JSON.parse(session)
            if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "VIEWER" || user.role === "CONTENT_MANAGER") {
                setUserRole(user.role)
            } else {
                navigate("/") // No tiene permisos
            }
        } else {
            navigate("/login") // No hay sesión
        }
    }, [navigate])

    const [speakers, setSpeakers] = useState<any[]>(() => {
        // Inicializar con los datos de los mocks + locales para que nunca esté vacía la lista
        const conferenceSource = (() => {
            try {
                const saved = JSON.parse(localStorage.getItem("site_conferences") || '[]');
                return saved.length > 0 ? saved : initialConferences;
            } catch { return initialConferences; }
        })();
        const seedSpeakers: any[] = [];
        const seen = new Set<string>();
        conferenceSource.forEach((c: any) => {
            const name = c.speaker?.name || c.speaker?.nombre;
            if (name && !seen.has(name)) {
                seedSpeakers.push({
                    id: `seed-${c.id}`,
                    nombre: name,
                    organizacion: c.speaker.organization || c.speaker.organizacion || '',
                    bio: c.speaker.bio || '',
                    avatar_url: c.speaker.avatar || c.speaker.avatar_url || '/default-avatar.png'
                });
                seen.add(name);
            }
        });
        // Agregar también los guardados localmente
        try {
            const local = JSON.parse(localStorage.getItem('site_speakers') || '[]');
            local.forEach((ls: any) => {
                const lsName = ls.nombre || ls.name;
                if (lsName && !seen.has(lsName)) {
                    seedSpeakers.push(ls);
                    seen.add(lsName);
                }
            });
        } catch { /* sin datos locales */ }
        return seedSpeakers;
    })
    const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchAllData = async () => {
        setIsLoading(true);
        let ponenciasData: any[] = [];
        let ponentesData: any[] = [];
        let usuariosData: any[] = [];

        try {
            const { getPonencias, getPonentes, getUsuarios } = await import("../services/api");

            // Intentos individuales para no fallar si un endpoint está caído
            try { ponenciasData = await getPonencias(); } catch (e) { console.warn("API Ponencias falló"); }
            try { ponentesData = await getPonentes(); } catch (e) { console.warn("API Ponentes falló"); }
            try { usuariosData = await getUsuarios(); } catch (e) { console.warn("API Usuarios falló"); }

            // 1. Unificar Conferencias (Agenda)
            const savedConfs = JSON.parse(localStorage.getItem("site_conferences") || '[]');
            const finalConfs = ponenciasData.length > 0 ? ponenciasData : (savedConfs.length > 0 ? savedConfs : initialConferences);
            setConferences(finalConfs);

            // 2. Unificar Ponentes/Invitados
            const finalSpeakers = [...ponentesData];
            const speakerNames = new Set(finalSpeakers.map(s => (s.nombre || s.name)));

            // Extraer de conferencias actuales (asegura que los invitados de mocks aparezcan)
            finalConfs.forEach((c: any) => {
                const cSpeakerName = c.speaker?.name || c.speaker?.nombre;
                if (cSpeakerName && !speakerNames.has(cSpeakerName)) {
                    finalSpeakers.push({
                        id: `sp-auto-${c.id}`,
                        nombre: cSpeakerName,
                        organizacion: c.speaker.organization || c.speaker.organizacion || "Independiente",
                        bio: c.speaker.bio || "Invitado experto",
                        avatar_url: c.speaker.avatar || c.speaker.avatar_url || "/default-avatar.png"
                    });
                    speakerNames.add(cSpeakerName);
                }
            });

            // Sumar los creados localmente
            const localSpeakers = JSON.parse(localStorage.getItem('site_speakers') || '[]');
            localSpeakers.forEach((ls: any) => {
                const lsName = ls.nombre || ls.name;
                if (lsName && !speakerNames.has(lsName)) {
                    finalSpeakers.push(ls);
                    speakerNames.add(lsName);
                }
            });

            setSpeakers(finalSpeakers);

            // 3. Unificar Usuarios
            const localUsers = JSON.parse(localStorage.getItem('usuarios_locales') || '[]');
            const transformedLocal = localUsers.map((u: any) => ({
                id: u.documentNumber || `local-${u.email}`,
                nombre_completo: u.fullName,
                email: u.email,
                rol: u.role,
                carrera: u.career,
                created_at: new Date().toISOString()
            }));

            const dbEmails = new Set(usuariosData.map((u: any) => u.email));
            const uniqueLocals = transformedLocal.filter((u: any) => !dbEmails.has(u.email));
            setRegisteredUsers([...usuariosData, ...uniqueLocals]);

        } catch (err) {
            console.error("Error crítico en fetchAllData:", err);
            setConferences(initialConferences);
            // Fallback mínimo para no dejar vacía la lista de invitados
            const fallbackSpeakers = Array.from(new Set(initialConferences.map(c => c.speaker.name))).map(name => {
                const conf = initialConferences.find(c => c.speaker.name === name);
                return {
                    id: `fb-${name}`,
                    nombre: name,
                    organizacion: conf?.speaker.organization || '',
                    bio: conf?.speaker.bio || '',
                    avatar_url: conf?.speaker.avatar || ''
                };
            });
            setSpeakers(fallbackSpeakers);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Persistencia automática de los cambios
    useEffect(() => {
        localStorage.setItem("site_conferences", JSON.stringify(conferences))
    }, [conferences])

    useEffect(() => {
        localStorage.setItem("site_deleted_conferences", JSON.stringify(deletedConferences))
    }, [deletedConferences])

    useEffect(() => {
        if (speakers.length > 0) {
            localStorage.setItem("site_speakers", JSON.stringify(speakers))
        }
    }, [speakers])

    const [editingConf, setEditingConf] = useState<any | null>(null)
    const [editingSpeaker, setEditingSpeaker] = useState<any | null>(null)

    const handleDeleteConference = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta conferencia?")) return;

        try {
            const { deletePonencia } = await import("../services/api");
            await deletePonencia(id);
            setConferences(conferences.filter((c: any) => c.id !== id));
            // alert("Conferencia eliminada");
        } catch (err) {
            console.error("Error deleting conference:", err);
            // alert("No se pudo eliminar de la base de datos.");
        }
    }

    const handleRestoreConference = (id: string) => {
        const confToRestore = deletedConferences.find((c: any) => c.id === id)
        if (confToRestore) {
            setConferences([...conferences, confToRestore])
            setDeletedConferences(deletedConferences.filter((c: any) => c.id !== id))
            // alert("Conferencia restaurada")
        }
    }

    const handleEditConference = (conf: { id: string, title: string, description: string, speakerName?: string, startTime: string, endTime: string, location: string, category: string, level: string, speaker: any, career?: string }) => {
        setEditingConf({ ...conf })
    }

    // Gestión de Días de la Agenda
    const [agendaDays, setAgendaDays] = useState<{ id: string, label: string }[]>(() => {
        const saved = localStorage.getItem("agenda_days_info");
        if (saved) return JSON.parse(saved);
        return [
            { id: "day1", label: "Día 1" },
            { id: "day2", label: "Día 2" },
            { id: "day3", label: "Día 3" }
        ];
    });

    useEffect(() => {
        localStorage.setItem("agenda_days_info", JSON.stringify(agendaDays));
        localStorage.setItem("agenda_num_days", String(agendaDays.length));
    }, [agendaDays]);

    // Gestión de Filtros de la Agenda
    const [agendaFilters, setAgendaFilters] = useState<any[]>(() => {
        const saved = localStorage.getItem("agenda_filters_config");
        if (saved) return JSON.parse(saved);
        return [
            {
                id: "modality",
                label: "Modalidad",
                property: "type",
                icon: "📍",
                options: [
                    { value: "all", label: "Todas las Modalidades" },
                    { value: "presencial", label: "Presencial" },
                    { value: "virtual", label: "Virtual" }
                ]
            },
            {
                id: "career",
                label: "Carrera",
                property: "career",
                icon: "🎓",
                options: [
                    { value: "all", label: "Todas las Carreras" },
                    { value: "Administración de Empresas", label: "Administración de Empresas" },
                    { value: "Arquitectura", label: "Arquitectura" },
                    { value: "Derecho", label: "Derecho" },
                    { value: "Economía", label: "Economía" },
                    { value: "Ingeniería Civil", label: "Ingeniería Civil" },
                    { value: "Ingeniería de Sistemas", label: "Ingeniería de Sistemas" },
                    { value: "Ingeniería Electrónica", label: "Ingeniería Electrónica" },
                    { value: "Ingeniería Industrial", label: "Ingeniería Industrial" },
                    { value: "Psicología", label: "Psicología" },
                    { value: "Diseño Gráfico", label: "Diseño Gráfico" },
                    { value: "General", label: "General" }
                ]
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem("agenda_filters_config", JSON.stringify(agendaFilters));
    }, [agendaFilters]);

    const [showConfForm, setShowConfForm] = useState(false)
    const [newConf, setNewConf] = useState({
        title: "",
        location: "Auditorio Paraninfo",
        description: "",
        speakerName: "",
        dayId: "day1",
        startTime: "09:00",
        endTime: "10:00",
        career: "Ingeniería de Sistemas",
        type: "presencial",
        virtualLink: "",
        documentUrl: "",
        documentFile: ""
    })

    const handleAddConference = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { createPonencia } = await import("../services/api");

            // Buscar ID del ponente
            let finalSpeaker = speakers.find(s => s.name === newConf.speakerName);

            // Si es nuevo ponente (simplificado: crear uno básico si no existe)
            if (newConf.speakerName === "OTRO") {
                const { createPonente } = await import("../services/api");
                const newSpeakerName = (window as any)._tempNewSpeaker || "Invitado Especial";
                finalSpeaker = await createPonente({
                    nombre: newSpeakerName,
                    organizacion: "Invitado Externo",
                    bio: "Experto invitado",
                    avatar_url: "/default-avatar.png"
                });
            }

            if (!finalSpeaker) throw new Error("Debes seleccionar un ponente válido");

            const ponenciaData = {
                titulo: newConf.title,
                descripcion: newConf.description,
                hora_inicio: newConf.startTime,
                hora_fin: newConf.endTime,
                sala_id: 1,
                dia_id: parseInt(newConf.dayId.replace("day", "")) || 1,
                dayId: newConf.dayId, // Para compatibilidad con el frontend
                documentUrl: newConf.documentUrl,
                documentFile: newConf.documentFile,
                speaker: { name: finalSpeaker.name, organization: finalSpeaker.organization, avatar: "/default-avatar.png", bio: "" }
            };

            try {
                await createPonencia(ponenciaData);
            } catch (apiErr) {
                console.warn("API fallida, guardando localmente:", apiErr);
            }

            // Actualizar localmente para respuesta inmediata
            const updatedConfs = [...conferences, { ...ponenciaData, id: Date.now().toString() }];
            setConferences(updatedConfs);
            localStorage.setItem("site_conferences", JSON.stringify(updatedConfs));

            // alert("¡Conferencia guardada!");
            setShowConfForm(false);
            setNewConf({ ...newConf, title: "", description: "" });
        } catch (err: any) {
            console.error("Error saving conference:", err);
            // alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const updatedConfs = conferences.map((c: any) => c.id === editingConf.id ? editingConf : c);
            setConferences(updatedConfs);
            localStorage.setItem("site_conferences", JSON.stringify(updatedConfs));

            // Intentar actualizar en API si tenemos endpoint (opcional según el backend actual)
            try {
                const { updatePonencia } = await import("../services/api");
                if (updatePonencia) await updatePonencia(editingConf.id, editingConf);
            } catch (apiErr) {
                console.warn("No se pudo actualizar en API (posible endpoint inexistente), cambios guardados localmente");
            }

            setEditingConf(null)
            toast.success("Cambios guardados correctamente")
        } catch (err) {
            console.error("Error al guardar cambios:", err);
            // alert("No se pudieron guardar los cambios");
        }
    }

    const [showGuestForm, setShowGuestForm] = useState(false)
    const [qrModalConf, setQrModalConf] = useState<any | null>(null)

    const downloadQR = () => {
        const svg = document.getElementById(`qr-code-svg-${qrModalConf?.id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const a = document.createElement("a");
                a.download = `Asistencia-${qrModalConf?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                a.href = canvas.toDataURL("image/png");
                a.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
    const [newGuest, setNewGuest] = useState({
        name: "",
        organization: "",
        bio: "",
        avatar: ""
    })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewGuest({ ...newGuest, avatar: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { createPonente } = await import("../services/api");

            const guestData = {
                nombre: newGuest.name,
                organizacion: newGuest.organization,
                bio: newGuest.bio,
                avatar_url: newGuest.avatar || "/default-avatar.png"
            };

            let savedSpeaker;
            try {
                savedSpeaker = await createPonente(guestData);
            } catch (apiErr) {
                console.warn("Error API al crear ponente, usando simulación local:", apiErr);
                savedSpeaker = { ...guestData, id: `local-${Date.now()}` };
            }

            // 1. Actualizar lista de speakers (esto hará que aparezca en configuración)
            const updatedSpeakers = [...speakers, savedSpeaker];
            setSpeakers(updatedSpeakers);
            localStorage.setItem("site_speakers", JSON.stringify(updatedSpeakers));

            // 2. Crear conferencia simulada para la agenda si es deseado
            const newId = `conf-${Date.now()}`;
            const simulatedConf = {
                id: newId,
                title: `Conferencia: ${newGuest.name}`,
                description: newGuest.bio,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                location: "Pendiente",
                category: "General",
                level: "Básico",
                speaker: {
                    name: savedSpeaker.nombre || savedSpeaker.name,
                    organization: savedSpeaker.organizacion || savedSpeaker.organization,
                    bio: savedSpeaker.bio,
                    avatar: savedSpeaker.avatar_url || savedSpeaker.avatar
                }
            };

            setConferences([...conferences, simulatedConf]);
            setShowGuestForm(false);
            setNewGuest({ name: "", organization: "", bio: "", avatar: "" });
            // alert("¡Invitado agregado exitosamente!");
        } catch (err) {
            console.error("Error al agregar invitado:", err);
            // alert("No se pudo agregar el invitado.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveSpeakerEdit = (e: React.FormEvent) => {
        e.preventDefault();
        const updated = speakers.map(s => s.id === editingSpeaker.id ? editingSpeaker : s);
        setSpeakers(updated);
        localStorage.setItem("site_speakers", JSON.stringify(updated));

        // También actualizar en las conferencias el nombre/org del ponente si cambió
        const updatedConfs = conferences.map(c => {
            if (c.speaker?.id === editingSpeaker.id || c.speaker?.name === (editingSpeaker.nombre || editingSpeaker.name)) {
                return {
                    ...c,
                    speaker: {
                        ...c.speaker,
                        name: editingSpeaker.nombre || editingSpeaker.name,
                        organization: editingSpeaker.organizacion || editingSpeaker.organization,
                        avatar: editingSpeaker.avatar_url || editingSpeaker.avatar,
                        bio: editingSpeaker.bio
                    }
                };
            }
            return c;
        });
        setConferences(updatedConfs);

        setEditingSpeaker(null);
        // alert("✅ Información del invitado actualizada.");
    };

    if (!userRole) return <div className="loading">{lang === 'es' ? 'Cargando panel...' : 'Loading panel...'}</div>

    return (
        <div className="admin-container fade-in">
            {isLoading && (
                <div className="admin-loading-overlay">
                    <div className="spinner"></div>
                    <p>Procesando...</p>
                </div>
            )}
            <div className="admin-header">

                <h1>{t('admin_title')}</h1>
                <p className="role-badge">
                    {userRole === "SUPER_ADMIN" ? "Super Usuario 1: Acceso Total" :
                        (userRole === "ADMIN" || userRole === "CONTENT_MANAGER") ? "Administrador de Eventos" :
                            "Visualizador de Datos"}
                </p>
            </div>

            <div className="admin-grid">
                <aside className="admin-sidebar">
                    <button
                        className={activeTab === "conferences" ? "active" : ""}
                        onClick={() => setActiveTab("conferences")}
                    >
                        📅 Agenda / Conferencias
                    </button>
                    <button
                        className={activeTab === "guests" ? "active" : ""}
                        onClick={() => setActiveTab("guests")}
                    >
                        👥 Invitados
                    </button>

                    {userRole === "SUPER_ADMIN" && (
                        <button
                            className={activeTab === "trash" ? "active" : ""}
                            onClick={() => setActiveTab("trash")}
                        >
                            🗑️ Papelera / Restauración
                        </button>
                    )}

                    {(userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "CONTENT_MANAGER") && (
                        <button
                            className={activeTab === "analytics" ? "active" : ""}
                            onClick={() => setActiveTab("analytics")}
                        >
                            📊 Analíticas
                        </button>
                    )}

                    {userRole === "SUPER_ADMIN" && (
                        <>
                            <button
                                className={activeTab === "settings" ? "active" : ""}
                                onClick={() => setActiveTab("settings")}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                ⚙️ Configuración Página
                            </button>
                            <button
                                className={activeTab === "users" ? "active" : ""}
                                onClick={() => setActiveTab("users")}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                👤 Usuarios
                            </button>
                            <button
                                className={activeTab === "performance" ? "active" : ""}
                                onClick={() => setActiveTab("performance")}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                ⏱️ Rendimiento
                            </button>
                        </>
                    )}
                </aside>

                <main className="admin-content">
                    {activeTab === "conferences" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Control de Conferencias</h2>
                                {userRole !== "VIEWER" && (
                                    <button
                                        className="btn-add"
                                        onClick={() => setShowConfForm(!showConfForm)}
                                    >
                                        {showConfForm ? "Cerrar Formulario" : "+ Añadir Nueva"}
                                    </button>
                                )}
                            </div>

                            {showConfForm && (() => {
                                // Obtener lista única de conferencistas disponibles desde el estado real
                                const availableSpeakers = speakers;

                                return (

                                    <form className="add-guest-form fade-in" onSubmit={handleAddConference}>
                                        <div className="form-group">
                                            <label>Título de la Conferencia</label>
                                            <input
                                                type="text"
                                                required
                                                value={newConf.title}
                                                onChange={e => setNewConf({ ...newConf, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Seleccionar Conferencista / Invitado</label>
                                                <select
                                                    className="admin-select"
                                                    required
                                                    value={newConf.speakerName}
                                                    onChange={e => {
                                                        const selectedName = e.target.value;
                                                        setNewConf({ ...newConf, speakerName: selectedName });
                                                    }}
                                                >
                                                    <option value="">-- Selecciona un invitado --</option>
                                                    {availableSpeakers.map((s, idx) => (
                                                        <option key={idx} value={s.name}>{s.name} ({s.organization})</option>
                                                    ))}
                                                    <option value="OTRO">+ Otro (Escribir nombre)</option>
                                                </select>
                                            </div>
                                            {newConf.speakerName === "OTRO" && (
                                                <div className="form-group">
                                                    <label>Nombre del Nuevo Ponente</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre del nuevo invitado"
                                                        onChange={e => {
                                                            // Guardamos temporalmente en speakerName pero permitimos escribir
                                                            // En el submit manejaremos esto
                                                            (window as any)._tempNewSpeaker = e.target.value;
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Modalidad</label>
                                                <select
                                                    value={newConf.type}
                                                    onChange={e => setNewConf({ ...newConf, type: e.target.value as any })}
                                                    className="admin-select"
                                                >
                                                    <option value="presencial">Presencial</option>
                                                    <option value="virtual">Virtual</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Ubicación (Salón / Auditorio)</label>
                                            <select
                                                value={newConf.location}
                                                onChange={e => setNewConf({ ...newConf, location: e.target.value })}
                                                required
                                                className="admin-select"
                                            >
                                                {Object.keys(locCapacities).map(loc => (
                                                    <option key={loc} value={loc}>{loc} (Cap: {locCapacities[loc]})</option>
                                                ))}
                                            </select>
                                        </div>
                                        {newConf.type === 'virtual' && (
                                            <div className="form-group">
                                                <label>Enlace de la Reunión (Virtual)</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://zoom.us/j/..."
                                                    value={newConf.virtualLink}
                                                    onChange={e => setNewConf({ ...newConf, virtualLink: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Carrera Afín</label>
                                            <select
                                                value={newConf.career}
                                                onChange={e => setNewConf({ ...newConf, career: e.target.value })}
                                                required
                                                className="admin-select"
                                            >
                                                <option value="">Selecciona la carrera</option>
                                                <option value="Administración de Empresas">Administración de Empresas</option>
                                                <option value="Arquitectura">Arquitectura</option>
                                                <option value="Derecho">Derecho</option>
                                                <option value="Economía">Economía</option>
                                                <option value="Ingeniería Civil">Ingeniería Civil</option>
                                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                                <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                                                <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                                                <option value="Psicología">Psicología</option>
                                                <option value="Diseño Gráfico">Diseño Gráfico</option>
                                                <option value="General">General / Todas</option>
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Día de la Conferencia</label>
                                                <select
                                                    value={newConf.dayId}
                                                    onChange={e => setNewConf({ ...newConf, dayId: e.target.value })}
                                                    required
                                                    className="admin-select"
                                                >
                                                    {agendaDays.map(day => (
                                                        <option key={day.id} value={day.id}>{day.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Hora de Inicio</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={newConf.startTime}
                                                    onChange={e => setNewConf({ ...newConf, startTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Hora de Finalización</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={newConf.endTime}
                                                    onChange={e => setNewConf({ ...newConf, endTime: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label>🔗 Enlace Externo (Material)</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://ejemplo.com/recurso"
                                                    value={newConf.documentUrl}
                                                    onChange={e => setNewConf({ ...newConf, documentUrl: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>📁 Cargar Archivo Local</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                if (reader.result) setNewConf({ ...newConf, documentFile: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Descripción / Resumen</label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={newConf.description}
                                                onChange={e => setNewConf({ ...newConf, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-save-guest">Publicar Conferencia</button>
                                    </form>
                                );
                            })()}

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Ponente</th>
                                        <th>Ubicación</th>
                                        {userRole !== "VIEWER" && <th>Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {conferences.map((conf: any) => (
                                        <tr key={conf.id}>
                                            <td>{conf.title}</td>
                                            <td>{conf.speaker.name}</td>
                                            <td>{conf.location}</td>
                                            {userRole !== "VIEWER" && (
                                                <td className="actions">
                                                    <button className="btn-edit-sm" onClick={() => handleEditConference(conf)}>✏️ Editar</button>
                                                    <button className="btn-edit-sm" style={{ background: '#27ae60', margin: '0 5px' }} onClick={() => setQrModalConf(conf)}>📷 QR</button>
                                                    <button className="btn-delete-sm" onClick={() => handleDeleteConference(conf.id)}>🗑️ Borrar</button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Modal de QR de Asistencia */}
                            {qrModalConf && (
                                <div className="modal-overlay" onClick={() => setQrModalConf(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
                                        <h2>Código de Asistencia</h2>
                                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>{qrModalConf.title}</p>

                                        <div style={{ background: 'white', padding: '16px', display: 'inline-block', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <QRCode
                                                id={`qr-code-svg-${qrModalConf.id}`}
                                                value={`CONF_ATTENDANCE_${qrModalConf.id}`}
                                                size={256}
                                                level="H"
                                            />
                                        </div>

                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            <button className="btn-submit premium-btn" onClick={downloadQR}>
                                                ⬇️ Descargar PNG
                                            </button>
                                            <button className="btn-cancel" onClick={() => setQrModalConf(null)}>
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                    {activeTab === "guests" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Gestión de Invitados</h2>
                                {userRole !== "VIEWER" && (
                                    <button
                                        className="btn-add"
                                        onClick={() => setShowGuestForm(!showGuestForm)}
                                    >
                                        {showGuestForm ? "Cerrar Formulario" : "+ Nuevo Invitado"}
                                    </button>
                                )}
                            </div>

                            {showGuestForm && (
                                <form className="add-guest-form fade-in" onSubmit={handleAddGuest}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nombre Completo</label>
                                            <input
                                                type="text"
                                                required
                                                value={newGuest.name}
                                                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Organización / Universidad</label>
                                            <input
                                                type="text"
                                                required
                                                value={newGuest.organization}
                                                onChange={(e) => setNewGuest({ ...newGuest, organization: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Foto del Invitado (Cargar desde dispositivo)</label>
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="file-input"
                                            />
                                            {newGuest.avatar && (
                                                <img src={newGuest.avatar} alt="Preview" className="upload-preview" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Bio / Perfil Profesional</label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={newGuest.bio}
                                            onChange={(e) => setNewGuest({ ...newGuest, bio: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn-save-guest">Guardar Invitado</button>
                                </form>
                            )}

                            <div className="guests-grid">
                                {speakers.length === 0 ? (
                                    <div style={{
                                        gridColumn: '1/-1',
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: '#94a3b8',
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        border: '2px dashed #e2e8f0'
                                    }}>
                                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</p>
                                        <p style={{ fontWeight: '600' }}>No hay invitados aún</p>
                                        <p style={{ fontSize: '0.85rem' }}>Agrega tu primer invitado con el botón de arriba.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p style={{ gridColumn: '1/-1', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            {speakers.length} invitado{speakers.length !== 1 ? 's' : ''} registrado{speakers.length !== 1 ? 's' : ''}
                                        </p>
                                        {speakers.map((speaker: any) => (
                                            <div key={speaker.id} className="guest-admin-card fade-in">
                                                <img src={speaker.avatar_url || speaker.avatar || "/default-avatar.png"} alt={speaker.nombre || speaker.name} />
                                                <div className="guest-info">
                                                    <h4>{speaker.nombre || speaker.name}</h4>
                                                    <p>{speaker.organizacion || speaker.organization}</p>
                                                </div>
                                                {userRole !== "VIEWER" && (
                                                    <div className="guest-actions">
                                                        <button className="btn-edit-sm" onClick={() => setEditingSpeaker(speaker)}>✏️ Editar Perfil</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                        </div>
                    )}

                    {activeTab === "settings" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>⚙️ Configuración del Sitio</h2>
                                <p>Personaliza el aspecto y contenido de cada sección del sitio.</p>
                            </div>

                            {/* Sub-navegación de Configuración */}
                            <div className="settings-subnav" style={{
                                display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                                borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '2rem'
                            }}>
                                {[
                                    { id: "general", icon: "⚙️", label: "General" },
                                    { id: "pg-inicio", icon: "🏠", label: "Inicio" },
                                    { id: "pg-invitados", icon: "👥", label: "Invitados" },
                                    { id: "pg-agenda", icon: "📅", label: "Agenda" },
                                    { id: "pg-acerca", icon: "ℹ️", label: "Acerca De" },
                                    { id: "pg-contacto", icon: "✉️", label: "Contacto" },
                                    { id: "pg-aforos", icon: "🏛️", label: "Aforos y Sedes" },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSettingsTab(tab.id)}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: settingsTab === tab.id ? '700' : '500',
                                            background: settingsTab === tab.id ? 'var(--primary-color)' : '#f0f4ff',
                                            color: settingsTab === tab.id ? 'white' : '#374151',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── GENERAL ── */}
                            {settingsTab === "general" && (
                                <form className="settings-form">
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>⚙️ Configuración General</h3>
                                    <div className="form-group">
                                        <label>Nombre del Evento</label>
                                        <input type="text" defaultValue="CONIITI 2026" />
                                    </div>
                                    <div className="form-group">
                                        <label>Tema por País (Colores y Estilos)</label>
                                        <select
                                            defaultValue={localStorage.getItem("site_theme") || "default"}
                                            onChange={(e) => {
                                                const theme = e.target.value;
                                                localStorage.setItem("site_theme", theme);
                                                document.body.className = theme === "default" ? "" : `theme-${theme}`;
                                                dispatchUpdate();
                                            }}
                                            className="theme-select"
                                        >
                                            <option value="default">Estándar (Universidad Católica)</option>
                                            <option value="colombia">Colombia (Amarillo, Azul y Rojo)</option>
                                            <option value="italy">Italia (Verde, Blanco y Rojo)</option>
                                            <option value="mexico">México (Verde y Rojo)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Imagen de Banner (Cabecera)</label>
                                        <div className="banner-edit-zone">
                                            <div className="file-upload-wrapper">
                                                <div className="banner-admin-preview" style={{ marginBottom: '1rem' }}>
                                                    <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 1500000) { toast.error("La imagen es muy pesada (máx 1.5MB)."); return; }
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                if (reader.result) {
                                                                    try { localStorage.setItem("site_banner", reader.result as string); dispatchUpdate(); }
                                                                    catch { toast.error("La imagen sigue siendo muy grande."); }
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="file-input"
                                                />
                                            </div>
                                            <div className="banner-actions">
                                                <button type="button" className="btn-remove-img" onClick={() => { localStorage.removeItem("site_banner"); dispatchUpdate(); }}>
                                                    Restaurar Original
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Logos de la Institución y Evento (Encabezado)</label>
                                        <div className="logos-edit-grid">
                                            <div className="logo-upload-item">
                                                <span>Logo Universidad</span>
                                                <div className="mini-preview">
                                                    <img src={logoUniPreview} alt="Preview Uni" style={{ height: '40px', objectFit: 'contain', background: '#eee', padding: '5px', borderRadius: '4px' }} />
                                                </div>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) { alert("El logo es muy grande (máx 800KB)."); return; }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => { if (reader.result) { localStorage.setItem("site_logo_uni", reader.result as string); dispatchUpdate(); } };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                                <button type="button" className="btn-remove-img-sm" onClick={() => { localStorage.removeItem("site_logo_uni"); dispatchUpdate(); }}>Restaurar Original</button>
                                            </div>
                                            <div className="logo-upload-item">
                                                <span>Logo CONIITI</span>
                                                <div className="mini-preview">
                                                    <img src={logoEventPreview} alt="Preview Evento" style={{ height: '40px', objectFit: 'contain', background: '#eee', padding: '5px', borderRadius: '4px' }} />
                                                </div>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800000) { alert("El logo es muy grande (máx 800KB)."); return; }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => { if (reader.result) { localStorage.setItem("site_logo_evento", reader.result as string); dispatchUpdate(); } };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                                <button type="button" className="btn-remove-img-sm" onClick={() => { localStorage.removeItem("site_logo_evento"); dispatchUpdate(); }}>Restaurar Original</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Personalización de Colores</label>
                                        <div className="color-picker-grid">
                                            <div className="color-item">
                                                <span>Fondo General</span>
                                                <input type="color" value={bgColor} onChange={(e) => { localStorage.setItem("custom_bg_color", e.target.value); setBgColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Texto Principal</span>
                                                <input type="color" value={textColor} onChange={(e) => { localStorage.setItem("custom_text_color", e.target.value); setTextColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color de Cabecera</span>
                                                <input type="color" value={headerColor} onChange={(e) => { localStorage.setItem("custom_header_bg", e.target.value); setHeaderColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color Primario (Botones)</span>
                                                <input type="color" value={primaryColor} onChange={(e) => { localStorage.setItem("custom_primary_color", e.target.value); setPrimaryColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                            <div className="color-item">
                                                <span>Color Secundario</span>
                                                <input type="color" value={secondaryColor} onChange={(e) => { localStorage.setItem("custom_secondary_color", e.target.value); setSecondaryColor(e.target.value); dispatchUpdate(); }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Modo de Mantenimiento</label>
                                        <input type="checkbox" />
                                    </div>
                                    <div className="admin-actions-footer">
                                        <button type="button" className="btn-submit" onClick={() => toast.success("Configuración global guardada correctamente")}>
                                            Guardar Cambios Globales
                                        </button>
                                        <button type="button" className="btn-logout" style={{ marginLeft: '1rem', background: '#e74c3c' }}
                                            onClick={() => {
                                                if (confirm("¿Seguro que quieres borrar toda la personalización?")) {
                                                    ["site_banner", "site_logo_uni", "site_logo_evento", "custom_bg_color", "custom_text_color", "custom_header_bg", "custom_primary_color", "custom_secondary_color"].forEach(key => localStorage.removeItem(key));
                                                    dispatchUpdate();
                                                }
                                            }}>
                                            Limpiar y Resetear Diseño
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── PÁGINA: INICIO ── */}
                            {settingsTab === "pg-inicio" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>🏠 Configuración — Página de Inicio</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título Principal (Hero)</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_hero_title") || "CONIITI 2026"}
                                                onChange={e => localStorage.setItem("home_hero_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Subtítulo del Hero</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_hero_subtitle") || "Congreso Internacional de Innovación Tecnológica"}
                                                onChange={e => localStorage.setItem("home_hero_subtitle", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Imagen de Fondo (Hero)</label>
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => { if (reader.result) localStorage.setItem("home_hero_bg", reader.result as string); };
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Texto del Botón Principal</label>
                                            <input type="text" defaultValue={localStorage.getItem("home_btn_text") || "Ver Agenda"}
                                                onChange={e => localStorage.setItem("home_btn_text", e.target.value)} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); toast.success("Cambios de Inicio guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* El contenido de usuarios se movió a una pestaña principal */}

                            {/* ── PÁGINA: INVITADOS ── */}
                            {settingsTab === "pg-invitados" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>👥 Configuración — Página de Invitados</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("guests_title") || "Nuestros Invitados"}
                                                onChange={e => localStorage.setItem("guests_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Subtítulo / Descripción</label>
                                            <textarea rows={2} defaultValue={localStorage.getItem("guests_subtitle") || "Expertos internacionales que compartirán su conocimiento"}
                                                onChange={e => localStorage.setItem("guests_subtitle", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Mostrar Organización del Ponente</label>
                                            <input type="checkbox" defaultChecked={localStorage.getItem("guests_show_org") !== "false"}
                                                onChange={e => localStorage.setItem("guests_show_org", String(e.target.checked))} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); toast.success("Cambios de Invitados guardados."); }}>
                                            Guardar Cambios
                                        </button>

                                        {/* Lista real de invitados (misma fuente que la pestaña Invitados) */}
                                        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
                                                👥 Invitados Registrados ({speakers.length})
                                            </h4>
                                            {speakers.length === 0 ? (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                    No hay invitados registrados aún. Agrégalos desde la pestaña "Invitados".
                                                </p>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                                    {speakers.map((sp: any) => (
                                                        <div key={sp.id} style={{
                                                            display: 'flex', alignItems: 'center', gap: '12px',
                                                            padding: '12px', background: '#f8fafc',
                                                            borderRadius: '12px', border: '1px solid #e2e8f0'
                                                        }}>
                                                            <img
                                                                src={sp.avatar_url || sp.avatar || "/default-avatar.png"}
                                                                alt={sp.nombre || sp.name}
                                                                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                                            />
                                                            <div style={{ minWidth: 0 }}>
                                                                <p style={{ fontWeight: '700', margin: 0, fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {sp.nombre || sp.name}
                                                                </p>
                                                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {sp.organizacion || sp.organization || "—"}
                                                                </p>
                                                            </div>
                                                            <button
                                                                className="btn-edit-sm"
                                                                style={{ padding: '6px', fontSize: '10px' }}
                                                                onClick={() => setEditingSpeaker(sp)}
                                                            >✏️</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: AGENDA ── */}
                            {settingsTab === "pg-agenda" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>📅 Configuración — Página de Agenda</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("agenda_title") || "Agenda CONIITI 2026"}
                                                onChange={e => localStorage.setItem("agenda_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Descripción Introductoria</label>
                                            <textarea rows={2} defaultValue={localStorage.getItem("agenda_subtitle") || "Explora todas las charlas y conferencias del evento"}
                                                onChange={e => localStorage.setItem("agenda_subtitle", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Mostrar Filtros en la Agenda</label>
                                            <input type="checkbox" defaultChecked={localStorage.getItem("agenda_show_filters") !== "false"}
                                                onChange={e => localStorage.setItem("agenda_show_filters", String(e.target.checked))} />
                                        </div>
                                        <div className="form-group">
                                            <label>Número de Columnas (Escritorio)</label>
                                            <select defaultValue={localStorage.getItem("agenda_cols") || "auto"}
                                                onChange={e => localStorage.setItem("agenda_cols", e.target.value)}>
                                                <option value="auto">Automático (recomendado)</option>
                                                <option value="2">2 columnas</option>
                                                <option value="3">3 columnas</option>
                                                <option value="4">4 columnas</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'block' }}>🚩 Gestión de Días del Evento</label>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Define cuántos días dura el evento y cómo se llamará cada pestaña en la agenda.</p>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {agendaDays.map((day, index) => (
                                                    <div key={day.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 'bold', minWidth: '60px' }}>#{index + 1}</span>
                                                        <input
                                                            type="text"
                                                            value={day.label}
                                                            placeholder="Título del día (Ej: Día 1...)"
                                                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                            onChange={(e) => {
                                                                const newDays = [...agendaDays];
                                                                newDays[index].label = e.target.value;
                                                                setAgendaDays(newDays);
                                                            }}
                                                        />
                                                        {agendaDays.length > 1 && (
                                                            <button
                                                                onClick={() => setAgendaDays(agendaDays.filter(d => d.id !== day.id))}
                                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newId = `day${agendaDays.length + 1}_${Date.now()}`;
                                                        setAgendaDays([...agendaDays, { id: newId, label: `Día ${agendaDays.length + 1}` }]);
                                                    }}
                                                    style={{ padding: '10px', border: '2px dashed #cbd5e1', background: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}
                                                >
                                                    + Agregar un Día Adicional
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'block' }}>🔍 Configuración de la Barra de Búsqueda y Filtros</label>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Agrega, quita o edita los filtros que aparecen en la parte superior de la agenda.</p>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {agendaFilters.map((filter, fIndex) => (
                                                    <div key={filter.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={filter.icon}
                                                                title="Icono (Emoji)"
                                                                style={{ width: '45px', padding: '8px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                                onChange={(e) => {
                                                                    const newFilters = [...agendaFilters];
                                                                    newFilters[fIndex].icon = e.target.value;
                                                                    setAgendaFilters(newFilters);
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={filter.label}
                                                                placeholder="Nombre del Filtro"
                                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}
                                                                onChange={(e) => {
                                                                    const newFilters = [...agendaFilters];
                                                                    newFilters[fIndex].label = e.target.value;
                                                                    setAgendaFilters(newFilters);
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => setAgendaFilters(agendaFilters.filter((_, i) => i !== fIndex))}
                                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                                                title="Eliminar Filtro"
                                                            >🗑️</button>
                                                        </div>

                                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                                            <label style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', display: 'block' }}>Opciones del Menú Desplegable:</label>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                {filter.options.map((opt: any, oIndex: number) => (
                                                                    <div key={oIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: '80px' }}>{opt.value === 'all' ? 'Predeterm.' : 'Valor:'}</span>
                                                                        <input
                                                                            type="text"
                                                                            value={opt.label}
                                                                            placeholder="Etiqueta"
                                                                            style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                                                            onChange={(e) => {
                                                                                const newFilters = [...agendaFilters];
                                                                                newFilters[fIndex].options[oIndex].label = e.target.value;
                                                                                setAgendaFilters(newFilters);
                                                                            }}
                                                                        />
                                                                        {opt.value !== 'all' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newFilters = [...agendaFilters];
                                                                                    newFilters[fIndex].options = newFilters[fIndex].options.filter((_: any, i: number) => i !== oIndex);
                                                                                    setAgendaFilters(newFilters);
                                                                                }}
                                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                                                            >❌</button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                style={{ marginTop: '12px', fontSize: '0.75rem', background: '#fff', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                onClick={() => {
                                                                    const lab = prompt("Nombre de la opción (ej: Internacional):");
                                                                    const val = prompt("Valor a filtrar (debe coincidir con el campo de la DB/Mock, ej: 'internacional'):");
                                                                    if (val && lab) {
                                                                        const newFilters = [...agendaFilters];
                                                                        newFilters[fIndex].options.push({ value: val, label: lab });
                                                                        setAgendaFilters(newFilters);
                                                                    }
                                                                }}
                                                            >+ Añadir Opción</button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => {
                                                        const label = prompt("Nombre del nuevo filtro (ej: Categoría):");
                                                        if (label) {
                                                            const id = label.toLowerCase().replace(/\s+/g, '_') + Date.now();
                                                            const prop = prompt("Campo de la conferencia que filtrará (ej: category, level, type, speakerName):", "category");
                                                            if (prop) {
                                                                setAgendaFilters([...agendaFilters, {
                                                                    id,
                                                                    label,
                                                                    property: prop,
                                                                    icon: "🏷️",
                                                                    options: [{ value: "all", label: `Todos los ${label}s` }]
                                                                }]);
                                                            }
                                                        }
                                                    }}
                                                    style={{ width: '100%', padding: '12px', border: '2px dashed #cbd5e1', background: 'white', borderRadius: '12px', cursor: 'pointer', color: '#64748b', fontWeight: '600', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                                >
                                                    + Crear Nuevo Filtro Personalizado
                                                </button>
                                            </div>
                                        </div>

                                        <button className="btn-submit" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => { dispatchUpdate(); toast.success("Configuración de Agenda y Días guardada."); }}>
                                            Guardar Cambios de Agenda
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: ACERCA DE ── */}
                            {settingsTab === "pg-acerca" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>ℹ️ Configuración — Acerca De</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_title") || "Acerca del CONIITI"}
                                                onChange={e => localStorage.setItem("about_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Descripción del Evento</label>
                                            <textarea rows={5} defaultValue={localStorage.getItem("about_description") || "El Congreso Internacional de Innovación Tecnológica reúne a expertos de todo el mundo para compartir avances en ciencia y tecnología."}
                                                onChange={e => localStorage.setItem("about_description", e.target.value)}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha del Evento</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_date") || "2026"}
                                                onChange={e => localStorage.setItem("about_date", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Lugar del Evento</label>
                                            <input type="text" defaultValue={localStorage.getItem("about_location") || "Universidad Católica"}
                                                onChange={e => localStorage.setItem("about_location", e.target.value)} />
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); toast.success("Cambios de 'Acerca de' guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: CONTACTO ── */}
                            {settingsTab === "pg-contacto" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>✉️ Configuración — Contacto</h3>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Título de la Sección</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_title") || "Contáctanos"}
                                                onChange={e => localStorage.setItem("contact_title", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Correo Electrónico de Contacto</label>
                                            <input type="email" defaultValue={localStorage.getItem("contact_email") || "coniiti@ucatolica.edu.co"}
                                                onChange={e => localStorage.setItem("contact_email", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Teléfono</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_phone") || "+57 (601) 327 7300"}
                                                onChange={e => localStorage.setItem("contact_phone", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Dirección</label>
                                            <input type="text" defaultValue={localStorage.getItem("contact_address") || "Bogotá, Colombia"}
                                                onChange={e => localStorage.setItem("contact_address", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Mensaje en el formulario de contacto</label>
                                            <textarea rows={3} defaultValue={localStorage.getItem("contact_form_msg") || "¿Tienes dudas? Escríbenos y te responderemos a la brevedad."}
                                                onChange={e => localStorage.setItem("contact_form_msg", e.target.value)}></textarea>
                                        </div>
                                        <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { dispatchUpdate(); toast.success("Cambios de Contacto guardados."); }}>
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PÁGINA: AFOROS ── */}
                            {settingsTab === "pg-aforos" && (
                                <div className="page-settings-panel fade-in">
                                    <h3>🏛️ Gestión de Aforos y Auditorios</h3>
                                    <p className="hint">Configura la capacidad máxima de cada lugar. Los cambios afectarán el límite de inscripciones en la agenda.</p>

                                    <div className="settings-form" style={{ marginTop: '1.5rem' }}>
                                        <div className="venues-grid" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '2rem'
                                        }}>
                                            {Object.keys(locCapacities).map(loc => {
                                                const conferenceCount = conferences.filter((c: any) => c.location === loc).length;
                                                return (
                                                    <div className="venue-card" key={loc} style={{
                                                        background: 'white',
                                                        padding: '1.2rem',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        border: '1px solid #edf2f7',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.8rem'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: '#2d3748' }}>{loc}</h4>
                                                                <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginTop: '4px' }}>
                                                                    {conferenceCount} {conferenceCount === 1 ? 'conferencia agendada' : 'conferencias agendadas'}
                                                                </span>
                                                            </div>
                                                            {!loc.startsWith("Auditorio Paraninfo") && !loc.startsWith("Auditorio Torres") && conferenceCount === 0 && (
                                                                <button
                                                                    className="btn-delete-sm"
                                                                    style={{ padding: '4px 8px' }}
                                                                    onClick={() => {
                                                                        const newCaps = { ...locCapacities };
                                                                        delete newCaps[loc];
                                                                        setLocCapacities(newCaps);
                                                                    }}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="form-group" style={{ margin: 0 }}>
                                                            <label style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Aforo (Personas)</label>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    value={locCapacities[loc]}
                                                                    onChange={e => {
                                                                        setLocCapacities({ ...locCapacities, [loc]: parseInt(e.target.value) || 0 });
                                                                    }}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '8px',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e2e8f0',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="add-location-box" style={{
                                            marginTop: '1.5rem',
                                            padding: '2rem',
                                            background: '#fff',
                                            borderRadius: '20px',
                                            border: '2px dashed var(--primary-color)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary-color)' }}></div>
                                            <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ✨ Registrar Nuevo Sitio / Auditorio
                                            </h4>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr auto',
                                                gap: '1.5rem',
                                                alignItems: 'end'
                                            }}>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label style={{ fontWeight: 600, color: '#4a5568', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Nombre Completo del Sitio</label>
                                                    <input
                                                        type="text"
                                                        id="new-loc-name"
                                                        placeholder="Ej: Auditorio Central, Sala 202..."
                                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label style={{ fontWeight: 600, color: '#4a5568', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Capacidad de Aforo</label>
                                                    <input
                                                        type="number"
                                                        id="new-loc-cap"
                                                        defaultValue="50"
                                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem' }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-submit"
                                                    style={{ height: '48px', padding: '0 2.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                                    onClick={() => {
                                                        const nameInput = document.getElementById('new-loc-name') as HTMLInputElement;
                                                        const capInput = document.getElementById('new-loc-cap') as HTMLInputElement;
                                                        if (nameInput.value.trim()) {
                                                            setLocCapacities({
                                                                ...locCapacities,
                                                                [nameInput.value.trim()]: parseInt(capInput.value) || 0
                                                            });
                                                            nameInput.value = "";
                                                            // alert("¡Sitio añadido!");
                                                        } else {
                                                            // alert("Por favor ingresa un nombre para el sitio.");
                                                        }
                                                    }}
                                                >
                                                    Crear Sitio
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                            <button
                                                type="button"
                                                className="btn-add"
                                                style={{ background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
                                                onClick={() => {
                                                    const currentSede4Salas = Object.keys(locCapacities).filter(k => k.includes("Sede 4"));
                                                    const nextNum = currentSede4Salas.length + 1;
                                                    setLocCapacities({
                                                        ...locCapacities,
                                                        [`Auditorio Sede 4 - Sala ${nextNum}`]: 30
                                                    });
                                                }}
                                            >
                                                ⚡ Sede 4: Agregar Sala Rápido
                                            </button>
                                        </div>

                                        <button className="btn-submit" style={{ marginTop: '2rem', width: '100%' }} onClick={() => { dispatchUpdate(); toast.success("Configuración de aforos guardada."); }}>
                                            Guardar y Aplicar a Toda la Agenda
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {activeTab === "analytics" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view fade-in">
                            <div className="view-header">
                                <h2>📊 Dashboard de Inteligencia de Datos</h2>
                                <p>Análisis avanzado del comportamiento de usuarios y registros.</p>
                            </div>

                            <div className="analytics-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

                                {/* Gráfica de Visitas */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Vistas por Página</h4>
                                        <select
                                            value={chartTypes.views}
                                            onChange={(e) => setChartTypes({ ...chartTypes, views: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="bar">Barras</option>
                                            <option value="line">Líneas</option>
                                            <option value="pie">Circular</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.views === 'bar' ? (
                                                <BarChart data={getPageViewsStats()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#375fe4" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            ) : chartTypes.views === 'line' ? (
                                                <LineChart data={getPageViewsStats()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="value" stroke="#375fe4" strokeWidth={3} />
                                                </LineChart>
                                            ) : (
                                                <PieChart>
                                                    <Pie data={getPageViewsStats()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {[0, 1, 2, 3, 4].map((_, index) => <Cell key={`cell-${index}`} fill={['#375fe4', '#4998f1', '#1f2a44', '#e74c3c'][index % 4]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Género */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Distribución por Género</h4>
                                        <select
                                            value={chartTypes.gender}
                                            onChange={(e) => setChartTypes({ ...chartTypes, gender: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="pie">Pastel</option>
                                            <option value="bar">Barras</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.gender === 'pie' ? (
                                                <PieChart>
                                                    <Pie data={getGenderStats()} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                                                        <Cell fill="#3498db" />
                                                        <Cell fill="#e91e63" />
                                                        <Cell fill="#95a5a6" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            ) : (
                                                <BarChart data={getGenderStats()}>
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#3498db">
                                                        <Cell fill="#3498db" />
                                                        <Cell fill="#e91e63" />
                                                        <Cell fill="#95a5a6" />
                                                    </Bar>
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Conferencias */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: 0 }}>Inscripciones por Conferencia</h4>
                                        <select
                                            value={chartTypes.conferences}
                                            onChange={(e) => setChartTypes({ ...chartTypes, conferences: e.target.value })}
                                            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="bar">Barras</option>
                                            <option value="scatter">Dispersión</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartTypes.conferences === 'bar' ? (
                                                <BarChart data={getConferenceStats()} layout="vertical">
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={100} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#2ecc71" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            ) : (
                                                <ScatterChart>
                                                    <XAxis dataKey="name" />
                                                    <YAxis dataKey="value" name="Inscritos" />
                                                    <ZAxis range={[60, 400]} />
                                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                    <Scatter name="Conferencias" data={getConferenceStats()} fill="#2ecc71" />
                                                </ScatterChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Log de Actividad Reciente */}
                                <div className="analytics-card premium-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <h4>Historial de Actividad Global</h4>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', fontSize: '0.8rem' }}>
                                        {getEvents().map((log, i) => (
                                            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><strong style={{ color: 'var(--primary-color)' }}>{log.type}</strong> en {log.path}</span>
                                                <span style={{ color: '#888' }}>{log.timestamp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "trash" && (
                        <div className="admin-view">
                            <div className="view-header">
                                <h2>Papelera de Reciclaje</h2>
                            </div>
                            {deletedConferences.length === 0 ? (
                                <div className="no-data">La papelera está vacía</div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deletedConferences.map(conf => (
                                            <tr key={conf.id}>
                                                <td>{conf.title}</td>
                                                <td className="actions">
                                                    <button
                                                        className="btn-edit-sm"
                                                        onClick={() => handleRestoreConference(conf.id)}
                                                    >
                                                        🔄 Restaurar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {editingConf && (
                        <div className="modal-overlay fade-in">
                            <div className="modal-content">
                                <h3>Editar Conferencia</h3>
                                <form onSubmit={handleSaveEdit}>
                                    <div className="form-group">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            value={editingConf.title}
                                            onChange={e => setEditingConf({ ...editingConf, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Conferencista / Invitado</label>
                                        <select
                                            className="admin-select"
                                            value={editingConf.speaker.name || editingConf.speaker.nombre}
                                            onChange={e => {
                                                const selectedName = e.target.value;
                                                const selectedSpeaker = speakers.find((s: any) => (s.nombre || s.name) === selectedName);
                                                if (selectedSpeaker) {
                                                    setEditingConf({
                                                        ...editingConf,
                                                        speaker: {
                                                            name: selectedSpeaker.nombre || selectedSpeaker.name,
                                                            organization: selectedSpeaker.organizacion || selectedSpeaker.organization,
                                                            bio: selectedSpeaker.bio,
                                                            avatar: selectedSpeaker.avatar_url || selectedSpeaker.avatar
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">Seleccionar un invitado...</option>
                                            {speakers.map((s: any, idx: number) => (
                                                <option key={idx} value={s.nombre || s.name}>
                                                    {s.nombre || s.name} ({s.organizacion || s.organization || 'Sin org.'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Modalidad</label>
                                        <select
                                            value={editingConf.type || 'presencial'}
                                            onChange={e => setEditingConf({ ...editingConf, type: e.target.value as any })}
                                            className="admin-select"
                                        >
                                            <option value="presencial">Presencial</option>
                                            <option value="virtual">Virtual</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ubicación</label>
                                        <select
                                            value={editingConf.location}
                                            onChange={e => setEditingConf({ ...editingConf, location: e.target.value })}
                                            required
                                            className="admin-select"
                                        >
                                            {Object.keys(locCapacities).map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {editingConf.type === 'virtual' && (
                                        <div className="form-group">
                                            <label>Enlace de la Reunión (Virtual)</label>
                                            <input
                                                type="url"
                                                value={editingConf.virtualLink || ''}
                                                onChange={e => setEditingConf({ ...editingConf, virtualLink: e.target.value })}
                                                placeholder="https://zoom.us/j/..."
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Carrera Afín</label>
                                        <select
                                            value={editingConf.career}
                                            onChange={e => setEditingConf({ ...editingConf, career: e.target.value })}
                                            className="admin-select"
                                        >
                                            <option value="Administración de Empresas">Administración de Empresas</option>
                                            <option value="Arquitectura">Arquitectura</option>
                                            <option value="Derecho">Derecho</option>
                                            <option value="Economía">Economía</option>
                                            <option value="Ingeniería Civil">Ingeniería Civil</option>
                                            <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                            <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                                            <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                                            <option value="Psicología">Psicología</option>
                                            <option value="Diseño Gráfico">Diseño Gráfico</option>
                                            <option value="General">General / Todas</option>
                                        </select>
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Día</label>
                                            <select
                                                value={editingConf.dayId || 'day1'}
                                                onChange={e => setEditingConf({ ...editingConf, dayId: e.target.value })}
                                                className="admin-select"
                                            >
                                                {agendaDays.map(day => (
                                                    <option key={day.id} value={day.id}>{day.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Inicio</label>
                                            <input
                                                type="time"
                                                value={editingConf.startTime || '09:00'}
                                                onChange={e => setEditingConf({ ...editingConf, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Fin</label>
                                            <input
                                                type="time"
                                                value={editingConf.endTime || '10:00'}
                                                onChange={e => setEditingConf({ ...editingConf, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="form-group">
                                            <label>🔗 Enlace Externo</label>
                                            <input
                                                type="text"
                                                value={editingConf.documentUrl || ''}
                                                onChange={e => setEditingConf({ ...editingConf, documentUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>📁 Cambiar Archivo</label>
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (reader.result) setEditingConf({ ...editingConf, documentFile: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            rows={3}
                                            value={editingConf.description}
                                            onChange={e => setEditingConf({ ...editingConf, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="submit" className="btn-submit">Guardar Cambios</button>
                                        <button type="button" className="btn-logout" onClick={() => setEditingConf(null)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {editingSpeaker && (
                        <div className="modal-overlay fade-in">
                            <div className="modal-content" style={{ maxWidth: '400px' }}>
                                <h3>👤 Editar Información del Invitado</h3>
                                <form onSubmit={handleSaveSpeakerEdit}>
                                    <div className="form-group">
                                        <label>Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={editingSpeaker.nombre || editingSpeaker.name || ''}
                                            onChange={e => setEditingSpeaker({ ...editingSpeaker, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Organización / Institución</label>
                                        <input
                                            type="text"
                                            value={editingSpeaker.organizacion || editingSpeaker.organization || ''}
                                            onChange={e => setEditingSpeaker({ ...editingSpeaker, organizacion: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Bio / Perfil Profesional</label>
                                        <textarea
                                            rows={4}
                                            value={editingSpeaker.bio || ''}
                                            onChange={e => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="submit" className="btn-save" style={{ background: 'var(--primary-color)', color: 'white' }}>Actualizar Datos</button>
                                        <button type="button" className="btn-logout" onClick={() => setEditingSpeaker(null)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view fade-in">
                            <div className="view-header">
                                <h2>👥 Gestión de Usuarios Registrados</h2>
                                <p>Administra los perfiles de todos los participantes y roles asignados.</p>
                            </div>

                            <div className="table-responsive premium-card" style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '16px' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre Completo</th>
                                            <th>Correo Electrónico</th>
                                            <th>Rol</th>
                                            <th>Carrera</th>
                                            <th>Fecha Registro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registeredUsers.length > 0 ? (
                                            registeredUsers.map((u: any) => (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{u.nombre_completo}</td>
                                                    <td>{u.email || "—"}</td>
                                                    <td><span className={`badge-role ${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                                                    <td>{u.carrera || "N/A"}</td>
                                                    <td style={{ color: '#888' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                                                    No se encontraron usuarios registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "performance" && userRole === "SUPER_ADMIN" && (
                        <div className="admin-view fade-in">
                            <div className="view-header" style={{ marginBottom: '2rem' }}>
                                <h2>⏱️ Inteligencia de Rendimiento Avanzada</h2>
                                <p>Análisis estadístico (Media, Moda, Mediana) y carga granular de imágenes por sección.</p>
                            </div>

                            {/* Resumen Global Rápido */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="premium-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>CARGA GLOBAL MEDIA</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: 'var(--primary-color)' }}>
                                        {Math.round(getLoadTimeStats().reduce((acc: number, curr: any) => acc + curr.value, 0) / (getLoadTimeStats().length || 1))} ms
                                    </p>
                                </div>
                                <div className="premium-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>PESO TOTAL ASSETS</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#059669' }}>
                                        {getResourceSizeStats().reduce((acc: number, curr: any) => acc + curr.value, 0)} KB
                                    </p>
                                </div>
                                <div className="premium-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>IMÁGENES CRÍTICAS</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#dc2626' }}>
                                        {getImageLoadStats().filter(i => i.value > 500).length} Lentas
                                    </p>
                                </div>
                            </div>

                            {/* Selector de Pestaña de Página */}
                            <div className="perf-page-selector" style={{ display: 'flex', gap: '8px', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '10px' }}>
                                {[
                                    { id: "/", label: "Inicio", icon: "🏠" },
                                    { id: "/invitados", label: "Invitados", icon: "👥" },
                                    { id: "/conferencias", label: "Agenda", icon: "📅" },
                                    { id: "/perfil", label: "Perfil", icon: "👤" },
                                    { id: "/login", label: "Auth (Sesión)", icon: "🔐" },
                                    { id: "/registro", label: "Registro", icon: "📝" }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPerfPage(p.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: selectedPerfPage === p.id ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            background: selectedPerfPage === p.id ? '#eff6ff' : 'white',
                                            color: selectedPerfPage === p.id ? 'var(--primary-color)' : '#475569',
                                        }}
                                    >
                                        {p.icon} {p.label}
                                    </button>
                                ))}
                            </div>

                            {/* Detalle Estadístico por Página */}
                            {(() => {
                                const stats = getAdvancedStatsByPage(selectedPerfPage);
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div className="premium-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📊 Estadísticas Vitales</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#64748b' }}>Media (Promedio):</span>
                                                        <span style={{ fontWeight: 'bold' }}>{stats.mean} ms</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#64748b' }}>Mediana (Punto Medio):</span>
                                                        <span style={{ fontWeight: 'bold' }}>{stats.median} ms</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#64748b' }}>Moda (Frecuencia):</span>
                                                        <span style={{ fontWeight: 'bold' }}>{stats.mode} ms</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                                                        <span style={{ color: '#64748b' }}>Muestra:</span>
                                                        <span>{stats.count} registros</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="premium-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 Carga por Recursos</h3>
                                                <div style={{ width: '100%', height: 200 }}>
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie data={getResourceSizeStats()} innerRadius={50} outerRadius={70} dataKey="value">
                                                                {getResourceSizeStats().map((_, idx) => (
                                                                    <Cell key={`cell-${idx}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][idx % 4]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>🖼️ Tiempo de Carga de Imágenes ({selectedPerfPage})</h3>
                                            <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre del Recurso</th>
                                                            <th>Demora</th>
                                                            <th>Evaluación</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats.images.length > 0 ? stats.images.map((img, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.name}</td>
                                                                <td style={{ fontWeight: 'bold' }}>{img.duration} ms</td>
                                                                <td>
                                                                    <span style={{
                                                                        padding: '2px 8px',
                                                                        borderRadius: '10px',
                                                                        fontSize: '0.7rem',
                                                                        background: img.duration < 150 ? '#d1fae5' : img.duration < 400 ? '#fef3c7' : '#fee2e2',
                                                                        color: img.duration < 150 ? '#065f46' : img.duration < 400 ? '#92400e' : '#991b1b'
                                                                    }}>
                                                                        {img.duration < 150 ? 'Excelente' : img.duration < 400 ? 'Normal' : 'Crítico'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Navega a esta pestaña para recolectar datos de imágenes.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                </main>
            </div>

            {/* ── MODAL: EDITAR INVITADO ── */}
            {editingSpeaker && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="modal-content fade-in" style={{
                        background: 'white', borderRadius: '16px', padding: '2rem',
                        width: '100%', maxWidth: '520px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>✏️ Editar Invitado</h3>
                            <button onClick={() => setEditingSpeaker(null)} style={{
                                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8'
                            }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <img
                                src={editingSpeaker.avatar_url || editingSpeaker.avatar || '/default-avatar.png'}
                                alt="Preview"
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }}
                            />
                        </div>

                        <form onSubmit={handleSaveSpeakerEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={editingSpeaker.nombre || editingSpeaker.name || ''}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, nombre: e.target.value, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Organización / Universidad</label>
                                <input
                                    type="text"
                                    value={editingSpeaker.organizacion || editingSpeaker.organization || ''}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, organizacion: e.target.value, organization: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Bio / Perfil Profesional</label>
                                <textarea
                                    rows={3}
                                    value={editingSpeaker.bio || ''}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Foto del Invitado (cambiar)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 1500000) { toast.error("La imagen es muy pesada (máx 1.5MB)."); return; }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                if (reader.result) {
                                                    setEditingSpeaker({ ...editingSpeaker, avatar_url: reader.result as string, avatar: reader.result as string });
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingSpeaker(null)}
                                    style={{
                                        flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px',
                                        background: 'white', cursor: 'pointer', fontWeight: '600', color: '#6b7280'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 2, padding: '10px', border: 'none', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white',
                                        cursor: 'pointer', fontWeight: '700', fontSize: '1rem'
                                    }}
                                >
                                    💾 Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
