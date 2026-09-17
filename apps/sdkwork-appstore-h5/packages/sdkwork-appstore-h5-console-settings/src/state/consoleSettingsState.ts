import type { ConsoleSettingsPageResult } from '../types/consoleSettingsModels';

export type ConsoleSettingsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ConsoleSettingsState<TItem> {
  readonly status: ConsoleSettingsStatus;
  readonly result?: ConsoleSettingsPageResult<TItem>;
  readonly error?: string;
}

export const initialConsoleSettingsState: ConsoleSettingsState<never> = { status: 'idle' };
