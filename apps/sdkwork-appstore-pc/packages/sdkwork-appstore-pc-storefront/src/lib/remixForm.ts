/**
 * Remix dialog form model.
 *
 * The dialog mirrors the desktop "create local project" flow: a project name, a
 * target device (only "this computer" can receive files a web page writes), and
 * a source folder. Validation is pure so the dialog, the confirm button, and the
 * tests share one rule set.
 */

import type { RemixGitCoordinates } from '@sdkwork/appstore-pc-core';

/** Device the remix project is created on. */
export const REMIX_DEVICE_THIS_COMPUTER = 'this-computer';

/** Field-level validation failure, translated by the dialog. */
export type RemixFormError =
  | 'project-name-required'
  | 'folder-required'
  | 'device-unsupported';

/** Values the dialog collects before it starts the remix. */
export interface RemixFormValues {
  projectName: string;
  deviceId: string;
  /** Display name of the picked folder; `null` until the user picks one. */
  folderName: string | null;
}

/** Empty form with a suggested project name. */
export function initialRemixFormValues(appName: string): RemixFormValues {
  return {
    projectName: defaultRemixProjectName(appName),
    deviceId: REMIX_DEVICE_THIS_COMPUTER,
    folderName: null,
  };
}

/**
 * Suggest a folder-safe project name from the listing name.
 * @param appName - storefront display name.
 * @returns a lowercase slug, never empty.
 */
export function defaultRemixProjectName(appName: string): string {
  const slug = appName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return slug || 'remix-project';
}

/**
 * Validate the dialog form.
 * @param values - current form values.
 * @param options - `folderRequired: false` for the download-fallback browser,
 *   where the file is saved to the browser's download location instead of a
 *   folder the user picks.
 * @returns the failures in display order; empty when the form is submittable.
 */
export function validateRemixForm(
  values: RemixFormValues,
  options: { folderRequired?: boolean } = {},
): RemixFormError[] {
  const failures: RemixFormError[] = [];
  if (values.projectName.trim() === '') {
    failures.push('project-name-required');
  }
  if (values.deviceId !== REMIX_DEVICE_THIS_COMPUTER) {
    failures.push('device-unsupported');
  }
  const folderRequired = options.folderRequired ?? true;
  if (folderRequired && (values.folderName === null || values.folderName.trim() === '')) {
    failures.push('folder-required');
  }
  return failures;
}

/** Quote one shell argument only when it needs quoting. */
function shellQuote(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '' || /^[A-Za-z0-9_./:@%+=,-]+$/u.test(trimmed)) {
    return trimmed;
  }
  return `"${trimmed.replaceAll('"', '\\"')}"`;
}

/**
 * Effective branch or tag name of a fully-qualified ref.
 * @param repoRef - ref as deploy reports it (`refs/heads/main`, `main`, ...).
 * @returns the short ref name the shell command uses.
 */
export function shortRef(repoRef: string): string {
  return repoRef
    .trim()
    .replace(/^refs\/heads\//u, '')
    .replace(/^refs\/tags\//u, '')
    .replace(/^refs\//u, '');
}

/**
 * Build the `git clone` command shown to the user.
 *
 * A web page cannot run git, so the dialog shows the command instead of
 * pretending to clone. The command is copy-pasteable and includes the sub path
 * as a `cd` step, because a repository may carry more than the application.
 *
 * @param git - deploy clone coordinates.
 * @param projectName - directory name the dialog collected.
 * @returns the command lines, one per entry.
 */
export function remixCloneCommand(git: RemixGitCoordinates, projectName: string): string[] {
  const target = shellQuote(projectName.trim() || defaultRemixProjectName(''));
  const ref = shortRef(git.repoRef);
  const branch = ref === '' ? '' : ` --branch ${shellQuote(ref)}`;
  const lines = [
    `git clone --depth 1${branch} ${shellQuote(git.repoUrl)} ${target}`,
  ];
  const subPath = git.subPath?.trim() ?? '';
  if (subPath !== '') {
    lines.push(`cd ${target}/${shellQuote(subPath)}`);
  }
  return lines;
}

/**
 * Browsable repository page for a clone URL.
 *
 * @param repoUrl - clone URL.
 * @returns the HTTP(S) repository page, or `null` for a non-HTTP URL.
 */
export function repositoryPageUrl(repoUrl: string): string | null {
  const trimmed = repoUrl.trim();
  if (!/^https?:\/\//iu.test(trimmed)) {
    return null;
  }
  const withoutGitSuffix = trimmed.replace(/\.git$/u, '');
  return withoutGitSuffix.replace(/\/+$/u, '');
}
