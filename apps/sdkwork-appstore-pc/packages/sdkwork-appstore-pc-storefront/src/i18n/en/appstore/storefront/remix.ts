export const remix = {
  action: 'Remix',
  title: 'Create a local project',
  subtitle: 'Take the source of {{name}} into a local project.',
  close: 'Done',
  form: {
    projectName: 'Project name',
    device: 'Device',
    deviceThisComputer: 'This computer',
    sourceFolder: 'Source folder',
    chooseFolder: 'Choose folder',
    noFolder: 'No folder selected',
    fallbackNotice:
      'This browser cannot write files into a folder directly (File System Access API is unavailable). The source archive will be downloaded as a .zip file instead.',
    cancel: 'Cancel',
    confirm: 'Create project',
    download: 'Download archive'
  },
  running: {
    loading: 'Reading remix instructions…',
    downloading: 'Downloading the source archive…',
    verifying: 'Verifying the archive checksum…',
    writing: 'Writing the project files…'
  },
  git: {
    description:
      'A web page cannot run git. Run these commands in a terminal to create the project.',
    copy: 'Copy command',
    copied: 'Copied',
    subPath: 'The application lives in {{subPath}} inside the repository.',
    repository: 'Open repository',
    archiveNotice:
      'The store does not provide a repository archive download for Git sources. Download the archive from your Git host using the repository link above.'
  },
  written: {
    description: '{{count}} files were written into {{folder}}.'
  },
  downloaded: {
    description:
      '{{fileName}} was saved by your browser. Unpack it to finish creating the project.'
  },
  error: {
    'not-remixable': 'This app does not offer a remix download right now.',
    'deploy-unavailable':
      'The store cannot reach the deployment service, so remix availability cannot be confirmed. Try again later.',
    'download-failed': 'The source archive could not be downloaded.',
    'checksum-failed':
      'The downloaded archive does not match its published checksum, so it was discarded.',
    'unsupported-archive': 'The source archive format is not supported.',
    'unsafe-archive': 'The source archive contains unsafe paths and was rejected.',
    'write-failed': 'The project files could not be written into the chosen folder.',
    'payload-invalid': 'The remix instructions are incomplete.',
    unknown: 'An unexpected error stopped the remix.',
    retry: 'Try again',
    close: 'Close'
  },
  validation: {
    'project-name-required': 'Enter a project name.',
    'folder-required': 'Choose a source folder.',
    'device-unsupported': 'Only this computer can receive the project files.'
  }
};
