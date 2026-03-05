import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

const mapPonencia = (p: any) => ({
    id: String(p.id),
    title: p.titulo,
    description: p.descripcion,
    startTime: p.dia_evento ? `${p.dia_evento.fecha}T${p.hora_inicio}` : '2026-05-10T09:00:00',
    endTime: p.dia_evento ? `${p.dia_evento.fecha}T${p.hora_fin}` : '2026-05-10T10:00:00',
    location: p.sala?.nombre || 'Pendiente',
    category: p.category || 'General',
    level: p.level || 'Básico',
    type: p.type || 'presencial',
    virtualLink: p.virtualLink,
    speaker: p.ponencia_ponente?.[0]?.ponente ? {
        name: p.ponencia_ponente[0].ponente.nombre,
        bio: p.ponencia_ponente[0].ponente.bio,
        avatar: p.ponencia_ponente[0].ponente.avatar_url || '/default-avatar.png',
        organization: p.ponencia_ponente[0].ponente.organizacion
    } : {
        name: 'Ponente por definir',
        bio: '',
        avatar: '/default-avatar.png',
        organization: ''
    }
});

// GETters
export const getPonencias = async () => {
    const data = await apiFetch('/ponencias');
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
