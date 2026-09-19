/**
 * Application upload declaration constants.
 *
 * Authority: `DRIVE_SPEC.md` section 18 (Application Upload Declaration Contract).
 * Declared values live in `apps/sdkwork-appstore-h5/specs/upload.declaration.json`; this module
 * carries them into code so upload call sites reference a constant instead of repeating literals.
 *
 * Two purposes are declared, and they are distinct: listing media is a store listing's image, and
 * a release artifact is a distributable archive. They differ in `appResourceType`, `scene`, and
 * `uploadProfileCode`, so section 18.4 requires one entry each.
 */

export interface AppstoreH5UploadDeclarationEntry {
  readonly appResourceIdKind: 'application' | 'entity' | 'draft';
  readonly appResourceType: string;
  readonly purpose: string;
  readonly retention: 'long_term' | 'temporary';
  readonly scene: string;
  readonly source: string;
  readonly uploadProfileCode: string;
}

/** This application's canonical appId, from `sdkwork.app.config.json` `backend.appId`. */
export const APPSTORE_H5_APP_ID = 'sdkwork-appstore-h5' as const;

/** The call-origin label for store listings media. */
export const APPSTORE_H5_LISTING_MEDIA_SOURCE = 'listing-media' as const;

/** The call-origin label for release artifacts. */
export const APPSTORE_H5_ARTIFACT_SOURCE = 'artifact-upload' as const;

/** Store listing media (cover image, screenshot) uploaded from the App Store H5 surface. */
export const APPSTORE_H5_LISTING_MEDIA_UPLOAD = {
  appResourceIdKind: 'entity',
  appResourceType: 'appstore.listing.media',
  purpose: 'Store listing media uploaded from the App Store H5 surface.',
  retention: 'long_term',
  scene: 'appstore',
  source: APPSTORE_H5_LISTING_MEDIA_SOURCE,
  uploadProfileCode: 'image',
} as const satisfies AppstoreH5UploadDeclarationEntry;

/** A release artifact (package archive) attached to a release from the App Store H5 surface. */
export const APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD = {
  appResourceIdKind: 'entity',
  appResourceType: 'appstore.artifact',
  purpose: 'Release artifact archive attached to a release from the App Store H5 surface.',
  retention: 'long_term',
  scene: 'appstore',
  source: APPSTORE_H5_ARTIFACT_SOURCE,
  uploadProfileCode: 'archive',
} as const satisfies AppstoreH5UploadDeclarationEntry;

/** Every declared upload purpose for this application. */
export const APPSTORE_H5_UPLOAD_DECLARATIONS: readonly AppstoreH5UploadDeclarationEntry[] = [
  APPSTORE_H5_LISTING_MEDIA_UPLOAD,
  APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD,
];
