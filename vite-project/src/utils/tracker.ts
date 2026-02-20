export type AppEvent = {
    timestamp: string;
    type: 'PAGE_VIEW' | 'CLICK';
    path: string;
    details?: string;
};

export const trackEvent = (type: AppEvent['type'], path: string, details?: string) => {
    const events: AppEvent[] = JSON.parse(localStorage.getItem('app_analytics') || '[]');

    const newEvent: AppEvent = {
        timestamp: new Date().toLocaleString(),
        type,
        path,
        details
    };

    // Keep only last 100 events to avoid bloating localStorage
    const updatedEvents = [newEvent, ...events].slice(0, 100);
    localStorage.setItem('app_analytics', JSON.stringify(updatedEvents));
};

export const getEvents = (): AppEvent[] => {
    return JSON.parse(localStorage.getItem('app_analytics') || '[]');
};

export const clearEvents = () => {
    localStorage.removeItem('app_analytics');
};

// Funciones para obtener estadísticas para gráficas
export const getGenderStats = () => {
    // Simulamos datos si no hay suficientes
    const stats = JSON.parse(localStorage.getItem('gender_stats') || JSON.stringify([
        { name: 'Masculino', value: 45 },
        { name: 'Femenino', value: 38 },
        { name: 'Otro', value: 12 }
    ]));
    return stats;
};

export const getConferenceStats = () => {
    // Simulamos datos de inscripciones
    const stats = JSON.parse(localStorage.getItem('conf_stats') || JSON.stringify([
        { name: 'IA y Futuro', value: 120 },
        { name: 'Web 3.0', value: 85 },
        { name: 'Ciberseguridad', value: 95 },
        { name: 'Blockchain', value: 70 },
        { name: 'Robótica', value: 110 }
    ]));
    return stats;
};

export const getPageViewsStats = () => {
    const events = getEvents();
    const views = events.filter(e => e.type === 'PAGE_VIEW');
    const counts: any = {};
    views.forEach(v => {
        counts[v.path] = (counts[v.path] || 0) + 1;
    });
    // Si está vacío, retornamos datos de ejemplo para que las gráficas no se vean vacías
    if (Object.keys(counts).length === 0) {
        return [
            { name: '/inicio', value: 250 },
            { name: '/conferencias', value: 180 },
            { name: '/invitados', value: 150 },
            { name: '/admin', value: 40 }
        ];
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};
