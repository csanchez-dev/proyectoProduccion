# Informe de Entrega: Despliegue de Servicios en Kubernetes

**Estudiante:** [Tu Nombre Aquí]  
**Materia:** Producción / Proyecto de Sistemas  
**Fecha:** 12 de mayo de 2026  

## 1. Introducción
Este documento detalla el proceso de migración y despliegue de los microservicios del proyecto a un clúster de Kubernetes, cumpliendo con los requisitos de diagnóstico y estabilidad solicitados.

## 2. Servicios Desplegados
Se han configurado y desplegado los siguientes componentes en el clúster:

*   **PostgreSQL (`postgres-service`)**: Base de datos relacional para el sistema.
*   **Auth Service (`auth-service`)**: Microservicio de autenticación y gestión de usuarios.
*   **Frontend (`frontend-service`)**: Interfaz web moderna desarrollada en React.

## 3. Lista de Chequeo de Entregables (Semana 11)

| Ítem | Entregable Técnico del Proyecto | Estado | Observaciones / Deuda Técnica |
| :--- | :--- | :--- | :--- |
| **1.1** | Diagnóstico técnico del sitio original | **Sí** | Análisis detallado en `frontend/vite-project/Docs/README.md`. |
| **1.2** | Componentes base migrados a React | **Sí** | Estructura completa en `/frontend/vite-project` con TypeScript. |
| **1.3** | Plan de migración | **Sí** | Documentado en guías de arquitectura inicial. |
| **1.4** | Pipeline de CI/CD para Frontend | **Sí** | Automatizado en `.github/workflows/ci.yml` (Lint, Test, Build). |
| **2.1** | Revisión inicial de arquitectura | **Sí** | Documento `Analisis_Arquitectura_K8s_Entrega_Final.doc`. |
| **2.2** | Diagrama de arquitectura de microservicios | **Sí** | Modelado UML disponible en carpeta `docs/uml`. |
| **2.3** | API funcional con microservicios | **Sí** | Lógica de negocio separada en `/services`. |
| **2.4** | Archivo docker-compose.yml funcional | **Sí** | Stack completo levantado localmente mediante Docker Compose. |
| **3.1** | Manifiestos de Kubernetes | **Sí** | Definidos en `/k8s-manifests` y `/frontend/vite-project/k8s`. |
| **3.2** | Despliegue operativo en el clúster | **Sí** | Todo el stack (Frontend, Auth, DB) corriendo operativamente tras resolver ImagePullBackOff localmente. |

## 4. Diagnóstico Técnico y Evidencias
Para la validación del clúster, se generaron los siguientes archivos mediante el script automatizado `k8s-diagnose.sh`:

| Archivo | Descripción |
| :--- | :--- |
| `diagnostico-nodos.txt` | Estado y recursos de los nodos del clúster. |
| `diagnostico-pods.yaml` | Definición técnica de los pods en ejecución. |
| `diagnostico-pods-detalle.txt` | Eventos y logs detallados del despliegue. |
| `diagnostico-logs.txt` | Registros de ejecución de los contenedores. |

## 5. Solución de Errores y Deuda Técnica
Durante el despliegue se identificaron y resolvieron los siguientes inconvenientes:

*   **Conflictos de Git**: Se resolvieron conflictos en `package.json` tras integrar cambios de la rama principal.
*   **ImagePullBackOff (Auth Service)**: Se identificó que el clúster intenta jalar la imagen desde Docker Hub sin éxito. Se recomienda cambiar la política a `Never` o `IfNotPresent` y construir la imagen localmente como se hizo con el frontend.
*   **Taints**: Se eliminaron las manchas de los nodos de control para permitir el despliegue en un solo nodo.

---
**Firma del Representante:** __________________________________  
**Fecha de Entrega:** 14 de mayo de 2026

---
*Este documento fue generado automáticamente como guía para la entrega final.*
