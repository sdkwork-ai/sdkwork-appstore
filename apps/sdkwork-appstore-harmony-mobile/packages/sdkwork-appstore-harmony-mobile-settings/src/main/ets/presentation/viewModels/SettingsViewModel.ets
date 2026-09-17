import { SettingsState } from '../../state/SettingsState';

/** Presentation view model for the settings capability. */
@Observed
export class SettingsViewModel {
  readonly state: SettingsState = new SettingsState();

  get capability(): string {
    return 'settings';
  }
}
