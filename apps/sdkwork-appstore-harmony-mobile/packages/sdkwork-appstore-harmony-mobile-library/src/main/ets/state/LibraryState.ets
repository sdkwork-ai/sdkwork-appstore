import { LibraryPageResult } from '../models/LibraryModels';

export enum LibraryStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class LibraryState {
  status: LibraryStatus = LibraryStatus.Idle;
  lastResult?: LibraryPageResult<object>;
  error?: string;

  loading(): void {
    this.status = LibraryStatus.Loading;
    this.error = undefined;
  }

  loaded(result: LibraryPageResult<object>): void {
    this.status = LibraryStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = LibraryStatus.Error;
    this.error = message;
  }
}
