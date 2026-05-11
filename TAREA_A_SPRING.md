# Tarea A — Historial de cambios del marcador (Spring Boot)

**Estudiante asignado:** ************\_\_\_************  
**Feature:** Acumulación de eventos desde WebSocket

---

## Qué vas a construir

Un registro debajo del marcador que muestra cada cambio de puntuación con su hora:

```
Historial del marcador
1 - 0    14:32:45
1 - 1    14:39:12
2 - 1    14:51:30
```

---

## Archivos a crear/modificar

| Acción    | Archivo                           |
| --------- | --------------------------------- |
| Crear     | `src/components/ScoreHistory.jsx` |
| Modificar | `src/App.jsx` (3 cambios)         |

---

## Componente nuevo: `src/components/ScoreHistory.jsx`

```jsx
export default function ScoreHistory({ history }) {
  if (history.length === 0) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historial del marcador</h3>
      <ul style={styles.list}>
        {history.map((entry, i) => (
          <li key={i} style={styles.item}>
            <span style={styles.score}>
              {entry.homeScore} - {entry.awayScore}
            </span>
            <span style={styles.time}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    background: "#f0f4f8",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  title: {
    margin: "0 0 0.6rem",
    fontSize: "0.85rem",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.35rem 0",
    borderBottom: "1px solid #dde3ea",
    fontSize: "0.9rem",
  },
  score: {
    fontWeight: "bold",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.05em",
  },
  time: { color: "#888", fontSize: "0.8rem" },
};
```

---

## Cambios en `src/App.jsx`

### 1. Agregar import

```js
import ScoreHistory from "./components/ScoreHistory"; // [A]
```

### 2. Agregar estado para historial

```js
const [scoreHistory, setScoreHistory] = useState([]); // [A]
```

### 3. En el handler de WebSocket (dentro del `subscribeToUpdates`), acumular cambios

Modifica donde llamas a `setMatch`:

```js
subscribeToUpdates(
  (match) => {
    // [A] Acumular el cambio en historial
    setScoreHistory((prev) => [
      {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
    setMatch(match)
  },
  (event) => { ... },
  ...
)
```

### 4. Renderizar el componente

En el `return` de App, agregar después de `<Scoreboard>`:

```jsx
<ScoreHistory history={scoreHistory} />   {/* [A] */}
```

---

## Cómo demostrar

1. Abre la app en dos navegadores.
2. Pulsa "+1 Local" varias veces.
3. Ambos ven el historial creciendo en tiempo real.
4. Un tercer navegador mostrará un historial vacío (correcto, es en memoria).
