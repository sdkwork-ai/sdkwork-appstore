import { CollectionState } from '../../state/CollectionState';

/** Presentation view model for the collection capability. */
@Observed
export class CollectionViewModel {
  readonly state: CollectionState = new CollectionState();

  get capability(): string {
    return 'collection';
  }
}
