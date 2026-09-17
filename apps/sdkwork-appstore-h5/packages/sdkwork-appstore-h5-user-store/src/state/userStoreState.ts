import type { UserStorePageResult } from '../types/userStoreModels';

export type UserStoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UserStoreState<TItem> {
  readonly status: UserStoreStatus;
  readonly result?: UserStorePageResult<TItem>;
  readonly error?: string;
}

export const initialUserStoreState: UserStoreState<never> = { status: 'idle' };
