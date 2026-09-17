import { GamesPageResult } from '../models/GamesModels';

export enum GamesStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class GamesState {
  status: GamesStatus = GamesStatus.Idle;
  lastResult?: GamesPageResult<object>;
  error?: string;

  loading(): void {
    this.status = GamesStatus.Loading;
    this.error = undefined;
  }

  loaded(result: GamesPageResult<object>): void {
    this.status = GamesStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = GamesStatus.Error;
    this.error = message;
  }
}
