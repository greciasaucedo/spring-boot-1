package com.labpartido.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_state")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String matchName;
  private Integer homeScore = 0;
  private Integer awayScore = 0;

  @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
  private LocalDateTime updatedAt;

  @PreUpdate
  @PrePersist
  public void setUpdatedAt() {
    this.updatedAt = LocalDateTime.now();
  }
}
