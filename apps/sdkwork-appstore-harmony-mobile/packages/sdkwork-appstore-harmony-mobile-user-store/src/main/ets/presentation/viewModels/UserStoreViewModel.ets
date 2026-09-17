import { UserStoreState } from '../../state/UserStoreState';

/** Presentation view model for the user-store capability. */
@Observed
export class UserStoreViewModel {
  readonly state: UserStoreState = new UserStoreState();

  get capability(): string {
    return 'user-store';
  }
}
