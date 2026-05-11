---
id: frontend
title: Frontend — React
sidebar_position: 4
---

# Frontend — React + Vite

## Instalación y ejecución

```bash
cd frontend
npm install
```

Crea `.env.local`:

```
VITE_API_URL=http://localhost:8080
```

Ejecuta:

```bash
npm run dev
# → http://localhost:5173
```

---

## Componentes

```mermaid
graph TD
    App[App.tsx\nEstado global]
    App --> SB[Scoreboard\nMarcador + botones]
    App --> SH[ScoreHistory\nTarea A]
    App --> NEF[NewEventForm\nFormulario]
    App --> EF[EventFeed\nLista de eventos]

    style App fill:#2563eb,color:#fff
    style SH fill:#f59e0b,color:#fff
```

### Estado en `App.tsx`

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `match` | `Match \| null` | Estado actual del partido |
| `events` | `MatchEvent[]` | Historial de eventos |
| `scoreHistory` | `ScoreHistoryEntry[]` | Historial de cambios del marcador |
| `wsStatus` | `string` | Estado de la conexión WebSocket |

---

## Comunicación en tiempo real

El módulo `apiClient.ts` centraliza toda la comunicación:

| Función | Método | Endpoint |
|---------|--------|----------|
| `fetchMatch()` | GET | `/api/match` |
| `fetchEvents()` | GET | `/api/events` |
| `updateScore(id, home, away)` | PUT | `/api/match/{id}` |
| `addEvent(type, min, desc)` | POST | `/api/events` |
| `subscribeToUpdates(...)` | WebSocket | `/ws/match` |

### ¿Por qué GET inicial + WebSocket?

```mermaid
timeline
    title Ciclo de vida al abrir la app (partido en curso 2-1)
    section Sin GET inicial
        t=0s : Pantalla vacía, WebSocket conectado
        t=60s : Gol → recibe 3-1
        note : El usuario nunca supo que iba 2-1
    section Con GET inicial
        t=0s : GET /api/match → muestra 2-1
        t=0s : WebSocket conectado
        t=60s : Gol → recibe 3-1
        note : Estado completo desde el primer segundo
```

:::info
El WebSocket solo envía eventos que ocurren **después** de conectarse. El `GET` inicial carga el estado actual; el WebSocket mantiene la sincronización en vivo.
:::

### Flujo de actualización

```mermaid
sequenceDiagram
    participant BE as Backend
    participant WS as apiClient.ts
    participant APP as App.tsx

    BE->>WS: /topic/match/update { match }
    WS->>APP: onMatchUpdate(match)
    APP->>APP: setMatch(match)
    APP->>APP: setScoreHistory([nuevo, ...prev])

    BE->>WS: /topic/match/event { event }
    WS->>APP: onEventAdded(event)
    APP->>APP: setEvents([event, ...prev])
```