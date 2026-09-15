/**
 * `@sdkwork/appstore-pc-admin-moderation` — moderation capability for the App
 * Store operator console (review queue, review decisions, appeals).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`.
 */
export { appstoreAdminModerationModule } from './module';
export {
  APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE,
  adminModerationEnUS,
  adminModerationZhCN,
  appstoreAdminModerationI18nBundle,
} from './i18n';

export { ModerationQueuePage } from './pages/ModerationQueuePage';
export { ModerationReviewPage } from './pages/ModerationReviewPage';
export { ModerationAppealsPage } from './pages/ModerationAppealsPage';
export { ModerationAppealDetailPage } from './pages/ModerationAppealDetailPage';
