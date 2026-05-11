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
