import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { FolderOpen, Loader2, Terminal, X } from 'lucide-react';
import type { AppItem, ListingRemixDownload } from '@sdkwork/appstore-pc-core';
import {
  getRemixArchiveDownloadPort,
  saveDownloadedFile,
} from '@sdkwork/appstore-pc-core';

import { AppStoreService } from '../../services/api';
import {
  defaultRemixProjectName,
  initialRemixFormValues,
  remixCloneCommand,
  repositoryPageUrl,
  validateRemixForm,
  REMIX_DEVICE_THIS_COMPUTER,
  type RemixFormError,
  type RemixFormValues,
} from '../../lib/remixForm';
import {
  directoryPickerFor,
  runRemix,
  supportsDirectoryPicker,
  type RemixWorkflowDeps,
} from '../../lib/remixWorkflow';
import type { RemixDirectoryHandle } from '../../lib/remixZip';
import {
  classifyRemixError,
  dialogStateForOutcome,
  type RemixDialogState,
} from './remixDialog';

interface RemixModalProps {
  app: AppItem;
  onClose: () => void;
}

/** "This computer" is the only device a web page can write a project onto. */
const DEVICE_OPTIONS = [REMIX_DEVICE_THIS_COMPUTER] as const;

function downloadHost(): DirectoryPickerHost | undefined {
  return typeof window === 'undefined' ? undefined : (window as DirectoryPickerHost);
}

type DirectoryPickerHost = Parameters<typeof supportsDirectoryPicker>[0];

/**
 * Remix dialog: collect a project name, the target device, and a source folder,
 * then either write the unpacked archive into that folder or present the Git
 * clone instructions. The dialog also owns every failure state the remix can
 * end in (not remixable, deploy unavailable, download, checksum, write).
 */
export function RemixModal({ app, onClose }: RemixModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<RemixFormValues>(() => initialRemixFormValues(app.name));
  const [errors, setErrors] = useState<RemixFormError[]>([]);
  const [state, setState] = useState<RemixDialogState>({ kind: 'form' });
  const [copied, setCopied] = useState(false);
  const directoryRef = useRef<RemixDirectoryHandle | null>(null);

  const picker = useMemo(() => directoryPickerFor(downloadHost()), []);
  const fallbackMode = picker === undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.kind !== 'running') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, state.kind]);

  const handlePickFolder = useCallback(async () => {
    if (picker === undefined) {
      return;
    }
    const handle = await picker().catch(() => null);
    if (handle === null) {
      return;
    }
    directoryRef.current = handle;
    setValues((current) => ({ ...current, folderName: handle.name ?? '' }));
    setErrors((current) => current.filter((error) => error !== 'folder-required'));
  }, [picker]);

  const handleSubmit = useCallback(async () => {
    const failures = validateRemixForm(values, { folderRequired: !fallbackMode });
    setErrors(failures);
    if (failures.length > 0) {
      return;
    }
    setState({ kind: 'running', step: 'loading' });
    const deps: RemixWorkflowDeps = {
      getRemix: (listingId) => AppStoreService.getListingRemix(listingId),
      fetchArchive: (coordinates) =>
        getRemixArchiveDownloadPort().downloadArchive(coordinates),
      saveArchive: async (bytes, fileName) => {
        const blob = new Blob([new Uint8Array(bytes).buffer], { type: acceptanceType(fileName) });
        const result = await saveDownloadedFile(blob, fileName);
        if (result.status === 'unavailable') {
          throw new Error('The browser could not save the archive.');
        }
      },
      ...(picker === undefined
        ? {}
        : {
            pickDirectory: async () => directoryRef.current,
          }),
    };
    try {
      const outcome = await runRemix(deps, app.id);
      setState(dialogStateForOutcome(outcome));
    } catch (error) {
      setState({ kind: 'error', error: classifyRemixError(error) });
    }
  }, [app.id, fallbackMode, picker, values]);

  const handleRetry = useCallback(() => {
    setState({ kind: 'form' });
  }, []);

  const copyCommand = useCallback(async (download: ListingRemixDownload) => {
    const git = download.git;
    if (git === undefined) {
      return;
    }
    const command = remixCloneCommand(git, values.projectName).join('\n');
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the command stays visible for manual copy.
    }
  }, [values.projectName]);

  const busy = state.kind === 'running';
  const titleId = 'remix-dialog-title';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-store-overlay backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-store-modal border border-store-line-soft bg-store-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-store-ink">
              {t('remix.title')}
            </h2>
            <p className="mt-1 text-sm text-store-ink-faint">
              {t('remix.subtitle', { name: app.name })}
            </p>
          </div>
          <button
            type="button"
            aria-label={t('remix.close')}
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-store-ink-faint transition-colors hover:bg-store-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.kind === 'form' && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div>
              <label htmlFor="remix-project-name" className="mb-1 block text-sm font-medium text-store-ink">
                {t('remix.form.projectName')}
              </label>
              <input
                id="remix-project-name"
                type="text"
                value={values.projectName}
                placeholder={defaultRemixProjectName(app.name)}
                aria-invalid={errors.includes('project-name-required')}
                aria-describedby={
                  errors.includes('project-name-required') ? 'remix-project-name-error' : undefined
                }
                onChange={(event) => {
                  const projectName = event.target.value;
                  setValues((current) => ({ ...current, projectName }));
                  if (projectName.trim() !== '') {
                    setErrors((current) => current.filter((error) => error !== 'project-name-required'));
                  }
                }}
                className="w-full rounded-store-control border border-store-line-soft bg-store-raised px-3 py-2 text-sm text-store-ink outline-none focus:border-store-brand"
              />
              {errors.includes('project-name-required') && (
                <p id="remix-project-name-error" role="alert" className="mt-1 text-xs text-store-danger">
                  {t('remix.validation.project-name-required')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="remix-device" className="mb-1 block text-sm font-medium text-store-ink">
                {t('remix.form.device')}
              </label>
              <select
                id="remix-device"
                value={values.deviceId}
                onChange={(event) => {
                  setValues((current) => ({ ...current, deviceId: event.target.value }));
                }}
                className="w-full rounded-store-control border border-store-line-soft bg-store-raised px-3 py-2 text-sm text-store-ink outline-none focus:border-store-brand"
              >
                {DEVICE_OPTIONS.map((device) => (
                  <option key={device} value={device}>
                    {t('remix.form.deviceThisComputer')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-store-ink">
                {t('remix.form.sourceFolder')}
              </span>
              {fallbackMode ? (
                <p className="rounded-store-control border border-store-line-soft bg-store-subtle px-3 py-2 text-xs text-store-ink-soft">
                  {t('remix.form.fallbackNotice')}
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handlePickFolder();
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-store-control border border-store-line-soft bg-store-raised px-3 py-2 text-sm font-medium text-store-ink transition-colors hover:bg-store-subtle"
                  >
                    <FolderOpen className="h-4 w-4" />
                    {t('remix.form.chooseFolder')}
                  </button>
                  <span className="truncate text-sm text-store-ink-faint">
                    {values.folderName === null || values.folderName === ''
                      ? t('remix.form.noFolder')
                      : values.folderName}
                  </span>
                </div>
              )}
              {errors.includes('folder-required') && (
                <p role="alert" className="mt-1 text-xs text-store-danger">
                  {t('remix.validation.folder-required')}
                </p>
              )}
              {errors.includes('device-unsupported') && (
                <p role="alert" className="mt-1 text-xs text-store-danger">
                  {t('remix.validation.device-unsupported')}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-store-control bg-store-raised px-4 py-2 text-sm font-medium text-store-ink transition-colors hover:bg-store-subtle"
              >
                {t('remix.form.cancel')}
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-store-control bg-store-brand px-4 py-2 text-sm font-medium text-store-on-brand transition-colors hover:bg-store-brand-hover"
              >
                {fallbackMode ? t('remix.form.download') : t('remix.form.confirm')}
              </button>
            </div>
          </form>
        )}

        {state.kind === 'running' && (
          <div className="flex items-center gap-3 rounded-store-control bg-store-subtle px-4 py-3 text-sm text-store-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t(`remix.running.${state.step}`)}</span>
          </div>
        )}

        {state.kind === 'git' && state.download.git !== undefined && (
          <GitInstructions
            download={state.download}
            projectName={values.projectName}
            copied={copied}
            onCopy={() => {
              void copyCommand(state.download);
            }}
            onClose={onClose}
          />
        )}

        {state.kind === 'written' && (
          <div className="space-y-4">
            <p className="text-sm text-store-ink-soft">
              {t('remix.written.description', {
                count: state.filesWritten,
                folder: state.directoryName || values.folderName || '',
              })}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-store-control bg-store-brand px-4 py-2 text-sm font-medium text-store-on-brand"
              >
                {t('remix.close')}
              </button>
            </div>
          </div>
        )}

        {state.kind === 'downloaded' && (
          <div className="space-y-4">
            <p className="text-sm text-store-ink-soft">
              {t('remix.downloaded.description', { fileName: state.fileName })}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-store-control bg-store-brand px-4 py-2 text-sm font-medium text-store-on-brand"
              >
                {t('remix.close')}
              </button>
            </div>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-store-danger">
              {t(`remix.error.${state.error}`)}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-store-control bg-store-raised px-4 py-2 text-sm font-medium text-store-ink"
              >
                {t('remix.error.close')}
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="cursor-pointer rounded-store-control bg-store-brand px-4 py-2 text-sm font-medium text-store-on-brand"
              >
                {t('remix.error.retry')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface GitInstructionsProps {
  download: ListingRemixDownload;
  projectName: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

function GitInstructions({ download, projectName, copied, onCopy, onClose }: GitInstructionsProps) {
  const { t } = useTranslation();
  const git = download.git;
  if (git === undefined) {
    return null;
  }
  const command = remixCloneCommand(git, projectName);
  const pageUrl = repositoryPageUrl(git.repoUrl);
  const subPath = git.subPath?.trim() ?? '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-store-ink-soft">{t('remix.git.description')}</p>
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-store-ink-faint" />
        <pre className="flex-1 overflow-x-auto rounded-store-control border border-store-line-soft bg-store-subtle px-3 py-2 text-xs text-store-ink">
          {command.join('\n')}
        </pre>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopy}
          className="cursor-pointer rounded-store-control bg-store-raised px-3 py-1.5 text-xs font-medium text-store-ink transition-colors hover:bg-store-subtle"
        >
          {copied ? t('remix.git.copied') : t('remix.git.copy')}
        </button>
        {pageUrl !== null && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs font-medium text-store-brand hover:underline"
          >
            {t('remix.git.repository')}
          </a>
        )}
      </div>
      {subPath !== '' && (
        <p className="text-xs text-store-ink-faint">
          {t('remix.git.subPath', { subPath })}
        </p>
      )}
      <p className="rounded-store-control border border-store-line-soft bg-store-subtle px-3 py-2 text-xs text-store-ink-soft">
        {t('remix.git.archiveNotice')}
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-store-control bg-store-brand px-4 py-2 text-sm font-medium text-store-on-brand"
        >
          {t('remix.close')}
        </button>
      </div>
    </div>
  );
}

/** Archive MIME type used for the fallback download. */
function acceptanceType(fileName: string): string {
  return fileName.toLowerCase().endsWith('.zip') ? 'application/zip' : 'application/octet-stream';
}
