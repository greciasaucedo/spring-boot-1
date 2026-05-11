package com.labpartido.service;

import com.labpartido.model.Event;
import com.labpartido.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
  private final EventRepository eventRepository;

  public List<Event> getAllEvents() {
    return eventRepository.findAllByOrderByCreatedAtDesc();
  }

  public Event addEvent(String eventType, Integer minute, String description) {
    Event event = new Event();
    event.setEventType(eventType);
    event.setMinute(minute);
    event.setDescription(description);
    return eventRepository.save(event);
  }
}
