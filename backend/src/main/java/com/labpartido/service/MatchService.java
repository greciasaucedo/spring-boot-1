package com.labpartido.service;

import com.labpartido.model.Match;
import com.labpartido.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {
  private final MatchRepository matchRepository;

  public Match getMatch() {
    List<Match> matches = matchRepository.findAll();
    if (matches.isEmpty()) {
      Match newMatch = new Match();
      newMatch.setMatchName("Real Madrid vs Barcelona");
      newMatch.setHomeScore(0);
      newMatch.setAwayScore(0);
      return matchRepository.save(newMatch);
    }
    return matches.get(0);
  }

  public Match updateScore(Long id, Integer homeScore, Integer awayScore) {
    Match match = matchRepository.findById(id).orElseThrow();
    match.setHomeScore(homeScore);
    match.setAwayScore(awayScore);
    return matchRepository.save(match);
  }

  public Match resetScore(Long id) {
    Match match = matchRepository.findById(id).orElseThrow();
    match.setHomeScore(0);
    match.setAwayScore(0);
    return matchRepository.save(match);
  }
}
