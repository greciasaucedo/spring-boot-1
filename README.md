# Laboratorio: Panel de Partido en Vivo — Spring Boot + React

Esta carpeta contiene la versión **Spring Boot** del laboratorio de Realtime. 

A diferencia de la versión Supabase, aquí cada equipo crea su propio backend en Spring Boot y los estudiantes se conectan a través de **HTTP REST + WebSocket STOMP**.

---

## Estructura

```
spring-boot/
├── LABORATORIO_SPRING.md      ← GUÍA PRINCIPAL para estudiantes
├── SQL/                        ← Script de base de datos
│   └── schema.sql
├── backend/                    ← Proyecto Maven/Spring Boot
│   ├── pom.xml
│   ├── src/main/
│   │   ├── java/com/labpartido/
│   │   │   ├── LabPartidoApplication.java
│   │   │   ├── model/          (Match, Event)
│   │   │   ├── repository/     (JPA Repositories)
│   │   │   ├── service/        (Business logic)
│   │   │   ├── controller/     (REST endpoints)
│   │   │   ├── config/         (WebSocket config)
│   │   │   └── websocket/      (Notifier)
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── schema.sql
│   │       └── data.sql
├── frontend/                   ← Proyecto React/Vite
│   ├── src/
│   │   ├── lib/
│   │   │   └── apiClient.js    (HTTP + WebSocket STOMP)
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── TAREA_A_SPRING.md           ← Tareas individuales adaptadas
├── TAREA_B_SPRING.md
├── TAREA_C_SPRING.md
├── TAREA_D_SPRING.md
└── TAREA_E_SPRING.md
```

---

## Diferencias respecto a Supabase

| Aspecto | Supabase | Spring Boot |
|---------|----------|-------------|
| **Backend** | SaaS en la nube | Local, cada equipo lo levanta |
| **BD** | Postgres remota | H2 (en memoria) o MySQL local |
| **Realtime** | Postgres Changes | WebSocket STOMP |
| **Autenticación** | Credenciales públicas/privadas | Sin autenticación (demo) |
| **Escalabilidad** | Escalable, servicios gestionados | Local, para aprendizaje |

---

## Flujo típico en clase

### Paso 1: Administrador de Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

El servidor inicia en `http://localhost:8080`.

### Paso 2: Desarrolladores Frontend (cada uno en su máquina)
```bash
cd frontend
npm install
npm run dev
```

Acceden a `http://localhost:5173` (o la URL del backend si es otra máquina).

### Paso 3: Conectividad
Si todos están en la misma red:
- Descubre la IP del servidor: `ipconfig` (Windows) o `ifconfig` (Linux)
- Usa esa IP en `.env.local` del frontend: `VITE_API_URL=http://192.168.1.100:8080`

---

## Tareas individuales (igual que Supabase, adaptadas)

Cada estudiante elige o es asignado una tarea:

| Tarea | Componente | Concepto de Realtime |
|-------|-----------|---------------------|
| [A](TAREA_A_SPRING.md) | Historial del marcador | Acumular eventos WebSocket |
| [B](TAREA_B_SPRING.md) | Contador de usuarios | Rastrear conexiones |
| [C](TAREA_C_SPRING.md) | Toast notifications | Distinguir eventos propios vs remotos |
| [D](TAREA_D_SPRING.md) | Panel de estadísticas | Estado derivado |
| [E](TAREA_E_SPRING.md) | Chat efímero | Broadcast sin persistencia |

Cada archivo de tarea incluye código completo y cambios exactos.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Port 8080 already in use` | Cambia `server.port` en `application.properties` |
| `Cannot find database tables` | Verifica que `schema.sql` se ejecutó al iniciar |
| `CORS error en frontend` | El backend ya permite `*` — verifica que `VITE_API_URL` es correcta |
| `WebSocket timeout` | El servidor debe estar corriendo y accesible en la URL configurada |

---

## Documentación

- **LABORATORIO_SPRING.md** → guía principal para estudiantes
- **backend/** → código del servidor (listo para usar)
- **frontend/** → cliente React (requiere cambios mínimos por tarea)

---

## Para modificar el laboratorio

### Agregar un campo al evento

1. Edita `Event.java`
2. Edita `schema.sql` y `data.sql`
3. Reinicia el servidor

### Cambiar el nombre del partido

Edita `MatchService.java` en `getMatch()`.

### Personalizar WebSocket topics

Los tópicos están en `WebSocketNotifier.java`:
- `/topic/match/update` → cambios del marcador
- `/topic/match/event` → nuevos eventos
- (En tarea E agregarás `/topic/match/chat`)

---

**Próximo paso:** Lee [LABORATORIO_SPRING.md](LABORATORIO_SPRING.md) para comenzar.
