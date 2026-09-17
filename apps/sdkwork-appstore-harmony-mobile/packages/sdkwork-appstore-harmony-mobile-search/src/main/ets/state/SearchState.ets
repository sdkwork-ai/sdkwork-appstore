import { SearchPageResult } from '../models/SearchModels';

export enum SearchStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class SearchState {
  status: SearchStatus = SearchStatus.Idle;
  lastResult?: SearchPageResult<object>;
  error?: string;

  loading(): void {
    this.status = SearchStatus.Loading;
    this.error = undefined;
  }

  loaded(result: SearchPageResult<object>): void {
    this.status = SearchStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = SearchStatus.Error;
    this.error = message;
  }
}
