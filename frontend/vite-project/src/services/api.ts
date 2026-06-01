import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'test';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Intentar obtener la sesión para el token
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }


    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    return response.json();
};

const mapPonencia = (p: any) => {
    // La API devuelve: ponentes (array de PonenciaPonente con ponente incluido),
    // diaEventoId (string directo, ej: "day1"), diaEvento (objeto con id y fecha)
    const primerPonente = p.ponentes?.[0]?.ponente ?? null;
    return {
        id: String(p.id),
        title: p.titulo,
        description: p.descripcion,
        startTime: p.hora_inicio || '09:00',
        endTime: p.hora_fin || '10:00',
        location: p.sala?.nombre || 'Pendiente',
        category: p.category || 'General',
        level: p.level || 'Básico',
        type: p.type || 'presencial',
        virtualLink: p.virtualLink,
        // diaEventoId viene directamente como "day1", "day2", etc.
        dayId: p.diaEventoId || p.diaEvento?.id || 'day1',
        speaker: primerPonente ? {
            name: `${primerPonente.nombres ?? ''} ${primerPonente.apellidos ?? ''}`.trim() || 'Ponente por definir',
            bio: primerPonente.biografia ?? '',
            avatar: primerPonente.avatar_url || '/default-avatar.png',
            organization: primerPonente.organizacion ?? ''
        } : {
            name: 'Ponente por definir',
            bio: '',
            avatar: '/default-avatar.png',
            organization: ''
        }
    };
};

// GETters
export const getPonencias = async () => {
    const data = await apiFetch('/ponencias');
    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Sin datos en la API, usando fallback local');
    }
    return data.map(mapPonencia);
};

export const getEventos = () => apiFetch('/eventos');
export const getPonentes = () => apiFetch('/ponentes');
export const getUsuarios = () => apiFetch('/usuarios');

// POSTers (Guardado)
export const createPonencia = (data: any) => apiFetch('/ponencias', {
    method: 'POST',
    body: JSON.stringify(data)
});

export const createPonente = (data: any) => apiFetch('/ponentes', {
    method: 'POST',
    body: JSON.stringify(data)
});

export const deletePonencia = (id: string) => apiFetch(`/ponencias/${id}`, {
    method: 'DELETE'
});

export const updatePonencia = (id: string, data: any) => apiFetch(`/ponencias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});

export const createEvento = (data: any) => apiFetch('/eventos', {
    method: 'POST',
    body: JSON.stringify(data)
});


export const createPerfil = (data: any) => apiFetch('/usuarios/perfil', {
    method: 'POST',
    body: JSON.stringify(data)
});

export const updatePerfil = (data: any) => apiFetch('/usuarios/perfil', {
    method: 'PUT',
    body: JSON.stringify(data)
});

export const register = (data: any) => apiFetch('/usuarios/register', {
    method: 'POST',
    body: JSON.stringify(data)
});


// AUTH Helpers
export const signUp = (email: string, pass: string) => supabase.auth.signUp({ email, password: pass });
export const signIn = (email: string, pass: string) => supabase.auth.signInWithPassword({ email, password: pass });
export const signOut = () => supabase.auth.signOut();
export const resetPassword = (email: string) => supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/actualizar-password`,
});
export const updatePassword = (newPassword: string) => supabase.auth.updateUser({ password: newPassword });
