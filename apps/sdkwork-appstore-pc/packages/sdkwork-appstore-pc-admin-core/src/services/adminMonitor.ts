import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';
import {
  configureAdminMonitorServicePort,
  type AdminMonitorServicePort,
  type ClusterNode,
  type ModerationQueueItem,
  type OperatorDashboard,
  type SystemAuditEntry,
  type SystemMetrics,
} from '@sdkwork/appstore-pc-core';
import { uuid } from '@sdkwork/utils/id';

/**
 * Backend-admin monitor surface. Constructed only inside this backend-admin
 * package boundary; the app bootstrap wires the backend SDK client here.
 */
export function configureAppstorePcAdminMonitor(
  client: SdkworkAppstoreBackendClient,
): void {
  configureAdminMonitorServicePort(createAdminMonitorServicePort(client));
}

export function createAdminMonitorServicePort(
  client: SdkworkAppstoreBackendClient,
): AdminMonitorServicePort {
  return {
    async getMetrics(): Promise<SystemMetrics> {
      // Runtime process metrics (CPU/memory/sockets/RPS/uptime) are not
      // exposed by the App Store backend API. The operator dashboard carries
      // storefront scale statistics only, so fail closed instead of returning
      // fabricated runtime numbers; the monitor page keeps its initial state.
      await client.analytics.appstore.analytics.operator.dashboard.retrieve();
      throw new Error('Runtime process metrics are not exposed by the App Store backend API.');
    },

    async getDashboard(): Promise<OperatorDashboard | undefined> {
      const dashboard = await client.analytics.appstore.analytics.operator.dashboard
        .retrieve()
        .catch(() => undefined);
      const row = dashboard as Record<string, unknown> | undefined;
      if (!row || Object.keys(row).length === 0) {
        return undefined;
      }
      return {
        totalListings: readNumber(row, 'totalListings', 'total_listings', 'listingCount', 'listing_count') ?? 0,
        totalDownloads: readNumber(row, 'totalDownloads', 'total_downloads', 'downloadCount', 'download_count') ?? 0,
        totalReviews: readNumber(row, 'totalReviews', 'total_reviews', 'reviewCount', 'review_count') ?? 0,
        pendingModeration: readNumber(row, 'pendingModeration', 'pending_moderation', 'pendingReviews', 'pending_reviews') ?? 0,
        activePublishers: readNumber(row, 'activePublishers', 'active_publishers', 'publisherCount', 'publisher_count') ?? 0,
        dailyInstalls: readNumber(row, 'dailyInstalls', 'daily_installs', 'installsToday', 'installs_today') ?? 0,
      };
    },

    async getModerationQueue(): Promise<ModerationQueueItem[]> {
      const queue = await client.moderation.appstore.moderation.queue
        .list({ pageSize: 100 })
        .catch(() => undefined);
      if (!queue) {
        return [];
      }
      return readPageItems<Record<string, unknown>>(queue).map((item) => ({
        id: readString(item, 'id'),
        listingId: readString(item, 'listingId', 'listing_id'),
        listingName: readString(item, 'listingName', 'displayName', 'display_name') || readString(item, 'listingId', 'listing_id'),
        submissionType: readString(item, 'submissionType', 'submission_type') || 'METADATA',
        status: readString(item, 'reviewStatus', 'review_status', 'status') || 'PENDING',
        submittedAt: formatDate(readString(item, 'submittedAt', 'submitted_at', 'createdAt', 'created_at')),
      })).filter((entry) => entry.id);
    },

    async decideReview(
      reviewId: string,
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
      reasonDetail?: string,
    ): Promise<boolean> {
      if (!reviewId) {
        return false;
      }
      await client.moderation.appstore.moderation.decisions.create(
        reviewId,
        {
          decisionType: decision,
          decisionStatus: 'FINAL',
          reasonDetail,
        },
        { idempotencyKey: uuid() },
      );
      return true;
    },

    async getClusterNodes(): Promise<ClusterNode[]> {
      throw new Error('Cluster node management is not exposed by the App Store backend API.');
    },

    async restartNode(): Promise<boolean> {
      throw new Error('Cluster node management is not exposed by the App Store backend API.');
    },

    async getSystemAuditLogs(): Promise<SystemAuditEntry[]> {
      throw new Error('System audit logs are not exposed by the App Store backend API.');
    },
  };
}

function readPageItems<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function readString(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) {
    return '';
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function readNumber(record: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function formatDate(value: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}
