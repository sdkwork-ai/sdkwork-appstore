/**
 * Remix dialog state and failure classification.
 *
 * Kept out of the component so the branch and error mapping are unit-testable:
 * a `404` means "this listing cannot be remixed", a `503` means the deploy
 * integration is not configured, and the remaining failures are mapped from the
 * workflow's typed errors.
 */

import type { ListingRemixDownload } from '@sdkwork/appstore-pc-core';

import {
  RemixIntegrityError,
  RemixPayloadError,
  isRemixZipError,
  type RemixOutcome,
} from '../../lib/remixWorkflow';

/** Why a remix attempt failed, as the dialog presents it. */
export type RemixErrorKind =
  | 'not-remixable'
  | 'deploy-unavailable'
  | 'download-failed'
  | 'checksum-failed'
  | 'unsupported-archive'
  | 'unsafe-archive'
  | 'write-failed'
  | 'payload-invalid'
  | 'unknown';

/** Dialog lifecycle. */
export type RemixDialogState =
  | { kind: 'form' }
  | { kind: 'running'; step: 'loading' | 'downloading' | 'verifying' | 'writing' }
  | { kind: 'git'; download: ListingRemixDownload }
  | { kind: 'written'; filesWritten: number; directoryName: string }
  | { kind: 'downloaded'; fileName: string }
  | { kind: 'error'; error: RemixErrorKind };

/**
 * HTTP status of a generated SDK error, when the object carries one.
 * @param error - thrown value.
 * @returns the status code, or `undefined`.
 */
export function httpStatusOf(error: unknown): number | undefined {
  if (error === null || typeof error !== 'object') {
    return undefined;
  }
  const status = (error as { httpStatus?: unknown }).httpStatus;
  return typeof status === 'number' ? status : undefined;
}

/**
 * Classify a thrown remix failure for the dialog.
 * @param error - thrown value.
 * @returns the presentation bucket.
 */
export function classifyRemixError(error: unknown): RemixErrorKind {
  const status = httpStatusOf(error);
  if (status === 404) {
    return 'not-remixable';
  }
  if (status === 503) {
    return 'deploy-unavailable';
  }
  if (error instanceof RemixIntegrityError) {
    return 'checksum-failed';
  }
  if (error instanceof RemixPayloadError) {
    return 'payload-invalid';
  }
  if (isRemixZipError(error)) {
    switch (error.reason) {
      case 'write-failed':
        return 'write-failed';
      case 'unsafe-path':
        return 'unsafe-archive';
      default:
        return 'unsupported-archive';
    }
  }
  if (error instanceof TypeError || (error instanceof Error && /fetch|network/iu.test(error.message))) {
    return 'download-failed';
  }
  return 'unknown';
}

/**
 * Map a workflow outcome onto the dialog state.
 * @param outcome - terminal workflow outcome.
 * @returns the dialog state to render.
 */
export function dialogStateForOutcome(outcome: RemixOutcome): RemixDialogState {
  switch (outcome.status) {
    case 'git':
      return { kind: 'git', download: outcome.download };
    case 'written':
      return {
        kind: 'written',
        filesWritten: outcome.filesWritten,
        directoryName: outcome.directoryName,
      };
    case 'downloaded':
      return { kind: 'downloaded', fileName: outcome.fileName };
    case 'cancelled':
      return { kind: 'form' };
  }
}
