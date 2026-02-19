export type Language = 'es' | 'en';

export const translations = {
    es: {
        nav_home: "Inicio",
        nav_guests: "Invitados",
        nav_agenda: "Agenda",
        nav_about: "Acerca de",
        nav_contact: "Contacto",
        nav_config: "Configuración",
        nav_profile: "Mi Perfil",
        nav_logout: "Cerrar Sesión",
        nav_login: "Inicia Sesión / Regístrate",
        footer_copy: "© CONIITI 2026",
        admin_title: "Panel de Gestión Superior",
        admin_role_super: "Super Usuario 1: Acceso Total",
        admin_role_content: "Super Usuario 2: Gestión de Contenido",
        admin_sidebar_agenda: "📋 Agenda de Conferencias",
        admin_sidebar_guests: "👥 Listado de Invitados",
        admin_sidebar_trash: "🗑️ Papelera",
        admin_sidebar_analytics: "📈 Análisis de Datos",
        admin_sidebar_settings: "⚙️ Configuración de Página",
        register_title: "Crea tu Cuenta",
        register_login_tab: "Iniciar Sesión",
        register_create_tab: "Crear Cuenta",
        register_gender: "Género",
        register_gender_male: "Masculino",
        register_gender_female: "Femenino",
        register_gender_other: "Otro / Prefiero no decirlo",
        register_submit: "Registrarse",
        login_submit: "Entrar"
    },
    en: {
        nav_home: "Home",
        nav_guests: "Guests",
        nav_agenda: "Agenda",
        nav_about: "About Us",
        nav_contact: "Contact",
        nav_config: "Configuration",
        nav_profile: "My Profile",
        nav_logout: "Logout",
        nav_login: "Login / Register",
        footer_copy: "© CONIITI 2026",
        admin_title: "Superior Management Panel",
        admin_role_super: "Super User 1: Total Access",
        admin_role_content: "Super User 2: Content Management",
        admin_sidebar_agenda: "📋 Conference Agenda",
        admin_sidebar_guests: "👥 Guest List",
        admin_sidebar_trash: "🗑️ Trash",
        admin_sidebar_analytics: "📈 Data Analytics",
        admin_sidebar_settings: "⚙️ Page Settings",
        register_title: "Create your Account",
        register_login_tab: "Login",
        register_create_tab: "Create Account",
        register_gender: "Gender",
        register_gender_male: "Male",
        register_gender_female: "Female",
        register_gender_other: "Other / Prefer not to say",
        register_submit: "Register",
        login_submit: "Login"
    }
};

export const getTranslation = (key: keyof typeof translations.es, lang: Language) => {
    return translations[lang][key] || translations.es[key];
};
