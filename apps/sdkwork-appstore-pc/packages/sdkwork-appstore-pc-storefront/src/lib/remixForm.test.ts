import { describe, expect, it } from 'vitest';

import {
  defaultRemixProjectName,
  initialRemixFormValues,
  remixCloneCommand,
  repositoryPageUrl,
  shortRef,
  validateRemixForm,
  REMIX_DEVICE_THIS_COMPUTER,
} from './remixForm';

describe('remix form validation', () => {
  it('requires a project name and a source folder', () => {
    const values = { projectName: '  ', deviceId: REMIX_DEVICE_THIS_COMPUTER, folderName: null };
    expect(validateRemixForm(values)).toEqual(['project-name-required', 'folder-required']);
  });

  it('accepts a filled form', () => {
    expect(
      validateRemixForm({
        projectName: 'my-project',
        deviceId: REMIX_DEVICE_THIS_COMPUTER,
        folderName: 'projects',
      }),
    ).toEqual([]);
  });

  it('does not require a folder in the download fallback', () => {
    expect(
      validateRemixForm(
        { projectName: 'my-project', deviceId: REMIX_DEVICE_THIS_COMPUTER, folderName: null },
        { folderRequired: false },
      ),
    ).toEqual([]);
  });

  it('rejects a device the page cannot write to', () => {
    expect(
      validateRemixForm({
        projectName: 'my-project',
        deviceId: 'phone',
        folderName: 'projects',
      }),
    ).toEqual(['device-unsupported']);
  });

  it('suggests a folder-safe project name', () => {
    expect(initialRemixFormValues('SDKWork Notes').projectName).toBe('sdkwork-notes');
    expect(defaultRemixProjectName('  ')).toBe('remix-project');
    expect(defaultRemixProjectName('应用 A')).toBe('a');
  });
});

describe('remix git instructions', () => {
  it('shortens fully-qualified refs', () => {
    expect(shortRef('refs/heads/main')).toBe('main');
    expect(shortRef('refs/tags/v1.2.0')).toBe('v1.2.0');
    expect(shortRef(' main ')).toBe('main');
  });

  it('builds a clone command including the sub path', () => {
    const lines = remixCloneCommand(
      {
        repoUrl: 'https://git.example.test/acme/app.git',
        repoRef: 'refs/heads/main',
        subPath: 'apps/desktop',
      },
      'my-project',
    );

    expect(lines).toEqual([
      'git clone --depth 1 --branch main https://git.example.test/acme/app.git my-project',
      'cd my-project/apps/desktop',
    ]);
  });

  it('quotes a project name that contains spaces', () => {
    const lines = remixCloneCommand(
      { repoUrl: 'https://git.example.test/acme/app.git', repoRef: 'main' },
      'my project',
    );

    expect(lines[0]).toContain('"my project"');
    expect(lines).toHaveLength(1);
  });

  it('exposes the repository page for http(s) clone urls only', () => {
    expect(repositoryPageUrl('https://github.com/acme/app.git')).toBe(
      'https://github.com/acme/app',
    );
    expect(repositoryPageUrl('git@github.com:acme/app.git')).toBeNull();
  });
});
