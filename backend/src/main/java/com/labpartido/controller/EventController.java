package com.labpartido.controller;

import com.labpartido.model.Event;
import com.labpartido.service.EventService;
import com.labpartido.websocket.WebSocketNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EventController {
  private final EventService eventService;
  private final WebSocketNotifier webSocketNotifier;

  @GetMapping
  public List<Event> getAllEvents() {
    return eventService.getAllEvents();
  }

  @PostMapping
  public Event addEvent(@RequestBody Event event) {
    Event created = eventService.addEvent(event.getEventType(), event.getMinute(), event.getDescription());
    webSocketNotifier.notifyEventAdded(created);
    return created;
  }
}
