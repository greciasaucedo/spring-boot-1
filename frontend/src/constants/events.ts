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
