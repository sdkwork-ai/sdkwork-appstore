import { ChartsPageResult } from '../models/ChartsModels';

export enum ChartsStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class ChartsState {
  status: ChartsStatus = ChartsStatus.Idle;
  lastResult?: ChartsPageResult<object>;
  error?: string;

  loading(): void {
    this.status = ChartsStatus.Loading;
    this.error = undefined;
  }

  loaded(result: ChartsPageResult<object>): void {
    this.status = ChartsStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = ChartsStatus.Error;
    this.error = message;
  }
}
