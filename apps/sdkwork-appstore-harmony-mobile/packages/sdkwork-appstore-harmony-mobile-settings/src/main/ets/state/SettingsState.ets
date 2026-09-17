import { SettingsPageResult } from '../models/SettingsModels';

export enum SettingsStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class SettingsState {
  status: SettingsStatus = SettingsStatus.Idle;
  lastResult?: SettingsPageResult<object>;
  error?: string;

  loading(): void {
    this.status = SettingsStatus.Loading;
    this.error = undefined;
  }

  loaded(result: SettingsPageResult<object>): void {
    this.status = SettingsStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = SettingsStatus.Error;
    this.error = message;
  }
}
