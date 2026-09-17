import { GamesState } from '../../state/GamesState';

/** Presentation view model for the games capability. */
@Observed
export class GamesViewModel {
  readonly state: GamesState = new GamesState();

  get capability(): string {
    return 'games';
  }
}
