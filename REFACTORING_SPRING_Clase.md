# Actividad: Refactorización a TypeScript — Versión Spring Boot

**Asignatura:** Desarrollo Web Avanzado  
**Duración:** 90 minutos  
**Prerequisito:** Haber completado el laboratorio base + tu tarea individual

---

## Objetivo

Migrar el proyecto React de JavaScript a **TypeScript** y eliminar código duplicado identificable en la base de código. Al finalizar sabrás:

- Crear interfaces que describen contratos entre el frontend y la API REST
- Extraer constantes compartidas entre componentes
- Eliminar patrones repetidos con una función utilitaria
- Detectar cuándo TypeScript te habría protegido de un bug real

---

## Fase 1 — Análisis: encuentra el código repetido (15 min)

Abre el código y responde estas preguntas antes de tocar nada:

**Pregunta A.** Busca el string `'Gol'` en todos los archivos del proyecto. ¿En cuántos archivos aparece? ¿Qué rol tiene en cada uno?

Aparece en 2 archivos: 
  - EventFeed.jsx. En el objeto ICON para asignar el emoji
  - NewEverntFrom.jsx. Es el primer elemento del array EVENT_TYPES para mostrarlo en el "select" 

**Pregunta B.** `EventFeed.jsx` tiene un objeto `ICON` y `NewEventForm.jsx` tiene un array `EVENT_TYPES`. ¿Qué relación conceptual tienen? ¿Qué pasa si un estudiante agrega `'Prórroga'` al formulario pero se olvida de agregarle un icono?

Son básicamente lo mismo pero en dos partes: EVENT_TYPES dice qué eventos existen y ICON le pone un emoji a cada uno. Si alguien agrega algo como “Prórroga” pero se le olvida asignarle emoji, en el EventFeed va a salir el genérico 📌 en vez de uno adecuado. Es mejor juntarlos en constants/events.ts.

**Pregunta C.** Mira las funciones `goalHome`, `goalAway`, `handleReset` y `handleAddEvent` en `App.jsx`. ¿Qué tienen en común? ¿Cuántas veces se repite exactamente el mismo bloque try/catch?

```js
// ¿Cuántas veces ves exactamente esto?
try {
  await alguna_operacion();
} catch (err) {
  setError(err.message);
}
```
Se repite 4 veces en App.jsx: dentro de goalHome, goalAway, handleReset y handleAddEvent. Todos tienen la misma estructura: await operacion() + setError(err.message) y la función withError elimina esa repetición.

**Pregunta D.** Si la API REST cambia el nombre del campo `homeScore` a `home_score`, ¿cómo sabrías qué archivos del frontend hay que actualizar? ¿TypeScript te habría ayudado?

Se tendría que buscar manualmente con algo como grep -r homeScore src/ y luego revisar uno por uno para ver si realmente se esta usando ese campo o si solo aparece como texto.

Mientras que con TypeScript es mucho más directo, cambia el nombre en types/index.ts y listo, el compilador te marca en rojo todos los lugares donde estás usando match.homeScore como en App.tsx, Scoreboard.tsx, ScoreHistory.tsx o apiClient.ts.

> Anota tus respuestas. Las discutirán en clase antes de empezar el código.

---

## Fase 2 — Configurar TypeScript (15 min)

### 2.1 Instalar tipos

```bash
cd frontend
npm install --save-dev typescript @types/react @types/react-dom @types/stompjs
```

### 2.2 Crear `tsconfig.json` en `frontend/`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### 2.3 Renombrar archivos (uno a la vez, verifica que no falla entre cada rename)

```
src/lib/apiClient.js           →  apiClient.ts
src/components/Scoreboard.jsx  →  Scoreboard.tsx
src/components/EventFeed.jsx   →  EventFeed.tsx
src/components/NewEventForm.jsx → NewEventForm.tsx
src/App.jsx                    →  App.tsx
src/main.jsx                   →  main.tsx
```

Si tienes tu tarea individual, renombra ese componente también.

---

## Fase 3 — Crear los tipos compartidos (20 min)

Crea `src/types/index.ts`.

```typescript
// Espejo del objeto Java Match.java que devuelve el backend
export interface Match {
  id: number;
  matchName: string; // camelCase: viene de la serialización de Java
  homeScore: number;
  awayScore: number;
  updatedAt: string;
}

// Espejo del objeto Java Event.java
export interface MatchEvent {
  id: number;
  eventType: string;
  minute: number | null;
  description: string | null;
  createdAt: string;
}

// Tipo para el payload de crear un evento (lo que enviamos, no lo que recibimos)
export interface CreateEventPayload {
  eventType: string;
  minute: number | null;
  description: string | null;
}
```

---

## Fase 4 — Extraer constantes compartidas (15 min)

Crea `src/constants/events.ts`:

```typescript
export const EVENT_TYPES = [
  "Gol",
  "Tarjeta amarilla",
  "Tarjeta roja",
  "Falta",
  "Saque de esquina",
  "Offside",
  "Sustitución",
  "Medio tiempo",
  "Fin del partido",
  "Otro",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_ICONS: Record<string, string> = {
  Gol: "⚽",
  "Tarjeta amarilla": "🟨",
  "Tarjeta roja": "🟥",
  Falta: "🚫",
  "Saque de esquina": "🚩",
  Offside: "🚦",
  Sustitución: "🔄",
  Inicio: "▶",
  "Medio tiempo": "⏸",
  "Fin del partido": "🏁",
};
```

---

## Fase 5 — Eliminar el try/catch repetido (10 min)

Este es el problema específico de la versión Spring Boot. En `App.jsx` hay 4 bloques idénticos:

```js
// En goalHome:
try {
  await updateScore(...)
} catch (err) {
  setError(err.message)
}

// En goalAway: exactamente igual
// En handleReset: exactamente igual
// En handleAddEvent: exactamente igual
```

Crea `src/lib/withError.ts`:

```typescript
// Envuelve una operación async y redirige el error a setError.
// Evita repetir el bloque try/catch en cada acción de App.tsx.
export async function withError(
  action: () => Promise<unknown>,
  setError: (msg: string) => void,
): Promise<void> {
  try {
    await action();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error desconocido");
  }
}
```

Luego en `App.tsx`, reemplaza los 4 bloques try/catch:

```typescript
import { withError } from "./lib/withError";

async function goalHome() {
  if (!match) return;
  await withError(
    () => updateScore(match.id, match.homeScore + 1, match.awayScore),
    setError,
  );
}

async function goalAway() {
  if (!match) return;
  await withError(
    () => updateScore(match.id, match.homeScore, match.awayScore + 1),
    setError,
  );
}

async function handleReset() {
  if (!match) return;
  await withError(() => resetScore(match.id), setError);
}

async function handleAddEvent(
  eventType: string,
  minute: number | null,
  description: string | null,
) {
  await withError(() => addEvent(eventType, minute, description), setError);
}
```

---

## Fase 6 — Tipar el API client (10 min)

Actualiza `src/lib/apiClient.ts` para que las funciones tengan tipos de retorno explícitos:

```typescript
import Stomp from "stompjs";
import { Match, MatchEvent, CreateEventPayload } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function fetchMatch(): Promise<Match> {
  const res = await fetch(`${API_URL}/api/match`);
  return res.json();
}

export async function fetchEvents(): Promise<MatchEvent[]> {
  const res = await fetch(`${API_URL}/api/events`);
  return res.json();
}

export async function updateScore(
  matchId: number,
  homeScore: number,
  awayScore: number,
): Promise<Match> {
  const res = await fetch(`${API_URL}/api/match/${matchId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeScore, awayScore }),
  });
  return res.json();
}

export async function resetScore(matchId: number): Promise<Match> {
  const res = await fetch(`${API_URL}/api/match/${matchId}/reset`, {
    method: "POST",
  });
  return res.json();
}

export async function addEvent(
  eventType: string,
  minute: number | null,
  description: string | null,
): Promise<MatchEvent> {
  const payload: CreateEventPayload = { eventType, minute, description };
  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export function subscribeToUpdates(
  onMatchUpdate: (match: Match) => void,
  onEventAdded: (event: MatchEvent) => void,
  onError: (error: unknown) => void,
): Promise<() => void> {
  return new Promise((resolve) => {
    const url = `${API_URL}/ws/match`;
    const stompClient = Stomp.client(url);

    stompClient.connect(
      {},
      () => {
        stompClient.subscribe("/topic/match/update", (message) => {
          onMatchUpdate(JSON.parse(message.body) as Match);
        });
        stompClient.subscribe("/topic/match/event", (message) => {
          onEventAdded(JSON.parse(message.body) as MatchEvent);
        });
        resolve(() => {
          if (stompClient.connected) stompClient.disconnect(() => {});
        });
      },
      (error: unknown) => {
        onError(error);
        resolve(() => {});
      },
    );
  });
}
```

---

## Fase 7 — Migrar los componentes (10 min)

### `src/components/EventFeed.tsx`

```typescript
import { MatchEvent } from "../types";
import { EVENT_ICONS } from "../constants/events"; // ← eliminar el ICON local

interface Props {
  events: MatchEvent[];
}

export default function EventFeed({ events }: Props) {
  // Cambiar ICON[ev.eventType] a EVENT_ICONS[ev.eventType]
  // ...
}
```

### `src/components/NewEventForm.tsx`

```typescript
import { useState } from "react";
import { EVENT_TYPES, EventType } from "../constants/events"; // ← eliminar el local

interface Props {
  onAddEvent: (
    eventType: string,
    minute: number | null,
    description: string | null,
  ) => Promise<void>;
  onEventCreated?: (id: number) => void; // para Tarea C
}

export default function NewEventForm({ onAddEvent, onEventCreated }: Props) {
  const [eventType, setEventType] = useState<EventType>(EVENT_TYPES[0]);
  // ...
}
```

### `src/components/Scoreboard.tsx`

```typescript
import { Match } from "../types";

interface Props {
  match: Match;
  onGoalHome: () => void;
  onGoalAway: () => void;
  onReset: () => void;
}
```

### `src/App.tsx`

```typescript
import { Match, MatchEvent } from "./types";
import { withError } from "./lib/withError";

const [match, setMatch] = useState<Match | null>(null);
const [events, setEvents] = useState<MatchEvent[]>([]);
const [error, setError] = useState<string | null>(null);
```

---

## Fase 8 — Verificación final

```bash
npm run dev
```

Checklist:

- [ ] La app carga sin errores de TypeScript en consola
- [ ] El marcador y el feed funcionan en tiempo real
- [ ] Tu tarea individual sigue funcionando
- [ ] En VS Code, `match.homeScore` muestra tipo `number`; `match.awayScore` también
- [ ] Si escribes `match.home_score` (snake_case, incorrecto para Spring Boot), aparece error rojo
- [ ] La función `withError` tiene exactamente 1 definición, pero se llama 4 veces

---

## Entrega

Demuestra en clase:

1. Abre `src/types/index.ts` y explica por qué los campos usan `camelCase` (no `snake_case`).
2. Muestra que `EVENT_TYPES` ya no está en `NewEventForm.tsx` — está en `constants/events.ts`.
3. Muestra que `ICON` ya no está en `EventFeed.tsx` — está en `constants/events.ts`.
4. Muestra `withError` y explica qué problema resuelve frente al try/catch repetido.
5. Simulación: cambia el campo `homeScore` a `home_score` en `types/index.ts`. ¿Cuántos archivos señala TypeScript como erróneos automáticamente?

---

## Resumen de archivos modificados/creados

| Archivo                           | Cambio                                        |
| --------------------------------- | --------------------------------------------- |
| `src/types/index.ts`              | Nuevo — Match, MatchEvent, CreateEventPayload |
| `src/constants/events.ts`         | Nuevo — EVENT_TYPES, EventType, EVENT_ICONS   |
| `src/lib/withError.ts`            | Nuevo — envuelve try/catch repetido           |
| `src/lib/apiClient.ts`            | Tipos de retorno explícitos                   |
| `src/components/EventFeed.tsx`    | Tipado, imports desde constants               |
| `src/components/NewEventForm.tsx` | Tipado, imports desde constants               |
| `src/components/Scoreboard.tsx`   | Tipado de props                               |
| `src/App.tsx`                     | Tipado de estado, uso de withError            |
| `tsconfig.json`                   | Nuevo                                         |

---

## Pregunta de cierre

Compara la estructura de `Match` en `types/index.ts` con la clase Java `Match.java` del backend.

¿Qué pasa si un desarrollador backend cambia el nombre de `homeScore` a `home_score` en el servidor? ¿Cómo te enterarías sin TypeScript? ¿Cómo te enterarías con TypeScript?

Sin TypeScript nos daríamso cuenta hasta que algo se rompe visualmente, por ejemplo si el marcador empezaría a mostras NaN : NaN o undefined : undefined.

Con es mucho más imedianto, en cuanto cambiamos el nombre en types/index.ts, el compilador empieza a marcar errores en todos los lugares donde sigues usando homeScore.

¿Qué herramienta o técnica podría hacer esta sincronización automática?

Para evitar este tipo de desincronizaciones, se puede usar algo como OpenAPI / Swagger. El backend genera un spec de la API y herramientas como openapi-typescript crean automáticamente los tipos en el frontend. Entonces, si cambia algo en el backend, solo se regeneran los tipos y todo queda alineado sin tener que hacerlo manual.