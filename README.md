# CONIITI 2026 - Plataforma de Gestión

Plataforma integral para la gestión del **Congreso Internacional de Innovación y Tendencias en Ingeniería (CONIITI) 2026**. Esta aplicación permite a los usuarios registrarse, inscribirse en conferencias y a los administradores gestionar ponentes, agenda y configuraciones globales.

## 🚀 Guía de Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu máquina local:

### 1. Requisitos Previos
Asegúrate de tener instalado **Node.js** (v16+) en tu sistema.

### 2. Comandos en el Terminal

Abre tu terminal (PowerShell, CMD o Bash) en la raíz del proyecto y ejecuta:

```powershell
# Entrar a la carpeta del código
cd vite-project

# Instalar las librerías necesarias
npm install

# Iniciar el servidor local
npm run dev
```

Una vez iniciado, abre la URL que aparece en pantalla (normalmente `http://localhost:5173`).

---

## 🔐 Cuentas de Administrador (Super Usuarios)

Para probar las funciones de gestión avanzada, utiliza estas credenciales en la pestaña de **Acceso (Login)**:

| Usuario | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Súper Usuario 1** | `superadmin@coniiti.com` | `super123` | **Acceso Total**: Configuración de temas, banner y gestión total. |
| **Súper Usuario 2** | `admin@coniiti.com` | `admin12` | **Gestor**: Agenda, invitados y papelera. |

---

## ✨ Funcionalidades Principales

- **Panel de Control Superior**: Gestión de conferencias, invitados y papelera de reciclaje.
- **Sincronización en Tiempo Real**: Los invitados y conferencias creados en el panel aparecen automáticamente en la página de **Inicio** y **Agenda**.
- **Sistema de Temas Dinámicos**: Cambia el estilo visual de toda la web según el país (Colombia, México, Italia) desde el panel de configuración.
- **Carga Local de Fotos**: Sube imágenes de ponentes directamente desde tu ordenador sin necesidad de URLs externas.
- **Papelera de Recuperación**: Restaura conferencias eliminadas por accidente.

---

## 🛠 Especificaciones Técnicas
- **Core**: React.js + TypeScript
- **Herramienta de Construcción**: Vite
- **Estilos**: CSS3 con Variables Dinámicas y Shimmer Effects
- **Persistencia**: LocalStorage para simulación de base de datos activa
- **Rutas**: React Router Dom v7

---
Diseño y desarrollo orientado a la excelencia para la **Universidad Católica de Colombia**.

ejecucion: 
cd vite-project
npm install
npm run dev