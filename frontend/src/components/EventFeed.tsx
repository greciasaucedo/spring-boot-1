import { MatchEvent } from "../types";
import { EVENT_ICONS } from "../constants/events";

interface Props {
  events: MatchEvent[];
}

export default function EventFeed({ events }: Props) {
  return (
    <div>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "#333" }}>
        Feed de eventos en vivo
      </h3>

      {events.length === 0 && (
        <p style={{ color: "#999", fontStyle: "italic" }}>Sin eventos todavía.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((ev) => (
          <li key={ev.id} style={styles.item}>
            <span style={styles.icon}>{EVENT_ICONS[ev.eventType] ?? "📌"}</span>

            <div style={{ flex: 1 }}>
              <span style={styles.type}>{ev.eventType}</span>
              {ev.minute != null && (
                <span style={styles.minute}> min. {ev.minute}</span>
              )}
              {ev.description && (
                <p style={styles.desc}>{ev.description}</p>
              )}
            </div>

            <span style={styles.time}>
              {new Date(ev.createdAt).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  item: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start" as const,
    padding: "0.65rem 0",
    borderBottom: "1px solid #eee",
  },
  icon: { fontSize: "1.2rem", lineHeight: 1.4 },
  type: { fontWeight: "bold", fontSize: "0.95rem" },
  minute: { color: "#888", fontSize: "0.82rem" },
  desc: { margin: "2px 0 0", fontSize: "0.82rem", color: "#555" },
  time: { marginLeft: "auto", fontSize: "0.72rem", color: "#bbb", whiteSpace: "nowrap" as const },
};
