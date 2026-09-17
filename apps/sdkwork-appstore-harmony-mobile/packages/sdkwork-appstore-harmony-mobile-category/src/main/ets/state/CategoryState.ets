import { CategoryPageResult } from '../models/CategoryModels';

export enum CategoryStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class CategoryState {
  status: CategoryStatus = CategoryStatus.Idle;
  lastResult?: CategoryPageResult<object>;
  error?: string;

  loading(): void {
    this.status = CategoryStatus.Loading;
    this.error = undefined;
  }

  loaded(result: CategoryPageResult<object>): void {
    this.status = CategoryStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = CategoryStatus.Error;
    this.error = message;
  }
}
