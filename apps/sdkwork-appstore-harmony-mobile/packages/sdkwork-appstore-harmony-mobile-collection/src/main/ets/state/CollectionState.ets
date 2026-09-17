import { CollectionPageResult } from '../models/CollectionModels';

export enum CollectionStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class CollectionState {
  status: CollectionStatus = CollectionStatus.Idle;
  lastResult?: CollectionPageResult<object>;
  error?: string;

  loading(): void {
    this.status = CollectionStatus.Loading;
    this.error = undefined;
  }

  loaded(result: CollectionPageResult<object>): void {
    this.status = CollectionStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = CollectionStatus.Error;
    this.error = message;
  }
}
