import { AppDetailPageResult } from '../models/AppDetailModels';

export enum AppDetailStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class AppDetailState {
  status: AppDetailStatus = AppDetailStatus.Idle;
  lastResult?: AppDetailPageResult<object>;
  error?: string;

  loading(): void {
    this.status = AppDetailStatus.Loading;
    this.error = undefined;
  }

  loaded(result: AppDetailPageResult<object>): void {
    this.status = AppDetailStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = AppDetailStatus.Error;
    this.error = message;
  }
}
