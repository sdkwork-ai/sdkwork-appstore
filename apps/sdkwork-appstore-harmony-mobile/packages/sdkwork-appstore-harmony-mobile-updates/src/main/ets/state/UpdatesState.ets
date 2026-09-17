import { UpdatesPageResult } from '../models/UpdatesModels';

export enum UpdatesStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class UpdatesState {
  status: UpdatesStatus = UpdatesStatus.Idle;
  lastResult?: UpdatesPageResult<object>;
  error?: string;

  loading(): void {
    this.status = UpdatesStatus.Loading;
    this.error = undefined;
  }

  loaded(result: UpdatesPageResult<object>): void {
    this.status = UpdatesStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = UpdatesStatus.Error;
    this.error = message;
  }
}
