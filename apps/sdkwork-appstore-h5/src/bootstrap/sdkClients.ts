import { createClient, type SdkworkAppClient } from '@sdkwork/cloudrouter-app-sdk';
import {
  createAppstoreNotificationService,
  type AppstoreNotificationService,
} from '@sdkwork/appstore-notification-core';
import {
  createClient as createCommentsClient,
  type SdkworkAppClient as CommentsAppClient,
} from '@sdkwork/comments-app-sdk';
import { appstoreTokenManager } from '@/bootstrap/iamRuntime';
import { getEnvironment } from '@/bootstrap/environment';

const APPSTORE_NOTIFICATION_APP_ID = 'sdkwork-appstore-h5';

let cloudRouterClient: SdkworkAppClient | null = null;
let notificationService: AppstoreNotificationService | null = null;
let commentsClient: CommentsAppClient | null = null;

export function getNotificationService(): AppstoreNotificationService {
  if (!notificationService) {
    const env = getEnvironment();
    cloudRouterClient = createClient({
      baseUrl: import.meta.env.VITE_APPBASE_API_URL || env.appbaseBaseUrl,
      tokenManager: appstoreTokenManager,
    });
    notificationService = createAppstoreNotificationService({
      getClient: () => cloudRouterClient!,
      appId: APPSTORE_NOTIFICATION_APP_ID,
    });
  }
  return notificationService;
}

export function resetNotificationClient(): void {
  cloudRouterClient = null;
  notificationService = null;
}

export function getCommentsClient(): CommentsAppClient {
  if (!commentsClient) {
    const env = getEnvironment();
    commentsClient = createCommentsClient({
      baseUrl:
        import.meta.env.VITE_SDKWORK_COMMENTS_APP_API_BASE_URL || env.commentsAppApiBaseUrl,
      tokenManager: appstoreTokenManager,
    });
  }
  return commentsClient;
}

export function resetCommentsClient(): void {
  commentsClient = null;
}