import { LibraryState } from '../../state/LibraryState';

/** Presentation view model for the library capability. */
@Observed
export class LibraryViewModel {
  readonly state: LibraryState = new LibraryState();

  get capability(): string {
    return 'library';
  }
}
