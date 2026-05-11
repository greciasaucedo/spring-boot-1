package com.labpartido.websocket;

import com.labpartido.model.Match;
import com.labpartido.model.Event;
import com.labpartido.service.MatchService;
import com.labpartido.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketNotifier {
  private final SimpMessagingTemplate messagingTemplate;
  private final MatchService matchService;
  private final EventService eventService;

  /**
   * Notifica a todos los clientes conectados que el marcador cambió.
   */
  public void notifyMatchUpdate(Long matchId) {
    Match match = matchService.getMatch();
    messagingTemplate.convertAndSend("/topic/match/update", match);
  }

  /**
   * Notifica a todos los clientes conectados que se agregó un evento.
   */
  public void notifyEventAdded(Event event) {
    messagingTemplate.convertAndSend("/topic/match/event", event);
  }
}
