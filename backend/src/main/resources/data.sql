INSERT INTO match_state (match_name, home_score, away_score)
VALUES ('Real Madrid vs Barcelona', 0, 0);

INSERT INTO match_events (event_type, minute, description) VALUES
  ('Inicio',           1,  'Pitido inicial — comienza el partido'),
  ('Falta',           12,  'Falta cometida por el equipo visitante'),
  ('Saque de esquina', 18, 'Córner para el equipo local');
