# Tarea D — Panel de estadísticas (Spring Boot)

**Estudiante asignado:** ___________________________  
**Feature:** Estado derivado del stream de eventos

---

## Qué vas a construir

Un panel que muestra contadores calculados de los eventos en vivo:

```
┌────────────────────────────┐
│ ESTADÍSTICAS DEL PARTIDO   │
│  3      2      1       4   │
│ Goles  T.Amar T.Roja  Faltas│
└────────────────────────────┘
```

Los números se actualizan automáticamente cada vez que llega un evento vía WebSocket.

---

## Concepto

No necesitas estado propio. El array `events` en `App.jsx` ya tiene todos los eventos. El componente calcula los contadores en cada render a partir de ese array.

---

## Archivo a crear

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/StatsPanel.jsx` |
| Modificar | `src/App.jsx` (2 cambios pequeños) |

---

## Componente: `src/components/StatsPanel.jsx`

```jsx
const STATS = [
  { key: 'Gol', label: 'Goles', color: '#27ae60' },
  { key: 'Tarjeta amarilla', label: 'T. Amarillas', color: '#f39c12' },
  { key: 'Tarjeta roja', label: 'T. Rojas', color: '#e74c3c' },
  { key: 'Falta', label: 'Faltas', color: '#8e44ad' },
  { key: 'Saque de esquina', label: 'Córners', color: '#2980b9' },
]

export default function StatsPanel({ events }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Estadísticas del partido</h3>

      <div style={styles.grid}>
        {STATS.map(({ key, label, color }) => {
          const count = events.filter((e) => e.eventType === key).length

          return (
            <div
              key={key}
              style={{ ...styles.card, borderTop: `3px solid ${color}` }}
            >
              <span style={styles.count}>{count}</span>
              <span style={styles.label}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.75rem',
    fontSize: '0.82rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  grid: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  card: {
    background: 'white',
    borderRadius: '6px',
    padding: '0.6rem 0.8rem',
    textAlign: 'center',
    flex: '1 1 70px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  count: {
    display: 'block',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    display: 'block',
    fontSize: '0.68rem',
    color: '#999',
    marginTop: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
}
```

---

## Cambios en `src/App.jsx`

### 1. Agregar import

```js
import StatsPanel from './components/StatsPanel'   // [D]
```

### 2. Renderizar entre Scoreboard y EventFeed

```jsx
<Scoreboard ... />
<StatsPanel events={events} />    {/* [D] */}
<NewEventForm ... />
<EventFeed events={events} />
```

---

## Cómo demostrar

1. Abre la app: los contadores reflejan los eventos que ya hay en la BD.
2. Agrega un evento de tipo "Gol" → el contador sube automáticamente en todos los navegadores.
3. Los contadores se actualizan sin necesidad de recargar ni de consultas extra.
