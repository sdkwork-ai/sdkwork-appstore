/**
 * Capabilities composed by the app surface.
 *
 * Backend-admin capabilities are deliberately absent: they are owned by the
 * `backend-admin` surface and declared in the admin composition root
 * (`@sdkwork/appstore-pc-admin-core` `describeAppstoreAdminComposition`), not in
 * an app-surface manifest (`APP_PC_ARCHITECTURE_SPEC.md` §4).
 */
export const dependencyManifest = {
  applicationCode: "appstore",
  version: "1.0.0",
  capabilities: [
    "discover",
    "charts",
    "search",
    "updates",
    "app-detail",
    "console-settings"
  ]
};
