import { AppDetailState } from '../../state/AppDetailState';

/** Presentation view model for the app-detail capability. */
@Observed
export class AppDetailViewModel {
  readonly state: AppDetailState = new AppDetailState();

  get capability(): string {
    return 'app-detail';
  }
}
