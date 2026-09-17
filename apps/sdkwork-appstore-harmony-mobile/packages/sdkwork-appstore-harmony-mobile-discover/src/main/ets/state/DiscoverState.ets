import { DiscoverPageResult } from '../models/DiscoverModels';

export enum DiscoverStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class DiscoverState {
  status: DiscoverStatus = DiscoverStatus.Idle;
  lastResult?: DiscoverPageResult<object>;
  error?: string;

  loading(): void {
    this.status = DiscoverStatus.Loading;
    this.error = undefined;
  }

  loaded(result: DiscoverPageResult<object>): void {
    this.status = DiscoverStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = DiscoverStatus.Error;
    this.error = message;
  }
}
