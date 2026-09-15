import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AppstoreAdminServiceError,
  toAppstoreAdminServiceError,
} from '../services/errors';
import {
  AppstoreAdminService,
  type AppstoreAdminServicePorts,
} from '../services/registry';

/**
 * Resolve the configured backend-admin service ports for a component render.
 *
 * Ports are bound once during bootstrap, before the operator console mounts, so
 * memoizing on an empty dependency list is correct and avoids re-reading the
 * ambient registry on every render.
 * @throws AppstoreAdminRuntimeUnconfiguredError when bootstrap wiring is missing.
 */
export function useAppstoreAdminServices(): AppstoreAdminServicePorts {
  return useMemo(() => AppstoreAdminService, []);
}

/** Observable state of one backend-admin read operation. */
export interface AppstoreAdminQueryState<TResult> {
  data: TResult | undefined;
  /** `true` while a load is in flight, including reloads. */
  loading: boolean;
  /** Normalized failure of the most recent load, cleared on the next success. */
  error: AppstoreAdminServiceError | undefined;
  /** Re-run the loader, for example from a refresh action. */
  reload: () => void;
}

/**
 * Run one backend-admin read operation with uniform loading/error state.
 *
 * Every operator page needs the same three-state contract (loading, data,
 * normalized error), so it lives here instead of being re-implemented per page.
 * Results from a superseded render are discarded, and the previous data is kept
 * visible while a refresh is in flight.
 *
 * @param operationId - catalog operation id recorded on failures.
 * @param loader - deferred read returning the normalized view model.
 * @param deps - dependency list controlling when the loader re-runs.
 */
export function useAppstoreAdminQuery<TResult>(
  operationId: string,
  loader: () => Promise<TResult>,
  deps: readonly unknown[],
): AppstoreAdminQueryState<TResult> {
  const [state, setState] = useState<{
    data: TResult | undefined;
    loading: boolean;
    error: AppstoreAdminServiceError | undefined;
  }>({ data: undefined, loading: true, error: undefined });
  const [reloadToken, setReloadToken] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: undefined }));
    loaderRef
      .current()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: undefined });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error: toAppstoreAdminServiceError(error, operationId),
          }));
        }
      });
    return () => {
      cancelled = true;
    };
    // `deps` is forwarded verbatim so callers control reload semantics.
  }, [operationId, reloadToken, ...deps]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
}
