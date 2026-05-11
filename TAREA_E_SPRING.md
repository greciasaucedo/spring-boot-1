# Tarea E — Chat en vivo (Spring Boot)

**Estudiante asignado:** ___________________________  
**Feature:** Broadcast por WebSocket (sin persistencia)

---

## Qué vas a construir

Un panel de chat donde usuarios escriben comentarios que se sincronizan en tiempo real entre navegadores. **Los comentarios no se guardan** en la base de datos: son efímeros, igual que en la versión Supabase.

```
┌──────────────────────────────┐
│ Comentarios [WebSocket]      │
│──────────────────────────────│
│ Usuario-423: ¡Qué gol!       │
│ Usuario-817: Increíble       │
│ Tú: Yo también               │
│──────────────────────────────│
│ [Escribe...] [Enviar]        │
└──────────────────────────────┘
```

---

## Concepto: Mensajes sin persistencia

A diferencia de eventos (que se guardan en BD), los comentarios del chat viajan por WebSocket sin pasar por la base de datos. Si alguien recarga, los comentarios anteriores desaparecen.

---

## Backend: Agregar endpoint de chat

En `src/main/java/com/labpartido/websocket/WebSocketNotifier.java`, agrega:

```java
public void notifyChatMessage(String author, String text) {
  Map<String, Object> message = new HashMap<>();
  message.put("author", author);
  message.put("text", text);
  message.put("timestamp", LocalDateTime.now());
  
  messagingTemplate.convertAndSend("/topic/match/chat", message);
}
```

En `src/main/java/com/labpartido/controller/EventController.java` (o crea `ChatController.java`), agrega:

```java
@PostMapping("/chat")
public void sendChatMessage(@RequestBody Map<String, String> message) {
  String author = message.get("author");
  String text = message.get("text");
  webSocketNotifier.notifyChatMessage(author, text);
}
```

---

## Frontend: Crear componente de chat

Crea `src/components/MatchChat.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import Stomp from 'stompjs'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const MY_NAME = `Usuario-${Math.floor(Math.random() * 9000) + 1000}`

export default function MatchChat() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const stompRef = useRef(null)
  const bottomRef = useRef(null)

  // Conectar a WebSocket para chat
  useEffect(() => {
    const stomp = Stomp.client(`${API_URL}/ws/match`)

    stomp.connect({}, () => {
      stompRef.current = stomp
      
      // Suscribirse a mensajes de chat
      stomp.subscribe('/topic/match/chat', (message) => {
        const msg = JSON.parse(message.body)
        setMessages((prev) => [...prev.slice(-49), msg])
      })
    })

    return () => {
      if (stomp && stomp.connected) stomp.disconnect(() => {})
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !stompRef.current) return

    // Enviar por HTTP
    await fetch(`${API_URL}/api/events/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: MY_NAME, text: trimmed }),
    })

    // Agregar localmente (WebSocket no hace echo al remitente)
    setMessages((prev) => [
      ...prev.slice(-49),
      { author: MY_NAME, text: trimmed, timestamp: new Date().toISOString() },
    ])

    setText('')
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        Comentarios en vivo
        <span style={styles.badge}>WebSocket</span>
      </h3>

      <div style={styles.feed}>
        {messages.length === 0 && (
          <p style={styles.empty}>Sin comentarios todavía.</p>
        )}
        {messages.map((m, i) => {
          const isOwn = m.author === MY_NAME
          return (
            <div key={i} style={{ ...styles.row, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
              <span style={styles.author}>{isOwn ? 'Tú' : m.author}</span>
              <span style={{ ...styles.bubble, background: isOwn ? '#6c5ce7' : '#eee', color: isOwn ? 'white' : '#333' }}>
                {m.text}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={styles.form}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          style={styles.input}
          maxLength={120}
        />
        <button type="submit" disabled={!text.trim()} style={styles.btn}>
          Enviar
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  header: {
    margin: 0,
    padding: '0.65rem 1rem',
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    fontSize: '0.62rem',
    background: '#6c5ce7',
    color: 'white',
    borderRadius: '4px',
    padding: '1px 6px',
    fontWeight: 'normal',
  },
  feed: {
    height: '220px',
    overflowY: 'auto',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'white',
  },
  empty: { color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem' },
  row: { display: 'flex', gap: '0.4rem', alignItems: 'baseline' },
  author: { fontSize: '0.72rem', color: '#999', fontWeight: 'bold' },
  bubble: {
    borderRadius: '12px',
    padding: '0.3rem 0.7rem',
    fontSize: '0.88rem',
    maxWidth: '75%',
    wordBreak: 'break-word',
  },
  form: { display: 'flex', borderTop: '1px solid #ddd' },
  input: { flex: 1, padding: '0.55rem 0.75rem', border: 'none', outline: 'none', fontSize: '0.9rem' },
  btn: {
    padding: '0.55rem 1rem',
    background: '#6c5ce7',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
}
```

---

## Cambios en `src/App.jsx`

### 1. Importar

```js
import MatchChat from './components/MatchChat'   // [E]
```

### 2. Renderizar

```jsx
<EventFeed events={events} />
<MatchChat />    {/* [E] */}
```

---

## Cómo demostrar

1. Abre la app en dos navegadores.
2. Escribe un comentario desde A → aparece en B automáticamente.
3. Recarga la página → **los comentarios desaparecen** (correcto, no se guardan en BD).
4. Compara con el feed de eventos: esos sí persisten porque van a la BD.
