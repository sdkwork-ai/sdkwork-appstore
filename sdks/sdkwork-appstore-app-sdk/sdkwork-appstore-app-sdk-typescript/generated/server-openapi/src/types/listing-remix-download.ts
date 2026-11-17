import type { ListingRemixArchiveCoordinates } from './listing-remix-archive-coordinates';
import type { ListingRemixGitCoordinates } from './listing-remix-git-coordinates';

/** Deploy-owned download coordinates projected for the storefront. `mode` selects which coordinate object is populated; the other is absent. */
export interface ListingRemixDownload {
  mode: 'GIT' | 'ARCHIVE';
  git?: ListingRemixGitCoordinates;
  archive?: ListingRemixArchiveCoordinates;
}
