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
