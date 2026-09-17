import type { AiHubPageResult } from '../types/aiHubModels';

export type AiHubStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AiHubState<TItem> {
  readonly status: AiHubStatus;
  readonly result?: AiHubPageResult<TItem>;
  readonly error?: string;
}

export const initialAiHubState: AiHubState<never> = { status: 'idle' };
