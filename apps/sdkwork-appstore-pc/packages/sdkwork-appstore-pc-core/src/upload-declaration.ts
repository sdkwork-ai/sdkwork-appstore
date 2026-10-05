/**
 * Application upload declaration constants.
 *
 * Authority: `DRIVE_SPEC.md` section 18 (Application Upload Declaration Contract).
 * Declared values live in `apps/sdkwork-appstore-pc/specs/upload.declaration.json`; this
 * module carries them into code so upload call sites reference a constant instead of
 * repeating literals.
 *
 * One purpose is declared: a release artifact is a distributable archive attached to a
 * release from the App Store PC surface.
 */

/** The call-origin label for release artifacts. */
export const APPSTORE_PC_ARTIFACT_SOURCE = 'artifact-upload' as const;

/** A release artifact (package archive) attached to a release from the App Store PC surface. */
export const APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD = {
  appResourceIdKind: 'entity',
  appResourceType: 'appstore.artifact',
  purpose: 'Release artifact archive attached to a release from the App Store PC surface.',
  retention: 'long_term',
  scene: 'appstore',
  source: APPSTORE_PC_ARTIFACT_SOURCE,
  uploadProfileCode: 'archive',
} as const;
