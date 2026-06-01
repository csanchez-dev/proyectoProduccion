# Análisis Exhaustivo de los 4 Entregables del Proyecto CONIITI 2026

**Fecha actualización:** Mayo 19, 2026  
**Estado General:** ⚠️ **PARCIAL** - Funciona, pero con faltantes de integración.

---

## 📋 Tabla de Contenidos
1. Revisión Inicial de Arquitectura de Microservicios
2. Diagrama de Arquitectura de Microservicios (Eventos, Comités, Usuarios)
3. API Funcional (REST) con Endpoints para Gestión, Registro y Noticias
4. Docker-compose.yml Que Levanta el Stack Completo

---

## 1. ✅ Revisión Inicial de Arquitectura de Microservicios

### 1.1 Descripción General
El proyecto implementa una **arquitectura de microservicios basada en Express.js + TypeScript** con los siguientes servicios principales:

#### Servicios Implementados:

| Servicio | Puerto | Base de Datos | Stack | Dependencias |
|----------|--------|---------------|-------|--------------|
| **auth-service** | 3001 | PostgreSQL (coniiti_main) | Express.js + Prisma | Redis, RabbitMQ |
| **agenda-service** | 3002 | PostgreSQL (coniiti_main) | Express.js | — |
| **inscription-service** | 3003 | PostgreSQL (coniiti_main) | Express.js | RabbitMQ |
| **notification-service** | 4000 | PostgreSQL (notifications_db) | Express.js | RabbitMQ |
| **API Gateway** | 8080 (80) | — | Nginx | — |
| **Frontend** | 5173 | LocalStorage/Supabase | React + Vite + TypeScript | — |

### 1.2 Topología de Red
```
┌────────────────────────────────────────────────────┐
│                    CLIENTE (5173)                  │
│              React + TypeScript + Vite             │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   API Gateway (Nginx)  │
        │    Puerto 80/8080      │
        └─┬──────────────────────┘
          │
  ┌───────┼─────────────────────────────────────┐
  ▼       ▼          ▼            ▼             ▼
┌─────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐
│Auth │ │ Agenda  │ │ Inscripción│Notificación│ │    RabbitMQ    │
│3001 │ │  3002   │ │    3003  │ │    4000    │ │   (Eventos)    │
└┬────┘ └────┬────┘ └────┬─────┘ └──────┬─────┘ └────────────────┘
 │           │           │              │
 └───────────┼───────────┼──────────────┘
             ▼
        ┌────────────────────────┐
        │  PostgreSQL (Principal) │
        │   + PostgreSQL (Notif)  │
        │      + Redis (Cache)    │
        └────────────────────────┘
```

### 1.3 Comunicación Entre Servicios
- **Síncrona:** HTTP REST (a través de Nginx gateway)
- **Asíncrona:** RabbitMQ (para eventos de registro, login, inscripción)
- **Cache/Sesiones:** Redis
- **Persistencia:** PostgreSQL (dos instancias)

### 1.4 Patrones Implementados
✅ **IMPLEMENTED:**
- Event-Driven Architecture (RabbitMQ)
- API Gateway Pattern (Nginx)
- Database per Service (Notification tiene su propia DB)
- Health Checks en cada microservicio

❌ **NOT IMPLEMENTED:**
- Service mesh (Istio)
- Circuit breakers
- API rate limiting
- Centralized logging (parcial: Loki config existe pero no está integrada)

---

## 2. 📊 Diagrama de Arquitectura de Microservicios

### 2.1 Archivo de Diagrama Existente
📁 **Ubicación:** `/docs/uml/diagrama_clases.png`  
✅ **Estado:** Existe diagrama UML de clases

⚠️ **Falta:** Diagrama de arquitectura de **microservicios/eventos/comités** desactualizado o no documentado en repo.

### 2.2 Recomendación: Crear Documentación de Arquitectura

**ACCIONES NECESARIAS:**
1. **Crear diagrama visual** de flujo de eventos (sequence diagram):
   - Usuario → Frontend → API Gateway → Auth/Agenda/Inscription → RabbitMQ → Notification
   
2. **Documentar esquema de datos** por servicio:
   - Auth: usuarios, sesiones
   - Agenda: eventos, ponencias, ponentes
   - Inscription: inscripciones, asistencia
   - Notification: notificaciones

3. **Documentar decisiones arquitectónicas** (ADR):
   - Por qué RabbitMQ y no Kafka
   - Por qué PostgreSQL y no NoSQL
   - Por qué Nginx y no Kong/AWS API Gateway

---

## 3. ✅ API Funcional (REST) con Endpoints para Gestión, Registro y Noticias

### 3.1 Resumen de Endpoints por Servicio

#### **Auth Service** (Puertos 3001 → Nginx /api/auth, /api/usuarios)
```
POST   /api/auth/login                    → Inicio de sesión
GET    /api/auth/me                       → Perfil del usuario autenticado
POST   /api/usuarios/register             → Registro de nuevo usuario
GET    /api/usuarios/me                   → Obtener mi perfil
PUT    /api/usuarios/me                   → Actualizar mi perfil
GET    /api/usuarios/                     → Listar todos los usuarios (solo admins)
GET    /health                            → Health check
```

#### **Agenda Service** (Puerto 3002 → Nginx /api/eventos, /api/ponencias, /api/ponentes)
```
GET    /api/eventos                       → Listar eventos
POST   /api/eventos                       → Crear evento (requiere auth)
GET    /api/ponencias                     → Listar ponencias (conferencias)
POST   /api/ponencias                     → Crear ponencia (requiere auth)
DELETE /api/ponencias/:id                 → Eliminar ponencia
PUT    /api/ponencias/:id                 → Actualizar ponencia
GET    /api/ponentes                      → Listar ponentes
POST   /api/ponentes                      → Crear ponente (requiere auth)
GET    /health                            → Health check
```

#### **Inscription Service** (Puerto 3003 → Nginx /api/inscripciones)
```
POST   /api/                              → Inscribirse a evento (requiere auth)
GET    /api/mis-inscripciones             → Obtener mis inscripciones
PATCH  /api/:id/asistencia                → Marcar asistencia
GET    /health                            → Health check
```

#### **Notification Service** (Puerto 4000 → Nginx /api/notifications)
```
GET    /notifications                     → Listar todas las notificaciones
GET    /notifications/unread              → Listar notificaciones no leídas
POST   /notifications                     → Crear notificación (llamada interna)
PATCH  /notifications/:id/read            → Marcar notificación como leída
GET    /health                            → Health check
```

### 3.2 Flujo de Eventos (Message Queue)

#### RabbitMQ Exchange: `events` (topic)

| Routing Key | Producer | Consumer | Acción |
|------------|----------|----------|--------|
| `user.registered` | auth-service | notification-service | Crear notificación: "Nuevo usuario registrado" |
| `user.logged_in` | auth-service | notification-service | Crear notificación: "Usuario inició sesión" |
| `meeting.user_enrolled` | inscription-service | notification-service | Crear notificación: "Usuario inscrito a reunión" |

### 3.3 Status de Funcionalidad API

| Endpoint | Estado | Notas |
|----------|--------|-------|
| Login/Registro | ✅ Funciona | Usa JWT + Supabase |
| Crear Ponencia | ✅ Funciona | Integrado con DB |
| Listar Eventos | ✅ Funciona | Con fallback a mocks |
| Inscripción | ✅ Funciona | Publica evento en RabbitMQ |
| Notificaciones | ⚠️ Parcial | Recibe eventos pero tabla puede estar vacía |
| Health Checks | ✅ Funciona | Todos los servicios responden /health |

### 3.4 Ejemplo de Flujo Completo de Registro

```
1. Usuario hace POST /api/usuarios/register
   ↓
2. auth-service valida y guarda en DB
   ↓
3. auth-service publica evento "user.registered" en RabbitMQ
   ↓
4. notification-service consume evento
   ↓
5. notification-service persiste notificación en notifications_db
   ↓
6. Frontend hace GET /api/notifications
   ↓
7. Superadmin ve la notificación: "Se registró Usuario X [id:123 | email:x@y.com]"
```

### 3.5 Problemas Detectados

❌ **Problema 1: Credenciales RabbitMQ incompletas**
- `notification-service` env: `RABBITMQ_URL: amqp://rabbitmq:5672` (sin credenciales)
- Otros servicios: `RABBITMQ_URL: amqp://user:password@rabbitmq:5672` (con credenciales)
- **Impacto:** notification-service puede fallar al conectar si RabbitMQ requiere autenticación

❌ **Problema 2: Nginx routing incompleto**
- Línea 40 en `nginx.conf` apunta a `http://mi_app:3000` (no existe)
- **Impacto:** Rutas de auth/agenda/inscription pueden no ser alcanzables desde frontend

❌ **Problema 3: Tabla de notificaciones puede estar vacía**
- No hay migración SQL documentada
- No hay inicialización de datos de prueba
- **Impacto:** Apartado de "notificaciones" en Admin aparece vacío por defecto

❌ **Problema 4: Desincronización entre tipos de datos**
- Algunos payloads usan `userId`, otros `user_id`, otros `user.id`
- **Impacto:** Consumer no siempre parsea correctamente la información de usuario

---

## 4. ✅ Docker-compose.yml que Levanta el Stack Completo

### 4.1 Análisis del Archivo

📁 **Ubicación:** `/backend/docker_compose.yml`

✅ **Presente en el archivo:**
- ✅ PostgreSQL principal (puerto 5432)
- ✅ PostgreSQL para notificaciones (puerto 5437)
- ✅ Redis (puerto 6379)
- ✅ RabbitMQ con UI management (puertos 5673:5672 y 15673:15672)
- ✅ auth-service (contenedor coniiti-auth)
- ✅ agenda-service (contenedor coniiti-agenda)
- ✅ inscription-service (contenedor coniiti-inscription)
- ✅ notification-service (contenedor coniiti-notification)
- ✅ API Gateway (Nginx en puertos 80/8080)
- ✅ Frontend (Nginx en puerto 5173)

✅ **Características de Resiliencia:**
- Health checks en BD y servicios
- Restart: unless-stopped
- Volumes para persistencia de datos
- Redes privadas (coniiti-net)

### 4.2 Problemas en docker-compose.yml

⚠️ **Problema 1: Credenciales RabbitMQ inconsistentes**
```yaml
# CORRECTO (auth-service):
RABBITMQ_URL: amqp://user:password@rabbitmq:5672

# INCORRECTO (notification-service):
RABBITMQ_URL: amqp://rabbitmq:5672  # ← Falta credenciales
```

⚠️ **Problema 2: Frontend mapeo incorrecto**
```yaml
frontend-app:
  build: ../frontend/vite-project
  ports:
    - "5173:80"  # ← Mapea puerto 5173 a puerto 80 del contenedor
                 # pero el Vite dev server usa 5173 internamente
```

⚠️ **Problema 3: Nginx gateway con rutas incorrectas**
```nginx
# En nginx.conf línea 40:
location /api/ {
    proxy_pass http://mi_app:3000;  # ← Servicio "mi_app" no existe
}
```

⚠️ **Problema 4: Variables de entorno faltantes en servicios**
- `auth-service` y `agenda-service` no tienen puerto configurado explícitamente
- Asumen puertos por defecto (3001, 3002, etc.) pero no están documentados en el archivo

### 4.3 Comandos para Usar Docker-compose

```bash
# Levantar todo el stack
cd /Users/samuelpreciado/PycharmProjects/proyectoProduccion/backend
docker-compose -f docker_compose.yml up -d

# Levantar servicios específicos
docker-compose -f docker_compose.yml up -d rabbitmq notification-postgres notification-service

# Ver logs en tiempo real
docker-compose -f docker_compose.yml logs -f notification-service

# Detener todo
docker-compose -f docker_compose.yml down

# Limpiar volúmenes (CUIDADO: borra datos)
docker-compose -f docker_compose.yml down -v
```

### 4.4 Puertos Expuestos

| Servicio | Puerto Interno | Puerto Host | Propósito |
|----------|---|---|---|
| PostgreSQL Principal | 5432 | 5432 | BD principal para auth/agenda/inscription |
| PostgreSQL Notificaciones | 5432 | 5437 | BD para notificaciones |
| Redis | 6379 | 6379 | Cache y sesiones |
| RabbitMQ AMQP | 5672 | 5673 | Broker de mensajería |
| RabbitMQ Management UI | 15672 | 15673 | UI admin para ver colas/exchanges |
| Nginx API Gateway | 80 | 80 / 8080 | Enrutador de APIs |
| Frontend | 5173 | 5173 | Interfaz React |

---

## 📝 Problemas Críticos Detectados

### 🔴 **CRÍTICO 1: Conexión RabbitMQ en notification-service**
- **Causa:** `RABBITMQ_URL: amqp://rabbitmq:5672` sin credenciales (user:password)
- **Impacto:** El servicio de notificaciones no puede conectar si RabbitMQ requiere autenticación
- **Solución:** Cambiar a `amqp://user:password@rabbitmq:5672`

### 🔴 **CRÍTICO 2: Nginx routing para /api/**
- **Causa:** Línea 40 en `nginx.conf` apunta a `hthttp://mi_app:3000` (inexistente)
- **Impacto:** Las rutas generales `/api/` no llegan a los microservicios
- **Solución:** Cambiar a proxy_pass a los servicios correctos (auth, agenda, etc.)

### 🟡 **ALTO 3: Tabla de notificaciones vacía**
- **Causa:** No hay mecanismo de publicación de eventos de prueba
- **Impacto:** Apartado de notificaciones en Admin muestra "No hay notificaciones"
- **Solución:** Enriquecer el consumer para capturar datos de usuario y mostrar en UI

### 🟡 **ALTO 4: Falta diagrama de arquitectura de microservicios**
- **Causa:** Solo existe diagrama UML de clases, no de infraestructura
- **Impacto:** Difícil entender cómo interactúan los servicios
- **Solución:** Crear diagrama de arquitectura (C4, ArchiMate, o Miro)

---

## ✅ Tabla de Conclusión de Entregables

| Entregable | Estado | Completitud | Acciones Requeridas |
|-----------|--------|-------------|-------------------|
| **2.1 Revisión Inicial de Arquitectura** | ✅ | 85% | Falta documentar decisiones arquitectónicas |
| **2.2 Diagrama de Arquitectura** | ⚠️ | 20% | **CREAR** diagrama de microservicios/eventos |
| **2.3 API Funcional (REST)** | ✅ | 90% | Corregir Nginx routing; enriquecer payloads de eventos |
| **2.4 Docker-compose Stack** | ⚠️ | 75% | Corregir credenciales RabbitMQ; actualizar env vars |

---

## 🚀 Siguientes Pasos Recomendados (Prioridad)

### INMEDIATO (Hoy):
1. ✅ **Corregir credenciales RabbitMQ en notification-service**
   - Cambiar `amqp://rabbitmq:5672` → `amqp://user:password@rabbitmq:5672`
   - Reiniciar contenedor

2. ✅ **Corregir Nginx routing en /api/ catch-all**
   - Cambiar `proxy_pass http://mi_app:3000;` a rutas específicas
   - Mapear /api/eventos, /api/usuarios, /api/inscripciones, etc.

3. ✅ **Enriquecer payloads de eventos RabbitMQ**
   - Asegurar que auth-service envíe `{ userId, email, fullName }`
   - Verificar que notification-service parsea correctamente

### CORTO PLAZO (Esta semana):
4. 📊 **Crear diagrama de arquitectura de microservicios**
   - Usar Lucidchart, Draw.io, o Miro
   - Documentar flujo de eventos, BD, y dependencias

5. 📚 **Crear doc ADR (Architecture Decision Records)**
   - Explicar por qué cada tecnología (RabbitMQ, PostgreSQL, etc.)

6. 🧪 **Implementar tests de integración**
   - Verificar flujo completo: registro → evento → notificación

### MEDIANO PLAZO (Próximas semanas):
7. 🔐 **Agregar rate limiting y circuit breaker**
8. 📊 **Activar logging centralizado (Loki + Grafana)**
9. 🔍 **Implementar tracing distribuido (Jaeger)**

---

## 📎 Archivos Referenciados

- ✅ `/backend/docker_compose.yml` — 181 líneas
- ✅ `/backend/nginx/nginx.conf` — 61 líneas
- ✅ `/services/auth-service/src/routes/auth.routes.ts`
- ✅ `/services/agenda-service/src/routes/evento.routes.ts`
- ✅ `/services/inscription-service/src/routes/inscripcion.routes.ts`
- ✅ `/notification-service/src/consumers/rabbitConsumer.ts`
- ✅ `/frontend/vite-project/src/pages/Admin.tsx` — 4161 líneas
- ✅ `/docs/uml/diagrama_clases.png`

---



