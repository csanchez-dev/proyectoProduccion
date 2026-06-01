import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

// Fotos de muestra para la galería — se muestran mientras no haya fotos reales
const SAMPLE_GALLERY: Array<{ id: string; url: string; name: string; date: string; tag: string }> = [
    {
        id: "sample-1",
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop",
        name: "Conferencia Inaugural",
        date: "CONIITI 2025",
        tag: "Apertura"
    },
    {
        id: "sample-2",
        url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&auto=format&fit=crop",
        name: "Sesión de Ponencias",
        date: "CONIITI 2025",
        tag: "Ponencias"
    },
    {
        id: "sample-3",
        url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&auto=format&fit=crop",
        name: "Panel de Innovación",
        date: "CONIITI 2025",
        tag: "Panel"
    },
    {
        id: "sample-4",
        url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=900&auto=format&fit=crop",
        name: "Networking Tech",
        date: "CONIITI 2025",
        tag: "Networking"
    },
    {
        id: "sample-5",
        url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=900&auto=format&fit=crop",
        name: "Taller de IA y Robótica",
        date: "CONIITI 2025",
        tag: "Workshop"
    },
    {
        id: "sample-6",
        url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop",
        name: "Exposición de Proyectos",
        date: "CONIITI 2025",
        tag: "Exposición"
    },
    {
        id: "sample-7",
        url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&auto=format&fit=crop",
        name: "Clausura y Reconocimientos",
        date: "CONIITI 2025",
        tag: "Clausura"
    },
    {
        id: "sample-8",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop",
        name: "Equipo Organizador",
        date: "CONIITI 2025",
        tag: "Equipo"
    },
    {
        id: "sample-9",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop",
        name: "Auditorio Principal",
        date: "CONIITI 2025",
        tag: "Sede"
    },
];

export default function Gallery() {
    const [publicGallery, setPublicGallery] = useState<any[]>(() => {
        const saved = localStorage.getItem("site_public_gallery");
        const parsed = saved ? JSON.parse(saved) : [];
        // Si no hay fotos reales, mostrar las de muestra
        return parsed.length > 0 ? parsed : SAMPLE_GALLERY;
    });


    const [pendingPhotos, setPendingPhotos] = useState<any[]>(() => {
        const saved = localStorage.getItem("site_pending_gallery");
        return saved ? JSON.parse(saved) : [];
    });

    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedTag, setSelectedTag] = useState("Todos");
    const [activeLightboxImg, setActiveLightboxImg] = useState<any | null>(null);

    // ESC key listener to close Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveLightboxImg(null);
            }
        };
        if (activeLightboxImg) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [activeLightboxImg]);


    useEffect(() => {
        const refresh = () => {
            const saved = localStorage.getItem("site_public_gallery");
            const parsed = saved ? JSON.parse(saved) : [];
            setPublicGallery(parsed.length > 0 ? parsed : SAMPLE_GALLERY);
        };
        window.addEventListener('site-config-updated', refresh);
        return () => window.removeEventListener('site-config-updated', refresh);
    }, []);

    const handleUserUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newPending = [...pendingPhotos];

        try {
            const { compressImage } = await import("../utils/imageCompressor");
            for (let i = 0; i < files.length; i++) {
                const compressed = await compressImage(files[i], 1200, 1200, 0.7);
                newPending.unshift({
                    id: `pending-${Date.now()}-${i}`,
                    url: compressed,
                    name: files[i].name,
                    user: "Usuario Anónimo",
                    date: new Date().toLocaleString()
                });
            }
            setPendingPhotos(newPending);
            localStorage.setItem("site_pending_gallery", JSON.stringify(newPending));
            toast.success("¡Fotos enviadas! Un administrador las revisará pronto.", {
                icon: "🚀",
                style: { borderRadius: '12px' }
            });
        } catch (_err) {
            toast.error("Error al procesar imágenes");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUserUpload(e.dataTransfer.files);
        }
    };

    // Calculate unique tags from public gallery
    const tags = ["Todos", ...Array.from(new Set(publicGallery.map(img => img.tag || "General").filter(Boolean)))];

    // Filter public gallery photos by selected tag
    const filteredPhotos = selectedTag === "Todos"
        ? publicGallery
        : publicGallery.filter(img => (img.tag || "General") === selectedTag);

    // Lightbox navigation helpers
    const handlePrevLightboxImg = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = filteredPhotos.findIndex(img => img.id === activeLightboxImg?.id);
        if (currentIndex > 0) {
            setActiveLightboxImg(filteredPhotos[currentIndex - 1]);
        } else {
            setActiveLightboxImg(filteredPhotos[filteredPhotos.length - 1]);
        }
    };

    const handleNextLightboxImg = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = filteredPhotos.findIndex(img => img.id === activeLightboxImg?.id);
        if (currentIndex < filteredPhotos.length - 1) {
            setActiveLightboxImg(filteredPhotos[currentIndex + 1]);
        } else {
            setActiveLightboxImg(filteredPhotos[0]);
        }
    };

    return (
        <div className="main-container fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Header Section */}
            <header style={{
                textAlign: 'center',
                marginBottom: '3rem',
                padding: '4rem 1rem',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(30, 41, 59, 0.05))',
                borderRadius: '32px'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    color: 'var(--secondary-color)',
                    fontWeight: 900,
                    letterSpacing: '-2px',
                    marginBottom: '1rem'
                }}>
                    📸 Galería <span style={{ color: 'var(--primary-color)' }}>CONIITI</span>
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Revive los mejores momentos del Congreso Internacional de Innovación Tecnológica.
                </p>
            </header>

            {/* Tag Filter Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem',
                marginBottom: '3rem'
            }}>
                {tags.map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            style={{
                                padding: '10px 22px',
                                borderRadius: '999px',
                                border: isActive ? '1px solid var(--primary-color)' : '1px solid #cbd5e1',
                                background: isActive ? 'linear-gradient(135deg, var(--primary-color), #1e3a8a)' : 'white',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 8px 18px rgba(37,99,235,0.25)' : '0 4px 12px rgba(0,0,0,0.03)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                    e.currentTarget.style.color = 'var(--primary-color)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            {tag === "Todos" ? "🌐 Todos" : tag}
                        </button>
                    );
                })}
            </div>

            {/* Gallery Grid */}
            {filteredPhotos.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '8rem 2rem',
                    background: 'white',
                    borderRadius: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(1)', opacity: 0.3 }}>🖼️</div>
                    <h2 style={{ color: 'var(--secondary-color)', fontWeight: 700 }}>Aún no hay fotos en esta categoría</h2>
                    <p style={{ color: '#94a3b8' }}>¡Vuelve más tarde o comparte tus propias imágenes!</p>
                </div>
            ) : (
                <div style={{
                    columns: '3 300px',
                    columnGap: '1.5rem',
                    width: '100%',
                    marginBottom: '6rem'
                }}>
                    {filteredPhotos.map((img) => (
                        <div
                            key={img.id}
                            className="gallery-item"
                            onClick={() => setActiveLightboxImg(img)}
                            style={{
                                breakInside: 'avoid',
                                marginBottom: '1.5rem',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                cursor: 'zoom-in',
                                background: '#0f172a',
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}
                        >
                            <img
                                src={img.url}
                                alt={img.name}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    transition: 'transform 0.5s, opacity 0.5s',
                                    opacity: 0.92
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.06)';
                                    e.currentTarget.style.opacity = '0.7';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.opacity = '0.92';
                                }}
                            />
                            {/* Tag badge */}
                            {img.tag && (
                                <span style={{
                                    position: 'absolute',
                                    top: '14px',
                                    left: '14px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                                }}>
                                    {img.tag}
                                </span>
                            )}
                            {/* Overlay info */}
                            <div className="img-overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '2rem 1.5rem 1.5rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s'
                            }}>
                                <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{img.name}</p>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{img.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Premium Upload Section (Glassmorphism) */}
            <section
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                    position: 'relative',
                    padding: '4rem 2rem',
                    background: dragActive ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: dragActive ? '3px dashed var(--primary-color)' : '2px dashed #e2e8f0',
                    borderRadius: '40px',
                    textAlign: 'center',
                    boxShadow: '0 30px 60px rgba(31, 42, 68, 0.08)',
                    maxWidth: '900px',
                    margin: '4rem auto',
                    transition: 'all 0.3s'
                }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>✨</div>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary-color)', fontWeight: 800, marginBottom: '0.5rem' }}>
                    ¡Haz parte de la historia!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                    Sube tus mejores fotos para que aparezcan en la galería oficial. Arrastra las imágenes o haz clic abajo.
                </p>

                <input
                    type="file"
                    id="user-gallery-upload"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleUserUpload(e.target.files)}
                />

                <button
                    onClick={() => document.getElementById('user-gallery-upload')?.click()}
                    disabled={isUploading}
                    style={{
                        background: 'var(--primary-color)',
                        color: 'white',
                        padding: '16px 48px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 15px 30px rgba(37, 99, 235, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.3)'; }}
                >
                    {isUploading ? "Procesando..." : "📤 Seleccionar Imágenes"}
                </button>

                {isUploading && (
                    <div style={{ marginTop: '1.5rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        <span className="spinner-small" style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #eee', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}></span>
                        Comprimiendo calidad...
                    </div>
                )}
            </section>

            {/* Lightbox Modal (Portal) */}
            {activeLightboxImg && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100vw', height: '100vh',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 5000,
                        padding: '20px'
                    }}
                    onClick={() => setActiveLightboxImg(null)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setActiveLightboxImg(null)}
                        style={{
                            position: 'absolute',
                            top: '20px', right: '20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            width: '44px', height: '44px',
                            borderRadius: '50%',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                            zIndex: 5010
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    >
                        ✕
                    </button>

                    {/* Main Content Area */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        maxWidth: '1200px',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        
                        {/* Left Arrow */}
                        <button
                            onClick={handlePrevLightboxImg}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                width: '56px', height: '56px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                zIndex: 5010
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            ◀
                        </button>

                        {/* Image Frame */}
                        <div style={{
                            position: 'relative',
                            maxWidth: '80%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#0f172a',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <img
                                src={activeLightboxImg.url}
                                alt={activeLightboxImg.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                            {/* Info Banner */}
                            <div style={{
                                width: '100%',
                                padding: '1.5rem 2rem',
                                background: 'rgba(15, 23, 42, 0.9)',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activeLightboxImg.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>{activeLightboxImg.date}</p>
                                </div>
                                {activeLightboxImg.tag && (
                                    <span className="glass-badge-premium" style={{ background: 'var(--primary-color)', color: 'white', border: 'none' }}>
                                        {activeLightboxImg.tag}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={handleNextLightboxImg}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                width: '56px', height: '56px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                zIndex: 5010
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            ▶
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .gallery-item:hover { transform: translateY(-10px); }
                .gallery-item:hover .img-overlay { opacity: 1; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
