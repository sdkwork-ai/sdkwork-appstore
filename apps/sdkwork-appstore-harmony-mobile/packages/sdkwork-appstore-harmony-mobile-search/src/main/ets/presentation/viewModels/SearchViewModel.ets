import { SearchState } from '../../state/SearchState';

/** Presentation view model for the search capability. */
@Observed
export class SearchViewModel {
  readonly state: SearchState = new SearchState();

  get capability(): string {
    return 'search';
  }
}
