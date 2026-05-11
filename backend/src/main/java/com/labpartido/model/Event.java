package com.labpartido.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String eventType;
  private Integer minute;
  private String description;

  @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
  private LocalDateTime createdAt;

  @PrePersist
  public void setCreatedAt() {
    this.createdAt = LocalDateTime.now();
  }
}
