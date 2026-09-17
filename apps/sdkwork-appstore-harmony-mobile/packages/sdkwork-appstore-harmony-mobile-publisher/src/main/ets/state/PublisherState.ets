import { PublisherPageResult } from '../models/PublisherModels';

export enum PublisherStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class PublisherState {
  status: PublisherStatus = PublisherStatus.Idle;
  lastResult?: PublisherPageResult<object>;
  error?: string;

  loading(): void {
    this.status = PublisherStatus.Loading;
    this.error = undefined;
  }

  loaded(result: PublisherPageResult<object>): void {
    this.status = PublisherStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = PublisherStatus.Error;
    this.error = message;
  }
}
