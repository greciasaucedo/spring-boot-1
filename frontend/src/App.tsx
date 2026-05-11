import { useEffect, useState } from "react";
import {
  fetchMatch,
  fetchEvents,
  updateScore,
  resetScore,
  addEvent,
  subscribeToUpdates,
} from "./lib/apiClient";
import { Match, MatchEvent, ScoreHistoryEntry } from "./types";
import { withError } from "./lib/withError";
import Scoreboard from "./components/Scoreboard";
import EventFeed from "./components/EventFeed";
import NewEventForm from "./components/NewEventForm";
import ScoreHistory from "./components/ScoreHistory";

export default function App() {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState("conectando...");
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const matchData = await fetchMatch();
        setMatch(matchData);

        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function connectWs() {
      cleanup = await subscribeToUpdates(
        (updated) => {
          setScoreHistory((prev) => [
            {
              homeScore: updated.homeScore,
              awayScore: updated.awayScore,
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ]);
          setMatch(updated);
        },
        (event) => {
          setEvents((prev) => {
            if (prev.some((e) => e.id === event.id)) return prev;
            return [event, ...prev];
          });
        },
        (err) => {
          console.error("WebSocket error:", err);
          setWsStatus("sin conexión en tiempo real");
        },
      );
      setWsStatus("conectado");
    }

    connectWs();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

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

  if (error) {
    return (
      <div
        style={{ padding: "2rem", color: "#c0392b", fontFamily: "sans-serif" }}
      >
        <strong>Error:</strong> {error}
        <p style={{ fontSize: "0.85rem", color: "#555" }}>
          Verifica que el servidor Spring Boot está corriendo en{" "}
          {import.meta.env.VITE_API_URL || "http://localhost:8080"}
        </p>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", color: "#555" }}>
        Conectando con el servidor... ({wsStatus})
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "1.1rem",
          color: "#888",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Panel de Partido en Vivo
      </h1>
      <p style={{ fontSize: "0.8rem", color: "#aaa", margin: "0 0 1rem" }}>
        WebSocket:{" "}
        <span style={{ fontWeight: "bold", color: "#4caf50" }}>
          ● {wsStatus}
        </span>
      </p>

      <Scoreboard
        match={match}
        onGoalHome={goalHome}
        onGoalAway={goalAway}
        onReset={handleReset}
      />

      <ScoreHistory history={scoreHistory} />

      <NewEventForm onAddEvent={handleAddEvent} />

      <EventFeed events={events} />
    </div>
  );
}
