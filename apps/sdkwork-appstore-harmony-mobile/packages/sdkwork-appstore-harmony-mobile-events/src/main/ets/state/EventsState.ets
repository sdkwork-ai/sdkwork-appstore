import { EventsPageResult } from '../models/EventsModels';

export enum EventsStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class EventsState {
  status: EventsStatus = EventsStatus.Idle;
  lastResult?: EventsPageResult<object>;
  error?: string;

  loading(): void {
    this.status = EventsStatus.Loading;
    this.error = undefined;
  }

  loaded(result: EventsPageResult<object>): void {
    this.status = EventsStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = EventsStatus.Error;
    this.error = message;
  }
}
