package com.labpartido.controller;

import com.labpartido.model.Match;
import com.labpartido.service.MatchService;
import com.labpartido.websocket.WebSocketNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MatchController {
  private final MatchService matchService;
  private final WebSocketNotifier webSocketNotifier;

  @GetMapping
  public Match getMatch() {
    return matchService.getMatch();
  }

  @PutMapping("/{id}")
  public Match updateScore(@PathVariable Long id, @RequestBody Match match) {
    Match updated = matchService.updateScore(id, match.getHomeScore(), match.getAwayScore());
    webSocketNotifier.notifyMatchUpdate(id);
    return updated;
  }

  @PostMapping("/{id}/reset")
  public Match resetScore(@PathVariable Long id) {
    Match updated = matchService.resetScore(id);
    webSocketNotifier.notifyMatchUpdate(id);
    return updated;
  }
}
