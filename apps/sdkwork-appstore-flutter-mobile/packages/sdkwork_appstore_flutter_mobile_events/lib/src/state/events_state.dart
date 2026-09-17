import '../models/events_models.dart';

enum EventsStatus { idle, loading, ready, error }

class EventsState {
  const EventsState({
    this.status = EventsStatus.idle,
    this.lastResult,
    this.error,
  });

  final EventsStatus status;
  final EventsPageResult<Object?>? lastResult;
  final String? error;

  EventsState loading() => const EventsState(status: EventsStatus.loading);

  EventsState loaded(EventsPageResult<Object?> result) =>
      EventsState(status: EventsStatus.ready, lastResult: result);

  EventsState failed(String message) =>
      EventsState(status: EventsStatus.error, error: message);
}
