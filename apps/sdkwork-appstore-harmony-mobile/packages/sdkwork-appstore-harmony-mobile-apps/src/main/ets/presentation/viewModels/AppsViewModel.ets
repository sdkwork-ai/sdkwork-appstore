import { AppsState } from '../../state/AppsState';

/** Presentation view model for the apps capability. */
@Observed
export class AppsViewModel {
  readonly state: AppsState = new AppsState();

  get capability(): string {
    return 'apps';
  }
}
