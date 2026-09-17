import { UpdatesState } from '../../state/UpdatesState';

/** Presentation view model for the updates capability. */
@Observed
export class UpdatesViewModel {
  readonly state: UpdatesState = new UpdatesState();

  get capability(): string {
    return 'updates';
  }
}
