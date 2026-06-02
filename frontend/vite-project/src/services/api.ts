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

// Local storage on server (repo-local storage helper)
export const getLocalStorageKey = async (key: string) => {
    try {
        const res = await apiFetch(`/local-storage/${key}`);
        return res?.value ?? null;
    } catch (err) {
        return null;
    }
};

export const postLocalStorageKey = async (key: string, data: any) => {
    return apiFetch(`/local-storage/${key}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

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

const getEmailConfig = () => {
    const recipients = localStorage.getItem('email_recipient_list');
    return {
        senderAddress: localStorage.getItem('email_sender_address') || 'no-reply@coniiti.edu.co',
        senderName: localStorage.getItem('email_sender_name') || 'CONIITI',
        credentialKey: localStorage.getItem('email_credentials_key') || '',
        recipients: recipients ? JSON.parse(recipients) : []
    };
};

export const formatEmailTemplate = (template: string, values: Record<string, string>) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
};

export const getEmailTemplate = (key: string, defaultValue: string) => {
    return localStorage.getItem(key) || defaultValue;
};

export const sendEmailNotification = async (to: string, subject: string, body: string, options?: { cc?: string[]; bcc?: string[] }) => {
    const emailConfig = getEmailConfig();
    try {
        const savedEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
        const emails = Array.isArray(savedEmails) ? savedEmails : [];
        emails.push({
            id: Date.now().toString(),
            from: `${emailConfig.senderName} <${emailConfig.senderAddress}>`,
            to,
            subject,
            body,
            cc: options?.cc || [],
            bcc: options?.bcc || [],
            config: {
                credentialKey: emailConfig.credentialKey,
                recipients: emailConfig.recipients
            },
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('sent_emails', JSON.stringify(emails));
        console.log(`[Email simulado] Enviado a ${to}: ${subject}`, { body, from: emailConfig.senderAddress, cc: options?.cc, bcc: options?.bcc });
    } catch (err) {
        console.warn('No se pudo guardar el email simulado:', err);
    }
};

export const sendTemplatedEmail = async (to: string, subjectTemplate: string, bodyTemplate: string, values: Record<string, string>) => {
    const subject = formatEmailTemplate(subjectTemplate, values);
    const body = formatEmailTemplate(bodyTemplate, values);
    return sendEmailNotification(to, subject, body);
};

// AUTH Helpers
export const signUp = (email: string, pass: string) => supabase.auth.signUp({ email, password: pass });
export const signIn = (email: string, pass: string) => supabase.auth.signInWithPassword({ email, password: pass });
export const signOut = () => supabase.auth.signOut();
export const resetPassword = (email: string) => supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/actualizar-password`,
});
export const updatePassword = (newPassword: string) => supabase.auth.updateUser({ password: newPassword });
