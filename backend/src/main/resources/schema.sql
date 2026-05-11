DROP TABLE IF EXISTS match_events;
DROP TABLE IF EXISTS match_state;

CREATE TABLE match_state (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  match_name   VARCHAR(255) NOT NULL,
  home_score   INT NOT NULL DEFAULT 0,
  away_score   INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type   VARCHAR(100) NOT NULL,
  minute       INT,
  description  VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
