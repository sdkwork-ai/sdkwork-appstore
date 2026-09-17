import { UserStorePageResult } from '../models/UserStoreModels';

export enum UserStoreStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class UserStoreState {
  status: UserStoreStatus = UserStoreStatus.Idle;
  lastResult?: UserStorePageResult<object>;
  error?: string;

  loading(): void {
    this.status = UserStoreStatus.Loading;
    this.error = undefined;
  }

  loaded(result: UserStorePageResult<object>): void {
    this.status = UserStoreStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = UserStoreStatus.Error;
    this.error = message;
  }
}
