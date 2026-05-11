-- ================================================================
-- LABORATORIO: Panel de Partido — Spring Boot + React
-- ================================================================
-- Compatible con H2 (desarrollo) y MySQL (producción)

-- Tabla de estado del partido
CREATE TABLE match_state (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  match_name   VARCHAR(255) NOT NULL,
  home_score   INT NOT NULL DEFAULT 0,
  away_score   INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos
CREATE TABLE match_events (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type   VARCHAR(100) NOT NULL,
  minute       INT,
  description  VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO match_state (match_name, home_score, away_score)
VALUES ('Real Madrid vs Barcelona', 0, 0);

INSERT INTO match_events (event_type, minute, description) VALUES
  ('Inicio',           1,  'Pitido inicial — comienza el partido'),
  ('Falta',           12,  'Falta cometida por el equipo visitante'),
  ('Saque de esquina', 18, 'Córner para el equipo local');
