# Tarea C — Notificaciones Toast (Spring Boot)

**Estudiante asignado:** ************\_\_\_************  
**Feature:** Distinguir eventos propios vs remotos

---

## Qué vas a construir

Notificaciones temporales en la esquina superior derecha que aparecen cuando **otro cliente** agrega un evento.

```
┌─────────────────────────┐
│ ⚽ Gol                  │
│    min. 67              │
└─────────────────────────┘
```

---

## Estrategia: rastrear eventos enviados localmente

Sin autenticación, guardamos un `Set` de IDs de eventos que nosotros enviamos localmente. Cuando llega un evento por WebSocket:

- Si está en el Set → es nuestro → no mostrar toast
- Si no está en el Set → es de otro cliente → mostrar toast

---

## Archivos

| Acción    | Archivo                                            |
| --------- | -------------------------------------------------- |
| Crear     | `src/components/ToastContainer.jsx`                |
| Modificar | `src/App.jsx` (varios cambios)                     |
| Modificar | `src/components/NewEventForm.jsx` (pedir callback) |

---

## Componente: `src/components/ToastContainer.jsx`

```jsx
import { useEffect } from "react";

const ICONS = {
  Gol: "⚽",
  "Tarjeta amarilla": "🟨",
  "Tarjeta roja": "🟥",
  Falta: "🚫",
  "Saque de esquina": "🚩",
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={styles.wrapper}>
      {toasts.map((t) => (
        <Toast key={t.toastId} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.toastId), 3000);
    return () => clearTimeout(timer);
  }, [toast.toastId, onDismiss]);

  return (
    <div style={styles.toast} onClick={() => onDismiss(toast.toastId)}>
      <span style={styles.icon}>{ICONS[toast.eventType] ?? "📌"}</span>
      <div>
        <div style={styles.type}>{toast.eventType}</div>
        {toast.minute != null && (
          <div style={styles.detail}>min. {toast.minute}</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    zIndex: 1000,
    pointerEvents: "none",
  },
  toast: {
    background: "#222",
    color: "white",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    minWidth: "210px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
    cursor: "pointer",
    pointerEvents: "all",
  },
  icon: { fontSize: "1.4rem" },
  type: { fontWeight: "bold", fontSize: "0.9rem" },
  detail: { fontSize: "0.75rem", color: "#aaa" },
};
```

---

## Cambios en `src/App.jsx`

### 1. Agregar imports y estado

```js
import { useEffect, useRef, useState } from "react";
import ToastContainer from "./components/ToastContainer"; // [C]

// Dentro del componente App:
const [toasts, setToasts] = useState([]); // [C]
const localEventIds = useRef(new Set()); // [C]
```

### 2. Modificar `subscribeToUpdates` para diferenciar eventos

```js
subscribeToUpdates(
  (match) => { ... },
  (event) => {
    // Actualizar feed
    setEvents((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev
      return [event, ...prev]
    })

    // [C] Si no es evento nuestro, mostrar toast
    if (localEventIds.current.has(event.id)) {
      localEventIds.current.delete(event.id)
    } else {
      setToasts((prev) => [
        ...prev,
        { ...event, toastId: Date.now() },
      ])
    }
  },
  ...
)
```

### 3. Renderizar ToastContainer

En el return, al inicio:

```jsx
<ToastContainer
  toasts={toasts}
  onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.toastId !== id))}
/>
```

### 4. Pasar callback a NewEventForm

```jsx
<NewEventForm
  onAddEvent={handleAddEvent}
  onEventCreated={(id) => localEventIds.current.add(id)} // [C]
/>
```

---

## Cambios en `src/components/NewEventForm.jsx`

### 1. Aceptar callback

```js
export default function NewEventForm({ onAddEvent, onEventCreated }) {
  // ...
}
```

### 2. Modificar la llamada a `onAddEvent`

En el handler `handleSubmit`, cambiar:

```js
// Antes:
await onAddEvent(
  eventType,
  minute ? parseInt(minute, 10) : null,
  description.trim() || null,
);

// Después:
// Aquí no podemos obtener el ID porque onAddEvent no lo devuelve.
// Alternativa: modificar apiClient.js para que addEvent devuelva el event completo
```

Mejor aún, modifica `src/lib/apiClient.js` para devolver el evento:

```js
export async function addEvent(eventType, minute, description) {
  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      minute: minute || null,
      description: description || null,
    }),
  });
  return res.json(); // Ahora devuelve el evento completo con id
}
```

Luego en `NewEventForm.jsx`:

```js
async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const event = await onAddEvent(
    eventType,
    minute ? parseInt(minute, 10) : null,
    description.trim() || null,
  );

  // [C] Registrar el ID
  if (event && event.id && onEventCreated) {
    onEventCreated(event.id);
  }

  setMinute("");
  setDescription("");
  setLoading(false);
  setSent(true);
  setTimeout(() => setSent(false), 2000);
}
```

---

## Cómo demostrar

1. Abre la app en dos navegadores.
2. Desde A, agrega un evento → el toast NO aparece en A (es tuyo).
3. Desde B, el toast SÍ aparece (evento remoto).
4. Desde B, agrega otro evento → aparece en A, no en B.
