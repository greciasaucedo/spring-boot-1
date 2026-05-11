---
id: architecture
title: Arquitectura (C4)
sidebar_position: 2
---

# Arquitectura — Modelo C4

El modelo C4 describe la arquitectura en cuatro niveles de zoom. Aquí se presentan los tres primeros con diagramas Mermaid.

---

## Nivel 1 — Contexto

Muestra el sistema en relación con sus usuarios y sistemas externos.

```mermaid
C4Context
    title Sistema: Panel de Partido en Vivo

    Person(estudiante, "Estudiante / Usuario", "Observa el marcador en tiempo real desde cualquier navegador")
    Person(admin, "Administrador Backend", "Levanta y gestiona el servidor Spring Boot")

    System(webapp, "Panel de Partido en Vivo", "Aplicación web que muestra el estado del partido en tiempo real usando WebSocket")

    System_Ext(browser, "Navegador Web", "Chrome, Firefox, Safari")
    System_Ext(h2, "Base de Datos H2", "Base de datos en memoria embebida")

    Rel(estudiante, browser, "Accede via")
    Rel(browser, webapp, "HTTP + WebSocket")
    Rel(admin, webapp, "Administra y ejecuta")
    Rel(webapp, h2, "Lee y escribe datos")
```

---

## Nivel 2 — Contenedores

Descompone el sistema en sus piezas técnicas: servidor, cliente y base de datos.

```mermaid
C4Container
    title Contenedores: Panel de Partido en Vivo

    Person(usuario, "Usuario", "Navegador Web")

    Container_Boundary(sistema, "Panel de Partido en Vivo") {
        Container(frontend, "Frontend React", "React 18 + Vite", "SPA con WebSocket STOMP, puerto 5173")
        Container(backend, "Backend Spring Boot", "Java 17 + Spring Boot 3.x", "API REST + WebSocket STOMP, puerto 8080")
        ContainerDb(db, "Base de Datos H2", "H2 in-memory", "Almacena partido y eventos en la sesión activa")
    }

    Rel(usuario, frontend, "Abre en navegador", "HTTP")
    Rel(frontend, backend, "Carga inicial", "HTTP REST")
    Rel(frontend, backend, "Actualizaciones push", "WebSocket STOMP")
    Rel(backend, db, "Persiste datos", "JPA / Hibernate")
```

---

## Nivel 3 — Componentes del Backend

```mermaid
C4Component
    title Componentes: Backend Spring Boot

    Container_Boundary(be, "Spring Boot Application") {
        Component(matchCtrl, "MatchController", "REST Controller", "GET /api/match, PUT /api/match/{id}")
        Component(eventCtrl, "EventController", "REST Controller", "GET /api/events, POST /api/events")
        Component(matchSvc, "MatchService", "Service", "Logica del partido y marcador")
        Component(eventSvc, "EventService", "Service", "Logica de eventos")
        Component(wsNotifier, "WebSocketNotifier", "Component", "Broadcast a /topic/match/update y /topic/match/event")
        Component(matchRepo, "MatchRepository", "JPA Repository", "CRUD tabla match_state")
        Component(eventRepo, "EventRepository", "JPA Repository", "CRUD tabla events")
    }

    ContainerDb(db, "H2 Database", "in-memory", "")

    Rel(matchCtrl, matchSvc, "Delega")
    Rel(eventCtrl, eventSvc, "Delega")
    Rel(matchSvc, matchRepo, "Usa")
    Rel(matchSvc, wsNotifier, "Notifica")
    Rel(eventSvc, eventRepo, "Usa")
    Rel(eventSvc, wsNotifier, "Notifica")
    Rel(matchRepo, db, "JPA")
    Rel(eventRepo, db, "JPA")
```

---

## Nivel 3 — Componentes del Frontend

```mermaid
C4Component
    title Componentes: Frontend React

    Container_Boundary(fe, "React SPA") {
        Component(app, "App.tsx", "React Component", "Estado global del partido")
        Component(apiClient, "apiClient.ts", "Module", "HTTP REST y WebSocket STOMP")
        Component(scoreboard, "Scoreboard.tsx", "React Component", "Marcador y botones de accion")
        Component(eventFeed, "EventFeed.tsx", "React Component", "Lista de eventos del partido")
        Component(scoreHistory, "ScoreHistory.tsx", "React Component", "Tarea A: Historial de cambios")
    }

    Container(be, "Backend Spring Boot", ":8080", "")

    Rel(app, apiClient, "Fetch y mutaciones")
    Rel(app, scoreboard, "Props")
    Rel(app, eventFeed, "Props")
    Rel(app, scoreHistory, "Props")
    Rel(apiClient, be, "HTTP REST + WebSocket STOMP")
```

---

## Flujo de datos completo

```mermaid
sequenceDiagram
    participant A as Cliente React A
    participant S as Servidor Spring Boot
    participant B as Cliente React B

    A->>S: GET /api/match
    S-->>A: JSON estado del partido

    A->>S: WebSocket CONNECT /ws/match
    B->>S: WebSocket CONNECT /ws/match

    A->>S: PUT /api/match/1 · homeScore +1
    S-->>A: broadcast /topic/match/update
    S-->>B: broadcast /topic/match/update

    Note over A,B: Ambos clientes se actualizan en tiempo real
```