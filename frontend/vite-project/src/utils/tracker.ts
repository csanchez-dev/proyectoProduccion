export type AppEvent = {
    timestamp: string;
    type: 'PAGE_VIEW' | 'CLICK' | 'PAGE_LOAD_TIME' | 'RESOURCE_LOAD' | 'IMAGE_LOAD';
    path: string;
    details?: string;
    duration?: number; // En milisegundos
    size?: number; // En bytes
};

export const trackEvent = (type: AppEvent['type'], path: string, details?: string, duration?: number, size?: number) => {
    const events: AppEvent[] = JSON.parse(localStorage.getItem('app_analytics') || '[]');

    const newEvent: AppEvent = {
        timestamp: new Date().toLocaleString(),
        type,
        path,
        details,
        duration,
        size
    };

    // Keep only last 300 events for advanced monitoring
    const updatedEvents = [newEvent, ...events].slice(0, 300);
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
    return Object.entries(counts).map(([name, value]) => ({ name, value: Number(value) }));
};

export const getLoadTimeStats = () => {
    const events = getEvents();
    const loadEvents = events.filter(e => e.type === 'PAGE_LOAD_TIME' && e.duration);

    // Agrupar por ruta y promediar
    const routes: any = {};
    loadEvents.forEach(e => {
        if (!routes[e.path]) routes[e.path] = { total: 0, count: 0 };
        routes[e.path].total += e.duration;
        routes[e.path].count += 1;
    });

    const stats = Object.entries(routes).map(([name, data]: any) => ({
        name,
        value: Math.round(data.total / data.count)
    }));

    if (stats.length === 0) {
        return [
            { name: '/inicio', value: 350 },
            { name: '/conferencias', value: 520 },
            { name: '/invitados', value: 480 },
            { name: '/perfil', value: 210 },
            { name: '/admin', value: 650 }
        ];
    }
    return stats;
};

export const getImageLoadStats = () => {
    const events = getEvents();
    const imgEvents = events.filter(e => e.type === 'IMAGE_LOAD' && e.duration);

    // Agrupar por nombre de recurso (details) y promediar duración
    const resources: any = {};
    imgEvents.forEach(e => {
        const name = e.details || 'Desconocido';
        if (!resources[name]) resources[name] = { total: 0, count: 0 };
        resources[name].total += e.duration || 0;
        resources[name].count += 1;
    });

    const stats = Object.entries(resources).map(([name, data]: any) => ({
        name: name.split('/').pop()?.substring(0, 15) || name, // Nombre corto del archivo
        value: Math.round(data.total / data.count)
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 imágenes más lentas

    if (stats.length === 0) {
        return [
            { name: 'banner_main.png', value: 320 },
            { name: 'logo_ucat.jpg', value: 145 },
            { name: 'hero_home.webp', value: 610 },
            { name: 'avatar_user.png', value: 285 }
        ];
    }
    return stats;
};

export const getResourceSizeStats = () => {
    const events = getEvents();
    const resEvents = events.filter(e => e.type === 'RESOURCE_LOAD' && e.size);

    const types: any = { 'Imágenes': 0, 'Scripts': 0, 'Estilos': 0, 'Otros': 0 };
    resEvents.forEach(e => {
        const ext = e.details?.split('.').pop()?.split('?')[0].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) types['Imágenes'] += e.size || 0;
        else if (ext === 'js') types['Scripts'] += e.size || 0;
        else if (ext === 'css') types['Estilos'] += e.size || 0;
        else types['Otros'] += e.size || 0;
    });

    const hasData = Object.values(types).some(v => (v as number) > 0);
    if (!hasData) {
        return [
            { name: 'Imágenes', value: 4500 },
            { name: 'Scripts', value: 1200 },
            { name: 'Estilos', value: 300 },
            { name: 'Otros', value: 150 }
        ];
    }

    return Object.entries(types).map(([name, value]: any) => ({
        name,
        value: Math.round(value / 1024) // Convertir a KB
    }));
};

// --- Funciones Estadísticas Avanzadas ---

const calculateStats = (numbers: number[]) => {
    if (numbers.length === 0) return { mean: 0, median: 0, mode: 0 };

    // Media
    const mean = Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);

    // Mediana
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

    // Moda
    const counts: any = {};
    numbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
    let maxCount = 0;
    let mode = sorted[0];
    for (const n in counts) {
        if (counts[n] > maxCount) {
            maxCount = counts[n];
            mode = Number(n);
        }
    }

    return { mean, median, mode };
};

export const getAdvancedStatsByPage = (targetPath: string) => {
    const events = getEvents();

    // Tiempos de carga de la página
    const pageTimes = events
        .filter(e => e.type === 'PAGE_LOAD_TIME' && e.path === targetPath && e.duration)
        .map(e => e.duration as number);

    // Tiempos de carga de imágenes en esa página
    const imageTimes = events
        .filter(e => e.type === 'IMAGE_LOAD' && e.path === targetPath && e.duration)
        .map(e => ({
            name: e.details?.split('/').pop()?.split('?')[0] || 'recurso.png',
            duration: e.duration as number
        }));

    const stats = calculateStats(pageTimes);

    return {
        ...stats,
        images: imageTimes,
        count: pageTimes.length
    };
};
