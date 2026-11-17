/** Clone coordinates. A web page cannot run git, so the client displays the command (and subPath) for the user to run. */
export interface ListingRemixGitCoordinates {
  /** Clone URL of the application repository. */
  repoUrl: string;
  /** Effective ref to check out. */
  repoRef: string;
  /** Directory inside the repository that holds the application, when the repository carries more than the application. */
  subPath?: string;
}
