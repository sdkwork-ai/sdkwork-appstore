import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE } from './i18n';
import { ModerationAppealDetailPage } from './pages/ModerationAppealDetailPage';
import { ModerationAppealsPage } from './pages/ModerationAppealsPage';
import { ModerationQueuePage } from './pages/ModerationQueuePage';
import { ModerationReviewPage } from './pages/ModerationReviewPage';

const readPermissions = [APPSTORE_ADMIN_PERMISSIONS.moderationRead] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'moderation.queue',
    path: 'moderation/queue',
    requiredPermissions: readPermissions,
    render: () => <ModerationQueuePage />,
    nav: {
      labelKey: 'adminModeration.queue.title',
      icon: 'list-checks',
      group: 'governance',
      order: 10,
    },
  },
  {
    id: 'moderation.review',
    path: 'moderation/reviews/:reviewId',
    requiredPermissions: readPermissions,
    render: () => <ModerationReviewPage />,
  },
  {
    id: 'moderation.appeals',
    path: 'moderation/appeals',
    requiredPermissions: readPermissions,
    render: () => <ModerationAppealsPage />,
    nav: {
      labelKey: 'adminModeration.appeals.title',
      icon: 'file-clock',
      group: 'governance',
      order: 20,
    },
  },
  {
    id: 'moderation.appealDetail',
    path: 'moderation/appeals/:appealId',
    requiredPermissions: readPermissions,
    render: () => <ModerationAppealDetailPage />,
  },
];

/**
 * Moderation capability module.
 *
 * Read routes require `appstore.moderation.read`; decision, assignment, and
 * appeal commands additionally evaluate `appstore.moderation.decide|assign|appeal`
 * inside the page (`BACKEND_UI_SPEC.md` §7).
 */
export const appstoreAdminModerationModule: AppstoreAdminCapabilityModule = {
  id: 'moderation',
  titleKey: 'adminModeration.title',
  i18nNamespaces: [APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE],
  routes,
};
