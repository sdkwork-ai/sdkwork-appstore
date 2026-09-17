import { PublisherState } from '../../state/PublisherState';

/** Presentation view model for the publisher capability. */
@Observed
export class PublisherViewModel {
  readonly state: PublisherState = new PublisherState();

  get capability(): string {
    return 'publisher';
  }
}
