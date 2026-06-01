import { useState, useEffect } from "react";
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

    return (
        <div className="main-container fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Header Section */}
            <header style={{
                textAlign: 'center',
                marginBottom: '4rem',
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

            {/* Gallery Grid */}
            {publicGallery.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '8rem 2rem',
                    background: 'white',
                    borderRadius: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(1)', opacity: 0.3 }}>🖼️</div>
                    <h2 style={{ color: 'var(--secondary-color)', fontWeight: 700 }}>Aún no hay fotos públicas</h2>
                    <p style={{ color: '#94a3b8' }}>¡Sé el primero en compartir un momento inspirador!</p>
                </div>
            ) : (
                <div style={{
                    columns: '3 300px',
                    columnGap: '1.5rem',
                    width: '100%',
                    marginBottom: '6rem'
                }}>
                    {publicGallery.map((img) => (
                        <div key={img.id} className="gallery-item" style={{
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
                        }}>
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

            <style>{`
                .gallery-item:hover { transform: translateY(-10px); }
                .gallery-item:hover .img-overlay { opacity: 1; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
