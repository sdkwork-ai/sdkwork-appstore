import { EventsState } from '../../state/EventsState';

/** Presentation view model for the events capability. */
@Observed
export class EventsViewModel {
  readonly state: EventsState = new EventsState();

  get capability(): string {
    return 'events';
  }
}
