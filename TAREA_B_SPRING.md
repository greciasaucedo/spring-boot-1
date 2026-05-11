# Tarea B — Usuarios conectados en vivo (Spring Boot)

**Estudiante asignado:** ************\_\_\_************  
**Feature:** Rastrear conexiones WebSocket

---

## Qué vas a construir

Un contador en la parte superior que muestra cuántos navegadores están conectados ahora:

```
● 3 usuarios conectados
```

---

## Concepto: Rastreando conexiones

En Spring Boot con WebSocket, cada cliente que se conecta lo hace automáticamente. Para contar usuarios, necesitamos:

1. En el **backend**: mantener un contador de conexiones activas
2. En el **frontend**: requerir ese contador periódicamente o recibir notificaciones

Para esta tarea usaremos un **endpoint REST GET `/api/users/connected`** que devuelve cuántos clientes activos hay.

---

## Cambio en el Backend (Spring Boot)

Agrega una clase `UserService.java` en `src/main/java/com/labpartido/service/`:

```java
package com.labpartido.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class UserService {
  private final AtomicInteger connectedUsers = new AtomicInteger(0);

  public void userConnected() {
    connectedUsers.incrementAndGet();
  }

  public void userDisconnected() {
    connectedUsers.decrementAndGet();
  }

  public int getConnectedUsers() {
    return connectedUsers.get();
  }
}
```

Luego, en **WebSocketConfig.java**, modifica el método `registerStompEndpoints`:

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
  registry
    .addEndpoint("/ws/match")
    .setAllowedOrigins("*")
    .setHandshakeHandler(new WebSocketHandshakeHandler())
    .withSockJS();
}

// Crea una clase interna o separada:
private class WebSocketHandshakeHandler implements HandshakeHandler {
  @Override
  public boolean doHandshake(ServerHttpRequest request, ServerHttpResponse response,
      WebSocketHandler wsHandler, Map<String, Object> attributes) throws IOException {
    userService.userConnected();
    return defaultHandshaker.doHandshake(request, response, wsHandler, attributes);
  }
}
```

Agrega un **endpoint en MatchController**:

```java
@GetMapping("/users/connected")
public Map<String, Integer> getConnectedUsers() {
  return Map.of("count", userService.getConnectedUsers());
}
```

---

## Cambio en el Frontend

### 1. Crear `src/components/ConnectedUsers.jsx`

```jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ConnectedUsers() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Obtener el contador cada 2 segundos
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/match/users/connected`);
        const data = await res.json();
        setCount(data.count || 0);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.badge}>
      <span style={styles.dot} />
      {count} {count === 1 ? "usuario conectado" : "usuarios conectados"}
    </div>
  );
}

const styles = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: "999px",
    padding: "0.3rem 0.8rem",
    fontSize: "0.82rem",
    fontWeight: "bold",
    border: "1px solid #c8e6c9",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#4caf50",
    flexShrink: 0,
  },
};
```

### 2. En `src/App.jsx`, agregar import

```js
import ConnectedUsers from "./components/ConnectedUsers"; // [B]
```

### 3. Renderizar antes del Scoreboard

```jsx
<ConnectedUsers />    {/* [B] */}
<Scoreboard ... />
```

---

## Cómo demostrar

1. Abre la app en un navegador → muestra "1 usuario".
2. Abre otra pestaña o navegador → ambos muestran "2 usuarios".
3. Cierra una → baja a "1 usuario".
