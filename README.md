# CONIITI 2026 - Plataforma de Gestión

Plataforma integral para la gestión del **Congreso Internacional de Innovación y Tendencias en Ingeniería (CONIITI) 2026**. Esta aplicación permite a los usuarios registrarse, inscribirse en conferencias y a los administradores gestionar ponentes, agenda y configuraciones globales.

## Guia de Ejecución.

Sigue estos pasos para poner en marcha el proyecto en tu máquina local:

### 1. Requisitos Previos
Asegúrate de tener instalado **Docker** y **Docker Compose** en tu sistema.

### 2. Comandos en el Terminal

Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
# Iniciar todos los servicios, bases de datos y Traefik (fondo)
docker-compose up -d --build
```

Una vez iniciados los contenedores, la aplicación y los servicios estarán expuestos a través de **Traefik**:

- **Frontend**: http://localhost
- **Backend/API Gateway**: http://localhost/api
- **Dashboard de Traefik**: http://localhost:8090

---

## Funcionalidades Principales
- **Panel de Control Superior**: Gestión de conferencias, invitados y papelera de reciclaje.
- **Sincronización en Tiempo Real**: Los invitados y conferencias creados en el panel aparecen automÃ¡ticamente en la pÃ¡gina de **Inicio** y **Agenda**.
- **Sistema de Temas Dinámicos**: Cambia el estilo visual de toda la web según el país (Colombia, México, Italia) desde el panel de configuración.
- **Carga Local de Fotos**: Sube imágenes de ponentes directamente desde tu ordenador sin necesidad de URLs externas.
- **Papelera de Recuperación**: Restaura conferencias eliminadas por accidente.

---

## Especificaciones Técnicas
- **Core**: React.js + TypeScript
- **Herramienta de Construcción**: Vite
- **Estilos**: CSS3 con Variables DinÃ¡micas y Shimmer Effects
- **Persistencia**: LocalStorage para simulación de base de datos activa
- **Rutas**: React Router Dom v7

---
Diseño y desarrollo orientado a la excelencia para la **Universidad Católica de Colombia**.

