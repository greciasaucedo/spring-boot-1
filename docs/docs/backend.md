---
id: backend
title: Backend — Spring Boot
sidebar_position: 3
---

# Backend — Spring Boot

## Configuración inicial

### Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Java | 17+ |
| Maven | 3.8+ |

### Ejecutar el servidor

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Verifica en `http://localhost:8080/api/match`:

```json
{
  "id": 1,
  "matchName": "Local vs Visitante",
  "homeScore": 0,
  "awayScore": 0
}
```

### `application.properties`

```properties
server.port=8080

spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

:::caution
Con `create-drop` todos los datos se borran al reiniciar el servidor.
:::

---

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/match` | Estado actual del partido |
| PUT | `/api/match/{id}` | Actualiza marcador → broadcast WS |
| POST | `/api/match/{id}/reset` | Reinicia marcador a 0-0 |
| GET | `/api/events` | Historial de eventos |
| POST | `/api/events` | Registra un evento → broadcast WS |

### Flujo: actualizar marcador

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant MC as MatchController
    participant MS as MatchService
    participant WN as WebSocketNotifier
    participant CL as Otros Clientes

    FE->>MC: PUT /api/match/1 { homeScore: 2 }
    MC->>MS: updateScore(1, 2, 1)
    MS-->>MC: Match actualizado
    MC->>WN: notifyMatchUpdate(1)
    WN-->>CL: /topic/match/update (broadcast)
    MC-->>FE: 200 OK + Match JSON
```

---

## WebSocket STOMP

### Configuración

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry
      .addEndpoint("/ws/match")
      .setAllowedOrigins("*")
      .withSockJS();
  }
}
```

### Topics

| Topic | Cuándo se emite | Payload |
|-------|-----------------|---------|
| `/topic/match/update` | Al actualizar o reiniciar marcador | `Match` JSON |
| `/topic/match/event` | Al registrar un nuevo evento | `Event` JSON |

### Ciclo de vida de la conexión

```mermaid
stateDiagram-v2
    [*] --> Desconectado
    Desconectado --> Conectado : STOMP CONNECT /ws/match
    Conectado --> Escuchando : SUBSCRIBE /topic/match/update\nSUBSCRIBE /topic/match/event
    Escuchando --> Escuchando : MESSAGE recibido → callback
    Escuchando --> Desconectado : cierre de pestaña / error
```

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `Port 8080 already in use` | Cambia `server.port` en `application.properties` |
| `CORS error` | El backend ya tiene `@CrossOrigin("*")` en todos los controllers |
| `H2 console` | Abre `http://localhost:8080/h2-console` (usuario: `sa`, sin contraseña) |