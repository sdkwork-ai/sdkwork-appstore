import { WishlistPageResult } from '../models/WishlistModels';

export enum WishlistStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class WishlistState {
  status: WishlistStatus = WishlistStatus.Idle;
  lastResult?: WishlistPageResult<object>;
  error?: string;

  loading(): void {
    this.status = WishlistStatus.Loading;
    this.error = undefined;
  }

  loaded(result: WishlistPageResult<object>): void {
    this.status = WishlistStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = WishlistStatus.Error;
    this.error = message;
  }
}
