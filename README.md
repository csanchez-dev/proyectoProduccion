# CONIITI 2026 - Plataforma de Gestión

Plataforma integral para la gestión del **Congreso Internacional de Innovación y Tendencias en IngenierÃ­a (CONIITI) 2026**. Esta aplicación permite a los usuarios registrarse, inscribirse en conferencias y a los administradores gestionar ponentes, agenda y configuraciones globales.

## ðŸš€ GuÃ­a de Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu mÃ¡quina local:

### 1. Requisitos Previos
AsegÃºrate de tener instalado **Node.js** (v16+) en tu sistema.

### 2. Comandos en el Terminal

Abre tu terminal (PowerShell, CMD o Bash) en la raÃ­z del proyecto y ejecuta:

```powershell
# Entrar a la carpeta del código
cd vite-project

# Instalar las librerÃ­as necesarias
npm install

# Iniciar el servidor local
npm run dev
```

Una vez iniciado, abre la URL que aparece en pantalla (normalmente `http://localhost:5173`).

---

## âœ¨ Funcionalidades Principales

- **Panel de Control Superior**: Gestión de conferencias, invitados y papelera de reciclaje.
- **Sincronización en Tiempo Real**: Los invitados y conferencias creados en el panel aparecen automÃ¡ticamente en la pÃ¡gina de **Inicio** y **Agenda**.
- **Sistema de Temas DinÃ¡micos**: Cambia el estilo visual de toda la web segÃºn el paÃ­s (Colombia, MÃ©xico, Italia) desde el panel de configuración.
- **Carga Local de Fotos**: Sube imÃ¡genes de ponentes directamente desde tu ordenador sin necesidad de URLs externas.
- **Papelera de Recuperación**: Restaura conferencias eliminadas por accidente.

---

## ðŸ›  Especificaciones TÃ©cnicas
- **Core**: React.js + TypeScript
- **Herramienta de Construcción**: Vite
- **Estilos**: CSS3 con Variables DinÃ¡micas y Shimmer Effects
- **Persistencia**: LocalStorage para simulación de base de datos activa
- **Rutas**: React Router Dom v7

---
Diseño y desarrollo orientado a la excelencia para la **Universidad Católica de Colombia**.

