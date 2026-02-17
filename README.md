# Propuesta para página web del CONIITI 2026

Aplicación web para gestionar los procesos referentes al Congreso Nacional de Ingeniería, Innovación y Tecnología de la Información de la Universidad Católica de Colombia.

## 🛠 Tecnologías

Frontend:
- React
- Vite
- Tailwind

Backend:
- Node.js
- Express

Base de datos:
- MongoDB

## 📝 Bitácora de Cambios

### [17-02-2026]
- **Componente ConferenceCard**: Se implementó la lógica de estado para el proceso de inscripción (estados: inicial, procesando, completado).
- **Diseño y UX**: 
  - Se agregaron micro-animaciones (shimmer effect) al botón de inscripción durante la carga.
  - Se implementó un feedback visual tras la inscripción exitosa (cambio de color a verde y marca de verificación).
  - Se mejoró el layout de la tarjeta para mostrar horario, lugar y ponente de forma más clara.
- **Estilos Globales**: Actualización de `style.css` con variables modernas, tipografía Montserrat/Open Sans y efectos de hover mejorados.
- **Módulo de Registro**: Se creó una nueva página de registro con:
  - Selector de rol dinámico (Estudiante, Profesor, Invitado).
  - Formulario inteligente que muestra campos específicos (como código institucional y carrera) solo para estudiantes.
  - Validación básica de campos obligatorios y diseño responsivo premium con Glassmorphism.
- **Infraestructura**: Configuración de Git con Personal Access Token y estandarización de comandos para ejecución en entornos restringidos.
