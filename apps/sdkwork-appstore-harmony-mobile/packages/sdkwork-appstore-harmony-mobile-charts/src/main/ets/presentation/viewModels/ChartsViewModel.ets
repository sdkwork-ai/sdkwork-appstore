import { ChartsState } from '../../state/ChartsState';

/** Presentation view model for the charts capability. */
@Observed
export class ChartsViewModel {
  readonly state: ChartsState = new ChartsState();

  get capability(): string {
    return 'charts';
  }
}
