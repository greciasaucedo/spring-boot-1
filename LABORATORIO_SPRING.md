# Laboratorio: Panel de Partido en Vivo — Spring Boot + React

**Asignatura:** Desarrollo Web Avanzado  
**Stack:** Spring Boot 3.x + React + Vite + WebSocket  
**Duración estimada:** 120 minutos  
**Modalidad:** Trabajo en equipo + implementación individual

---

## Objetivo

Construir una mini-aplicación web donde varios usuarios conectados vean actualizaciones en tiempo real de un partido deportivo simulado. La sincronización ocurre mediante **WebSocket** (no polling), con un backend **Spring Boot** que maneja la lógica de negocio y un frontend **React** que consume eventos en vivo.

---

## Roles

| Rol | Cantidad | Responsabilidad |
|-----|----------|-----------------|
| **Administrador Backend** | 1 por equipo | Configura y ejecuta el servidor Spring Boot |
| **Desarrollador Frontend** | El resto del equipo | Implementa el cliente React y se conecta al servidor |

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                   Servidor Spring Boot                      │
│  (puerto 8080, WebSocket en /ws/match, BD local)            │
├─────────────────────────────────────────────────────────────┤
│  • Endpoints REST: GET /api/match, POST /api/events, etc.   │
│  • WebSocket: Broadcast de eventos a clientes conectados    │
│  • BD: H2 o MySQL (local)                                   │
└─────────────────────────────────────────────────────────────┘
       ▲                                    ▲
       │ REST + WebSocket                   │ REST + WebSocket
       │                                    │
┌──────┴──────────────┐         ┌──────────┴──────────┐
│  Cliente React A    │         │  Cliente React B    │
│ (http://localhost)  │         │ (http://localhost)  │
└─────────────────────┘         └─────────────────────┘
```

---

## PARTE DE EQUIPO — Servidor Spring Boot

> Esta parte la realiza **una sola persona** por equipo.

### Requisitos previos

- **Java 17+** instalado
- **Maven** instalado
- **MySQL** o usar **H2** (base de datos en memoria, sin instalación)

### Paso 1 — Crear el proyecto Spring Boot

**Opción A: Usar Spring Boot CLI o Spring Initializr web**

Ve a https://start.spring.io y crea un proyecto con:
- **Project:** Maven
- **Language:** Java
- **Spring Boot:** 3.1 o superior
- **Dependencies:** Web, JPA, H2 (o MySQL Driver), WebSocket

Descarga el ZIP y extrae en `backend/`.

**Opción B: Clonar desde este laboratorio**

El proyecto base ya está incluido en la carpeta `backend/`.

### Paso 2 — Ejecutar el script SQL

Dentro de la carpeta `backend/`, copia el contenido del archivo `../SQL/schema.sql` y:

**Si usas H2** (recomendado para esta práctica):  
H2 ejecutará el schema automáticamente en inicio (see `src/main/resources/data.sql`).

**Si usas MySQL:**
```bash
mysql -u root -p
create database partido_db;
use partido_db;
source ../SQL/schema.sql;
```

### Paso 3 — Configurar `application.properties`

Edita `src/main/resources/application.properties`:

```properties
# ═════ Servidor ═════
server.port=8080
server.servlet.context-path=/

# ═════ BD: H2 (desarrollo rápido) ═════
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop

# ═════ O BD: MySQL ═════
# spring.datasource.url=jdbc:mysql://localhost:3306/partido_db
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# spring.datasource.username=root
# spring.datasource.password=
# spring.jpa.hibernate.ddl-auto=update
# spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# ═════ JPA ═════
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
```

### Paso 4 — Compilar y ejecutar

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Verifica que el servidor inicia sin errores:
```
Started LabPartidoApplication in X seconds
```

Abre http://localhost:8080/api/match en el navegador. Deberías ver JSON del partido actual.

### Paso 5 — Compartir la URL base con el equipo

Todos los compañeros necesitan saber:
```
VITE_API_URL=http://localhost:8080
```

Si los clientes están en otra máquina, usa la IP del servidor:
```
VITE_API_URL=http://192.168.1.100:8080
```

---

## PARTE INDIVIDUAL — Frontend React

### Paso 1 — Instalar dependencias

```bash
cd frontend
npm install
```

### Paso 2 — Configurar variables de entorno

Crea `.env.local`:

```
VITE_API_URL=http://localhost:8080
```

O si es otra máquina:
```
VITE_API_URL=http://192.168.1.X:8080
```

### Paso 3 — Entender el cliente API

Lee `src/lib/apiClient.js`:

- **`fetchMatch()`** → GET `/api/match` → estado actual
- **`fetchEvents()`** → GET `/api/events` → historial de eventos
- **`updateScore()`** → PUT `/api/match/{id}` → cambiar marcador
- **`addEvent()`** → POST `/api/events` → agregar evento
- **`subscribeToUpdates(callback)`** → WebSocket en `/ws/match`

### Paso 4 — Ejecutar el frontend

```bash
npm run dev
```

Abre http://localhost:5173. Deberías ver el panel del partido conectándose al servidor.

### Paso 5 — Demostrar Realtime

1. Abre la app en dos navegadores.
2. Desde uno, pulsa "+1 Local".
3. Ambos navegadores actualizan automáticamente sin recargar.
4. Agrega un evento desde el formulario.
5. Ambos ven el evento en vivo.

---

## Flujo de datos

```
Cliente A (React)              Servidor Spring Boot            Cliente B (React)
      │                               │                               │
      ├─ GET /api/match ────────────>│                               │
      |<──── JSON match ──────────────┤                               │
      │                               │                               │
      ├─ WebSocket /ws/match ────────>│<─── WebSocket /ws/match ─────┤
      │        (CONNECT)              │         (CONNECT)             │
      │                               │                               │
      ├─ PUT /api/match/1 ───────────>│                               │
      │   { home_score: 1 }           │                               │
      │                               ├── SimpMessagingTemplate ────>│
      │                               │   (broadcast a todos)         │
      │<─────── WebSocket event ──────┼──────────────────────────────>│
```

---

## Criterios de aceptación del equipo

- [ ] El servidor Spring Boot inicia sin errores.
- [ ] GET `/api/match` devuelve JSON del partido actual.
- [ ] GET `/api/events` devuelve lista de eventos.
- [ ] WebSocket en `/ws/match` acepta conexiones.
- [ ] Al hacer PUT en `/api/match`, todos los clientes reciben el cambio vía WebSocket.
- [ ] Al hacer POST en `/api/events`, todos los clientes reciben el evento vía WebSocket.
- [ ] Dos o más clientes conectados ven las actualizaciones en tiempo real.

---

## ENTREGABLE INDIVIDUAL — Tarea asignada

(Igual que en la versión Supabase)

| Tarea | Qué construye |
|-------|---------------|
| [Tarea A](TAREA_A_SPRING.md) | Historial de cambios del marcador |
| [Tarea B](TAREA_B_SPRING.md) | Contador de usuarios conectados |
| [Tarea C](TAREA_C_SPRING.md) | Notificaciones toast |
| [Tarea D](TAREA_D_SPRING.md) | Panel de estadísticas |
| [Tarea E](TAREA_E_SPRING.md) | Chat en vivo |

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Port 8080 already in use` | Cambia `server.port` en `application.properties` o cierra la app anterior |
| `Cannot connect to WebSocket` | Verifica que `VITE_API_URL` es correcto y que el servidor está corriendo |
| `CORS error` | El servidor Spring ya incluye configuración CORS para `*` |
| `H2 console no aparece` | Abre http://localhost:8080/h2-console (usuario: `sa`, sin contraseña) |

---

## Preguntas de reflexión

1. ¿Qué ventajas tiene usar WebSocket vs REST polling?
2. ¿Qué pasaría si el servidor se reinicia? ¿Qué datos se pierden?
3. ¿Cómo diferencia el servidor quién envía cada cambio?
4. ¿Por qué el frontend necesita hacer GET inicial + WebSocket y no solo WebSocket?
