# CONIITI 2026 — Diagrama de Arquitectura de Microservicios

## 📐 Diagrama C4: System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    USUARIOS EXTERNOS                           │    │
│  │  ┌──────────────┬──────────────┬──────────────────────────┐    │    │
│  │  │  Asistentes  │  Organizadores│   Administradores        │    │    │
│  │  │  (Público)   │  (Speakers)  │   (Super Admin)          │    │    │
│  │  └──────────────┴──────────────┴──────────────────────────┘    │    │
│  └──────────────────────┬──────────────────────────────────────────┘    │
│                         │                                               │
│                         ▼ (HTTPS)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   NAVEGADOR WEB (Cliente)                      │    │
│  │                                                                │    │
│  │  React + TypeScript (Vite)                                   │    │
│  │  - Home                                                       │    │
│  │  - Agenda / Conferencias                                     │    │
│  │  - Registro / Login                                          │    │
│  │  - Perfil de Usuario                                         │    │
│  │  - Admin Panel (Solo Super Admin)                            │    │
│  │    ├─ Gestión de Usuarios                                    │    │
│  │    ├─ Gestión de Ponencias                                   │    │
│  │    ├─ Notificaciones                                         │    │
│  │    ├─ Analytics                                              │    │
│  │    └─ Configuración Global                                   │    │
│  └──────────────────────┬──────────────────────────────────────────┘    │
│                         │ HTTP REST (puerto 80/8080)                   │
│  ┌──────────────────────▼──────────────────────────────────────────┐    │
│  │               API GATEWAY (Nginx)                              │    │
│  │                                                                │    │
│  │  ┌─ /api/auth → auth-service:3001                            │    │
│  │  ├─ /api/usuarios → auth-service:3001                        │    │
│  │  ├─ /api/eventos → agenda-service:3002                       │    │
│  │  ├─ /api/ponencias → agenda-service:3002                     │    │
│  │  ├─ /api/ponentes → agenda-service:3002                      │    │
│  │  ├─ /api/inscripciones → inscription-service:3003            │    │
│  │  └─ /api/notifications → notification-service:4000            │    │
│  │                                                                │    │
│  └──────────────────────┬──────────────────────────────────────────┘    │
└──────────────┬──────────┼──────────┬───────────────┬────────────────────┘
               │          │          │               │
               ▼          ▼          ▼               ▼
         ┌─────────┐ ┌────────┐ ┌──────────┐ ┌───────────────┐
         │  Auth   │ │Agenda  │ │Inscrip.  │ │Notificació │
         │Service  │ │Service │ │Service   │ │Service        │
         │:3001    │ │:3002   │ │:3003     │ │:4000          │
         └────┬────┘ └───┬────┘ └──┬───────┘ └────┬──────────┘
              │          │        │              │
              └──────────┼────────┼──────────────┘
                         │        │
                 (HTTP)  │        │ (HTTP)
                         │        │
         ┌──────────────┬┴────────┴──────────────┐
         │              ▼                       │
         │    ┌──────────────────┐             │
         │    │   PostgreSQL     │             │
         │    │  (coniiti_main)  │             │
         │    │      :5432       │             │
         │    │                  │             │
         │    │  - users         │             │
         │    │  - eventos       │             │
         │    │  - ponencias     │             │
         │    │  - inscripciones │             │
         │    └────────┬─────────┘             │
         │             │                      │
         │             │      ┌────────────────┼──────────────┐
         │             │      │                │              │
         │    ┌────────▼────┐ │ ┌─────────────▼──┐            │
         │    │ RabbitMQ    │ │ │  PostgreSQL    │            │
         │    │  (Broker)   │ │ │ (notifications)│            │
         │    │   :5672     │ │ │    :5432       │            │
         │    │             │ │ │  (notifications_db)          │
         │    │ Exchange:   │ │ │                │            │
         │    │  events     │ │ │  - notifs      │            │
         │    │  (topic)    │ │ └────────────────┘            │
         │    │             │ │                              │
         │    │ Routing:    │ │                              │
         │    │  user.~     │ │                              │
         │    │  meeting.~  │ │                              │
         │    └──────┬──────┘ │                              │
         │           │        │                              │
         │           ▼        │                              │
    (Publish)   (Consume)     │  (Read/Write)               │
         │           │        │                              │
         └───────────┴────────┴──────────────────────────────┘
```

---

## 🔄 Diagrama de Flujo: Registro de Usuario (Secuencia de Eventos)

```
USUARIO        FRONTEND       API GW       AUTH-SERVICE     RABBITMQ      NOTIFICATION-SERVICE    POSTGRES
  │               │              │               │              │                  │                  │
  │ 1. Submit      │              │               │              │                  │                  │
  │ Register Form  │              │               │              │                  │                  │
  ├──────────────►│              │               │              │                  │                  │
  │               │ 2. POST /api/usuarios/register                │              │                  │
  │               ├─────────────►│               │              │                  │                  │
  │               │              │ 3. POST /api/usuarios/register │              │                  │
  │               │              ├──────────────►│              │                  │                  │
  │               │              │               │              │                  │                  │
  │               │              │  4. Hash password, validate   │                  │                  │
  │               │              │    Generate JWT token         │                  │                  │
  │               │              │              │              │                  │                  │
  │               │              │  5. INSERT INTO users         │                  │                  │
  │               │              │     (Database operation)      │                  │                  │
  │               │              ├─────────────────────────────────────────────────────────────────────►│
  │               │              │               │              │                  │                  │
  │               │              │  6. User inserted ✓           │                  │                  │
  │               │              │◄─────────────────────────────────────────────────────────────────────┤
  │               │              │               │              │                  │                  │
  │               │              │  7. PUBLISH event: user.registered               │                  │
  │               │              │     Payload: {userId, email, fullName}│                  │                  │
  │               │              ├──────────────┬───────────────►│                  │                  │
  │               │              │               │  Routing key: user.registered   │                  │
  │               │              │               │              │                  │                  │
  │               │              │ 8. Return JWT + 201 Created   │                  │                  │
  │               │◄─────────────┤               │              │                  │                  │
  │               │ 9. 201 Created│              │              │                  │                  │
  │◄──────────────┤ + Token       │              │              │                  │                  │
  │               │              │              │ 10. CONSUME event (routing_key=#) │                  │
  │               │              │              │                 ├────────────────►│                  │
  │               │              │              │                 │   Parse payload │                  │
  │               │              │              │                 │   Enrich data   │                  │
  │               │              │              │              │ 11. INSERT INTO notifications         │
  │               │              │              │                 ├──────────────────────────────────►│
  │               │              │              │                 │      { title: "Nuevo usuario     │
  │               │              │              │                 │        registrado"               │
  │               │              │              │                 │        message: "Se registró X  │
  │               │              │              │                 │        [usuario: id:123 | ...]" }
  │               │              │              │                 │                   │              │
  │  (5min later) │              │              │                 │ 12. ACK          │              │
  │  Admin views  │              │              │                 │◄──────────────────              │
  │  Notifications│              │              │                 │                  │              │
  │               │              │              │                 │              ✓ Row inserted     │
  │               │ GET /api/notifications                         │                  │              │
  │               ├─────────────►│               │              │                  │                  │
  │               │              │ GET /notifications (to notif-service:4000)       │                  │
  │               │              ├──────────────────────────────────────────────────┬──────────────────►│
  │               │              │               │              │                  │SELECT * FROM notifications
  │               │              │               │              │                  │ WHERE id = n.id
  │               │              │               │              │                  │◄──────────────────┤
  │               │◄─────────────┤               │              │                  │ ✓ Row found       │
  │ ✓ NOTIFICATION│ [{ title: "Nuevo ...",       │              │                  │                  │
  │   VISIBLE!    │    message: "Se registró     │              │                  │                  │
  │               │    User X [usuario: ...]",   │              │                  │                  │
  │               │    read: false }]             │              │                  │                  │
  └               └              └               └              └                  └                  └
```

---

## 🗄️ Modelo de Datos por Servicio

### **Auth Service**
```sql
TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  passwordHash VARCHAR NOT NULL,
  fullName VARCHAR,
  role ENUM ('USER', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'USER',
  career VARCHAR,
  documentNumber VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

TABLE sessions (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  token VARCHAR UNIQUE NOT NULL,
  expiresAt TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Agenda Service**
```sql
TABLE eventos (
  id UUID PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  ubicacion VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

TABLE ponencias (
  id UUID PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descripcion TEXT,
  hora_inicio TIME,
  hora_fin TIME,
  eventoId UUID REFERENCES eventos(id),
  salaId UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

TABLE ponentes (
  id UUID PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  bio TEXT,
  organizacion VARCHAR,
  email VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

TABLE ponencia_ponente (
  ponenciaId UUID REFERENCES ponencias(id),
  ponenteId UUID REFERENCES ponentes(id),
  PRIMARY KEY (ponenciaId, ponenteId)
);
```

### **Inscription Service**
```sql
TABLE inscripciones (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  ponenciaId UUID NOT NULL,
  estado ENUM ('pendiente', 'confirmada', 'asistio', 'no_asistio'),
  asistencia_confirmada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Notification Service (Base de Datos Separada)**
```sql
TABLE notifications (
  id UUID PRIMARY KEY,
  type VARCHAR NOT NULL (ej: 'user.registered', 'user.logged_in', 'meeting.user_enrolled'),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
  -- Las columnas user_id, user_email, user_full_name están EN MESSAGE como enriched text
);
```

---

## 🔌 API Gateway Routes (Nginx)

```nginx
# Current location blocks in nginx.conf:

# ✅ FUNCTIONAL (Específico):
location /api/notifications {
    proxy_pass http://notification-service:4000/notifications;
}

# ❌ BROKEN (Genérico, apunta a "mi_app:3000" que no existe):
location /api/ {
    proxy_pass http://mi_app:3000;  # ← PROBLEMA
}

# 🔧 DEBERÍA SER:
location /api/auth {
    proxy_pass http://auth-service:3001;
}
location /api/usuarios {
    proxy_pass http://auth-service:3001;
}
location /api/eventos {
    proxy_pass http://agenda-service:3002;
}
location /api/ponencias {
    proxy_pass http://agenda-service:3002;
}
location /api/ponentes {
    proxy_pass http://agenda-service:3002;
}
location /api/inscripciones {
    proxy_pass http://inscription-service:3003;
}
```

---

## 🔄 RabbitMQ Topic Exchange: Message Formats

### **Exchange:** `events`
### **Type:** `topic`
### **Durable:** `true`

#### **Routing Key:** `user.registered`
**Publisher:** auth-service  
**Consumer:** notification-service  
**Queue:** `notification_service_queue`

**Message Payload:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "fullName": "Juan Pérez García",
  "career": "Ingeniería de Sistemas",
  "documentNumber": "1234567890",
  "registeredAt": "2026-05-19T10:30:00Z",
  "role": "USER"
}
```

**Notification Creada:**
```json
{
  "id": "notif-uuid",
  "type": "user.registered",
  "title": "Nuevo usuario registrado",
  "message": "Se registró un nuevo usuario: Juan Pérez García [usuario: id:123e4567-e89b-12d3-a456-426614174000 | nombre:Juan Pérez García | email:user@example.com]",
  "createdAt": "2026-05-19T10:30:05Z",
  "read": false
}
```

---

#### **Routing Key:** `user.logged_in`
**Publisher:** auth-service  
**Consumer:** notification-service  

**Message Payload:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "loginTime": "2026-05-19T14:45:00Z",
  "ipAddress": "192.168.1.100"
}
```

---

#### **Routing Key:** `meeting.user_enrolled`
**Publisher:** inscription-service  
**Consumer:** notification-service  

**Message Payload:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "fullName": "Juan Pérez García",
  "meetingId": "event-uuid",
  "meetingTitle": "Inteligencia Artificial Aplicada",
  "enrollmentTime": "2026-05-19T15:00:00Z"
}
```

---

## 🔐 Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ (email, password)
       ▼
┌─────────────────────────────┐
│      auth-service:3001      │
│                             │
│  1. Validate credentials    │
│  2. Hash password compare   │
│  3. Generate JWT token     │
│  4. Store in Redis cache   │
│  5. Return token           │
└──────┬──────────────────────┘
       │
       │ Response: {
       │   token: "eyJhbGc...",
       │   user: { id, email, role, ... },
       │   expiresIn: 3600
       │ }
       ▼
┌──────────────────────┐
│   Frontend stores    │
│   token in session   │
└──────┬───────────────┘
       │
       │ Subsequent API calls:
       │ Header: Authorization: Bearer eyJhbGc...
       ▼
┌─────────────────────────────┐
│   Nginx/API Gateway         │
│                             │
│  1. Extract token from      │
│     Authorization header    │
│  2. Validate token format   │
│  3. Forward to service      │
└─────────────────────────────┘
```

---

## ⚡ Estado de Implementación por Componente

| Componente | Implementado | Funcional | Notas |
|-----------|--------------|-----------|-------|
| PostgreSQL (Main) | ✅ | ✅ | Contenedor healthy |
| PostgreSQL (Notif) | ✅ | ✅ | Contenedor healthy |
| Redis | ✅ | ✅ | Cache/sesiones |
| RabbitMQ | ✅ | ⚠️ | URL sin credenciales en notif-service |
| auth-service | ✅ | ✅ | Rutas funcionales |
| agenda-service | ✅ | ✅ | Rutas funcionales |
| inscription-service | ✅ | ⚠️ | Publica eventos pero puede fallar si RabbitMQ rechaza |
| notification-service | ✅ | ⚠️ | Puede no conectar a RabbitMQ |
| Nginx Gateway | ✅ | ⚠️ | /api/ route roto; /api/notifications OK |
| Frontend React | ✅ | ✅ | Llamadas API funcionan |

---



