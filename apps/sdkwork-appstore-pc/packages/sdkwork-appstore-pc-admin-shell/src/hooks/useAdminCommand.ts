import { useCallback, useState } from 'react';
import {
  toAppstoreAdminServiceError,
  type AppstoreAdminServiceError,
} from '@sdkwork/appstore-pc-admin-core';

/** Observable state of one operator mutation. */
export interface AppstoreAdminCommandState {
  /** `true` while the mutation is in flight; guards double submission. */
  submitting: boolean;
  /** Normalized failure of the last attempt. */
  error: AppstoreAdminServiceError | undefined;
  /** `true` after the last attempt succeeded, until `reset()` is called. */
  succeeded: boolean;
  /**
   * Execute the mutation.
   * @param operation - deferred backend-admin command.
   * @returns `true` on success, `false` when the failure was normalized.
   */
  run: (operation: () => Promise<unknown>) => Promise<boolean>;
  /** Clear success and error state, for example when reopening a dialog. */
  reset: () => void;
}

/**
 * Uniform command state for operator mutations.
 *
 * Every decision, assignment, and catalog write needs the same
 * submitting/error/success contract, so capability packages compose this hook
 * instead of re-implementing in-flight guards and error normalization.
 *
 * @param operationId - catalog operation id recorded on failures.
 */
export function useAdminCommand(operationId: string): AppstoreAdminCommandState {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AppstoreAdminServiceError | undefined>(undefined);
  const [succeeded, setSucceeded] = useState(false);

  const run = useCallback(
    async (operation: () => Promise<unknown>): Promise<boolean> => {
      setSubmitting(true);
      setError(undefined);
      setSucceeded(false);
      try {
        await operation();
        setSucceeded(true);
        return true;
      } catch (cause: unknown) {
        setError(toAppstoreAdminServiceError(cause, operationId));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [operationId],
  );

  const reset = useCallback(() => {
    setError(undefined);
    setSucceeded(false);
  }, []);

  return { submitting, error, succeeded, run, reset };
}
