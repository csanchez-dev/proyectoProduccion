# 🚀 GUÍA COMPLETA DE EJECUCIÓN - CONIITI 2026

**Última actua lización:** Mayo 19, 2026  
**Versión:** 1.0  
**Estado de Entregables:** ✅ Completado (con fixes aplicados)

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Ejecución del Stack Completo](#ejecución-del-stack-completo)
4. [Verificación de Funcionamiento](#verificación-de-funcionamiento)
5. [Troubleshooting](#troubleshooting)
6. [Comandos Útiles](#comandos-útiles)

---

## ✅ Requisitos Previos

### Software Requerido
- **Docker** 20.10+ y **Docker Compose** 2.0+
- **Node.js** 18+ (si ejecutas servicios localmente sin Docker)
- **Git** (para clonar el repositorio)
- **Navegador web** moderno (Chrome, Firefox, Safari)

### Verificar Instalación
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js
node --version
npm --version
```

---

## 📂 Estructura del Proyecto

```
proyectoProduccion/
├── backend/                           # Microservicios + API Gateway
│   ├── docker_compose.yml             # ✅ CORREGIDO: Credenciales RabbitMQ
│   ├── nginx/
│   │   └── nginx.conf                 # ✅ CORREGIDO: Rutas API
│   ├── services/
│   │   ├── auth-service/              # Auth + Usuarios
│   │   ├── agenda-service/            # Eventos, Ponencias, Ponentes
│   │   └── inscription-service/       # Inscripciones y Asistencia
│   └── Dockerfile(s)
│
├── notification-service/              # Servicio de Notificaciones
│   ├── src/
│   │   ├── consumers/
│   │   │   └── rabbitConsumer.ts      # ✅ ACTUALIZADO: Enriquecer payloads
│   │   ├── controllers/
│   │   ├── services/
│   │   └── ...
│   └── Dockerfile
│
├── frontend/
│   └── vite-project/                  # React + TypeScript (Vite)
│       ├── src/
│       ├── package.json
│       └── Dockerfile
│
├── docs/
│   └── uml/
│       └── diagrama_clases.png        # Diagrama UML
│
├── ANALISIS_ENTREGABLES.md            # ✅ NUEVO: Análisis completo
├── DIAGRAMA_ARQUITECTURA_MICROSERVICIOS.md  # ✅ NUEVO: Arquitectura detallada
└── GUIA_EJECUCION.md                  # Este archivo
```

---

## 🐳 Ejecución del Stack Completo

### Opción A: Docker Compose (RECOMENDADO)

#### 1. Clonar y navegar al proyecto
```bash
cd /Users/samuelpreciado/PycharmProjects/proyectoProduccion/backend
```

#### 2. Crear archivo `.env` (si no existe)
```bash
# Crear .env con variables de entorno
cat > .env << 'EOF'
DB_USER=coniiti_user
DB_PASSWORD=coniiti_pass
POSTGRES_USER=coniiti_user
POSTGRES_PASSWORD=coniiti_pass
EOF
```

#### 3. Levantar el stack completo
```bash
# Ver todas las imágenes que se van a construir
docker-compose -f docker_compose.yml config

# Levantar todo (toma ~2-3 minutos la primera vez)
docker-compose -f docker_compose.yml up -d

# Verificar que todos los contenedores estén corriendo
docker-compose -f docker_compose.yml ps
```

**Salida esperada:**
```
NAME                      STATUS            PORTS
coniiti-postgres          Up (healthy)      0.0.0.0:5432->5432/tcp
coniiti-notification-postgres  Up (healthy)  0.0.0.0:5437->5432/tcp
coniiti-redis             Up (healthy)      0.0.0.0:6379->6379/tcp
coniiti-rabbitmq          Up (healthy)      0.0.0.0:5673->5672/tcp, 0.0.0.0:15673->15672/tcp
coniiti-auth              Up (healthy)      3001/tcp
coniiti-agenda            Up (healthy)      3002/tcp
coniiti-inscription       Up (healthy)      3003/tcp
coniiti-notification      Up (healthy)      4000/tcp
coniiti-nginx             Up                0.0.0.0:80->80/tcp, 0.0.0.0:8080->80/tcp
coniiti-frontend          Up                0.0.0.0:5173->80/tcp
```

#### 4. Acceder a las aplicaciones

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación React |
| **RabbitMQ Management** | http://localhost:15673 | Admin de colas (user/password) |
| **PostgreSQL** | localhost:5432 | Base de datos principal |
| **Notification DB** | localhost:5437 | Base de datos de notificaciones |
| **Redis** | localhost:6379 | Cache |

---

### Opción B: Ejecutar Servicios Localmente (Para Desarrollo)

#### 1. Levantar solo las dependencias en Docker
```bash
docker-compose -f docker_compose.yml up -d \
  postgres \
  notification-postgres \
  redis \
  rabbitmq
```

#### 2. En otra terminal, instalar y ejecutar auth-service
```bash
cd services/auth-service
npm install
npm run dev  # Puerto 3001
```

#### 3. En otra terminal, instalar y ejecutar agenda-service
```bash
cd services/agenda-service
npm install
npm run dev  # Puerto 3002
```

#### 4. En otra terminal, instalar y ejecutar notification-service
```bash
cd notification-service
npm install
npm run dev  # Puerto 4000
```

#### 5. En otra terminal, iniciar frontend
```bash
cd frontend/vite-project
npm install
npm run dev  # Puerto 5173
```

---

## ✅ Verificación de Funcionamiento

### 1. Health Checks (Verificar servicios)

```bash
# Auth Service
curl -s http://localhost:3001/health | jq

# Expected: { "status": "ok", "service": "auth-service" }

# Agenda Service
curl -s http://localhost:3002/health | jq

# Inscription Service  
curl -s http://localhost:3003/health | jq

# Notification Service
curl -s http://localhost:4000/health | jq
```

### 2. Verificar Conexión a RabbitMQ

```bash
# Ver en los logs si notification-service se conectó
docker-compose -f docker_compose.yml logs notification-service | grep -i "rabbitmq\|connected\|error"

# Expected output:
# notification-service  | Conectado a RabbitMQ
# notification-service  | Canal creado
# notification-service  | Exchange verificado
```

### 3. Prueba de API Gateway (Nginx)

```bash
# Verificar que nginx enruta correctamente
curl -v http://localhost:8080/api/auth/me

# Debería devolverá 401 (sin token), pero no 404 ni 502
```

### 4. Testear Flujo Completo de Registro

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8080/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User",
    "career": "Ingeniería de Sistemas"
  }'

# Response esperada:
# {
#   "id": "uuid",
#   "email": "test@example.com",
#   "fullName": "Test User",
#   "token": "eyJhbGc...",
#   "role": "USER"
# }

# 2. Verificar notificación fue creada
sleep 2  # Esperar a que se procese el evento

curl -s http://localhost:8080/api/notifications | jq

# Response esperada:
# [
#   {
#     "id": "notif-uuid",
#     "type": "user.registered",
#     "title": "Nuevo usuario registrado",
#     "message": "Se registró un nuevo usuario: Test User [usuario: id:... | nombre:Test User | email:test@example.com]",
#     "read": false,
#     "createdAt": "2026-05-19T..."
#   }
# ]
```

### 5. Verificar RabbitMQ Management UI

```bash
# Acceder a http://localhost:15673/
# Usuario: user
# Contraseña: password

# En la UI, ir a:
# - Exchanges → debería ver "events" (topic)
# - Queues → debería ver "notification_service_queue" (durable)
```

### 6. Acceder a Admin Panel (Frontend)

```bash
# Abrir en navegador
http://localhost:5173

# Login como super admin (verifica las credenciales en tu Auth service):
# Email: ej. admin@universidad.edu (o el que configures)
# Password: La que hayas configurado

# Luego navegar a:
# - Admin → Notificaciones → debería ver las notificaciones creadas
# - Admin → Usuarios → debería ver los usuarios registrados
```

---

## 🔧 Troubleshooting

### Problema 1: notification-service no se conecta a RabbitMQ

**Síntomas:**
```
notification-service_1 | Error connecting to RabbitMQ: Error: ACCESS_REFUSED
```

**Solución:**
```bash
# Verificar que docker_compose.yml tenga las credenciales correctas
grep "RABBITMQ_URL" backend/docker_compose.yml

# Debería mostrar:
# RABBITMQ_URL: amqp://user:password@rabbitmq:5672

# Si no, recrear contenedor:
docker-compose -f backend/docker_compose.yml down notification-service
docker-compose -f backend/docker_compose.yml up -d notification-service
```

---

### Problema 2: API Gateway devuelve 502 o 404

**Síntomas:**
```
curl http://localhost:8080/api/usuarios/register
curl: (7) Failed to connect
```

**Solución:**
```bash
# Verificar nginx.conf tiene las rutas correctas
grep "location /api/" backend/nginx/nginx.conf

# Debería haber rutas /api/usuarios, /api/eventos, etc apuntando a servicios

# Recrear nginx
docker-compose -f backend/docker_compose.yml restart api-gateway

# Verificar logs
docker-compose -f backend/docker_compose.yml logs api-gateway
```

---

### Problema 3: Tabla de notificaciones vacía

**Síntomas:**
```
GET /api/notifications retorna []
```

**Solución:**
```bash
# 1. Verificar que notification-postgres está corriendo
docker-compose -f backend/docker_compose.yml ps notification-postgres

# 2. Conectarse a la BD de notificaciones y verificar tabla existe
psql -h localhost -p 5437 -U notifications_user -d notifications_db -c "\dt notifications"

# Si la tabla no existe, crearla manualmente:
psql -h localhost -p 5437 -U notifications_user -d notifications_db << 'EOF'
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
EOF

# 3. Publicar un evento de prueba manualmente
# Ver sección "Comunicación Manual con RabbitMQ"
```

---

### Problema 4: Frontend no carga o "CORS errors"

**Síntomas:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/usuarios' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución:**
```bash
# Verificar que nginx.conf tiene CORS headers correctos
grep -A 5 "Access-Control" backend/nginx/nginx.conf

# Los headers ya están configurados en nginx.conf
# Pero si aún hay problemas, reconectar:

docker-compose -f backend/docker_compose.yml restart api-gateway frontend-app
```

---

### Problema 5: Puerto ya en uso

**Síntomas:**
```
Error: bind: address already in use
```

**Solución:**
```bash
# Encontrar qué proceso usa el puerto (ej. 5173)
lsof -i :5173

# Matar el proceso
kill -9 <PID>

# O usar otro puerto en docker-compose
# Editar docker_compose.yml y cambiar puertos
```

---

## 📊 Comunicación Manual con RabbitMQ

### Publicar un evento de prueba

Crea un archivo `/tmp/publish_event.js`:

```javascript
const amqp = require('amqplib');

async function publishEvent() {
  try {
    // Conectar a RabbitMQ (desde host, puerto mapeado es 5673)
    const conn = await amqp.connect('amqp://user:password@localhost:5673');
    const ch = await conn.createConfirmChannel();
    
    // Declarar exchange
    await ch.assertExchange('events', 'topic', { durable: true });
    
    // Publicar evento
    const payload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      career: 'Ingeniería de Sistemas'
    };
    
    const sent = ch.publish(
      'events',
      'user.registered',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
    
    console.log('Published:', sent, payload);
    
    await ch.waitForConfirms();
    await ch.close();
    await conn.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

publishEvent();
```

Ejecutar:
```bash
npm install amqplib  # Si no está instalado
node /tmp/publish_event.js

# Luego verificar en API:
curl -s http://localhost:8080/api/notifications | jq
```

---

## 💾 Comandos Útiles

### Ver Logs

```bash
# Logs en tiempo real de todos los servicios
docker-compose -f backend/docker_compose.yml logs -f

# Logs de un servicio específico
docker-compose -f backend/docker_compose.yml logs -f notification-service

# Últimas 100 líneas
docker-compose -f backend/docker_compose.yml logs --tail=100 auth-service
```

### Detener/Reiniciar

```bash
# Detener todo
docker-compose -f backend/docker_compose.yml down

# Reiniciar un servicio específico
docker-compose -f backend/docker_compose.yml restart notification-service

# Reconstruir una imagen
docker-compose -f backend/docker_compose.yml up -d --build auth-service
```

### Base de Datos

```bash
# Conectarse a PostgreSQL principal
psql -h localhost -p 5432 -U coniiti_user -d coniiti_main

# Conectarse a PostgreSQL de notificaciones
psql -h localhost -p 5437 -U notifications_user -d notifications_db

# Ver tablas en notificaciones
\dt

# Ver notificaciones
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### Redis

```bash
# Conectarse a Redis
redis-cli -p 6379

# Ver todas las keys
KEYS *

# Ver una key específica
GET user:session:123

# Limpiar todo Redis
FLUSHALL
```

---

## 📚 Documentación Adicional

- **Análisis de Entregables:** `ANALISIS_ENTREGABLES.md`
- **Diagrama Arquitectura:** `DIAGRAMA_ARQUITECTURA_MICROSERVICIOS.md`
- **CI/CD Documentation:** `Documentacion_CI_CD.md`
- **Frontend Docs:** `frontend/vite-project/Docs/README.md`

---

## ✅ Checklist de Verificación

Antes de declarar el proyecto como "LISTO PARA ENTREGA":

- [ ] Docker Compose levanta sin errores
- [ ] Todos los contenedores están en estado "Up" (healthy)
- [ ] Auth Service responde GET /health ✅
- [ ] Agenda Service responde GET /health ✅
- [ ] Inscription Service responde GET /health ✅
- [ ] Notification Service responde GET /health ✅
- [ ] RabbitMQ Management UI accesible en :15673 ✅
- [ ] Frontend carga en :5173 ✅
- [ ] Login/Registro funciona ✅
- [ ] Notificaciones se crean al registrar usuario ✅
- [ ] Admin Panel accesible (solo super admin) ✅
- [ ] Tabla de usuarios se llena en Admin ✅
- [ ] Tabla de notificaciones se llena en Admin ✅
- [ ] Nginx routing funciona para /api/auth, /api/usuarios, etc. ✅
- [ ] RabbitMQ conecta sin errores de autenticación ✅

---

## 🎓 Resumen de Entregables Completados

| Entregable | Estado | Archivo |
|-----------|--------|---------|
| **2.1 Revisión Inicial de Arquitectura** | ✅ | ANALISIS_ENTREGABLES.md (Sección 1) |
| **2.2 Diagrama de Arquitectura** | ✅ | DIAGRAMA_ARQUITECTURA_MICROSERVICIOS.md |
| **2.3 API Funcional (REST)** | ✅ | ANALISIS_ENTREGABLES.md (Sección 3) + Fixes aplicados |
| **2.4 Docker-compose Stack** | ✅ | backend/docker_compose.yml (Corregido) |

---

**Generado por:** GitHub Copilot  
**Fecha:** 2026-05-19  
**Versión:** 1.0 - Final

