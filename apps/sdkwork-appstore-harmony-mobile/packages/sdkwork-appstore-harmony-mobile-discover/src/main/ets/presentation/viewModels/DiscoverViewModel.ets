import { DiscoverState } from '../../state/DiscoverState';

/** Presentation view model for the discover capability. */
@Observed
export class DiscoverViewModel {
  readonly state: DiscoverState = new DiscoverState();

  get capability(): string {
    return 'discover';
  }
}
