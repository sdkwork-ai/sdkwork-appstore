import { AppsPageResult } from '../models/AppsModels';

export enum AppsStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class AppsState {
  status: AppsStatus = AppsStatus.Idle;
  lastResult?: AppsPageResult<object>;
  error?: string;

  loading(): void {
    this.status = AppsStatus.Loading;
    this.error = undefined;
  }

  loaded(result: AppsPageResult<object>): void {
    this.status = AppsStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = AppsStatus.Error;
    this.error = message;
  }
}
