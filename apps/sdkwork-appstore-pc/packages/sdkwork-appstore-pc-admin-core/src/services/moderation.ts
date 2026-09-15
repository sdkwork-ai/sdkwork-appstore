import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';
import { uuid } from '@sdkwork/utils/id';

import { executeAdminOperation, requireAdminIdentifier } from './errors';
import {
  type AppstoreAdminPage,
  emptyPage,
  formatAdminDate,
  mapPage,
  readId,
  readNumber,
  readRecord,
  readSingleRecord,
  readString,
  normalizeToken,
} from './viewModel';

/**
 * Catalog operation ids owned by this port
 * (`docs/api/operation-catalog.md`, permissions `appstore.moderation.*`).
 */
export const APPSTORE_ADMIN_MODERATION_OPERATIONS = {
  listQueue: 'appstore.moderation.queue.list',
  retrieveReview: 'appstore.moderation.reviews.retrieve',
  assignReview: 'appstore.moderation.reviews.assign',
  createDecision: 'appstore.moderation.decisions.create',
  createAppeal: 'appstore.moderation.appeals.create',
  listAppeals: 'appstore.moderation.appeals.list',
  retrieveAppeal: 'appstore.moderation.appeals.retrieve',
  decideAppeal: 'appstore.moderation.appeals.decide',
} as const;

/** Operator decision on a moderation review. */
export type AppstoreAdminModerationDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

/** Review lifecycle status emitted by the backend. */
export type AppstoreAdminReviewStatus = string;

export interface AppstoreAdminModerationQueueItem {
  reviewId: string;
  listingId: string;
  listingName: string;
  submissionType: string;
  reviewStatus: string;
  assignedTo?: string;
  priority?: number;
  submittedAt?: string;
  submittedDate: string;
}

export interface AppstoreAdminModerationReviewDetail {
  reviewId: string;
  listingId: string;
  listingName: string;
  submissionType: string;
  reviewStatus: string;
  assignedTo?: string;
  submittedAt?: string;
  updatedAt?: string;
  priority?: number;
  /** Latest recorded decision, when the backend exposes it on the review. */
  latestDecision?: string;
  latestDecisionReasonCode?: string;
  latestDecisionReasonDetail?: string;
  /** Untyped review payload rendered by the detail inspector. */
  attributes: Record<string, unknown>;
}

export interface AppstoreAdminModerationAppeal {
  appealId: string;
  reviewId: string;
  listingId: string;
  appealStatus: string;
  appealReason: string;
  decision?: string;
  note?: string;
  submittedAt?: string;
  submittedDate: string;
  decidedAt?: string;
}

export interface AppstoreAdminModerationQueueQuery {
  reviewStatus?: string;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminModerationAppealQuery {
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export interface AppstoreAdminDecisionInput {
  decisionType: AppstoreAdminModerationDecision;
  /**
   * Review lifecycle status written with the decision. Defaults to `FINAL`,
   * matching the operator console contract.
   */
  decisionStatus?: string;
  reasonCode?: string;
  reasonDetail?: string;
  policyReference?: string;
}

export interface AppstoreAdminModerationPort {
  listQueue(
    query?: AppstoreAdminModerationQueueQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminModerationQueueItem>>;
  getReview(reviewId: string): Promise<AppstoreAdminModerationReviewDetail | undefined>;
  assignReview(reviewId: string, assignedTo: string): Promise<void>;
  decideReview(reviewId: string, input: AppstoreAdminDecisionInput): Promise<void>;
  createAppeal(input: { decisionId: string; appealReason: string }): Promise<void>;
  listAppeals(
    query?: AppstoreAdminModerationAppealQuery,
  ): Promise<AppstoreAdminPage<AppstoreAdminModerationAppeal>>;
  getAppeal(appealId: string): Promise<AppstoreAdminModerationAppeal | undefined>;
  decideAppeal(appealId: string, input: { decision: string; note: string }): Promise<void>;
}

export function createAppstoreAdminModerationPort(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminModerationPort {
  const operations = APPSTORE_ADMIN_MODERATION_OPERATIONS;

  return {
    async listQueue(query) {
      const payload = await executeAdminOperation(operations.listQueue, () =>
        client.moderation.appstore.moderation.queue.list({
          ...(query?.reviewStatus ? { reviewStatus: query.reviewStatus } : {}),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminModerationQueueItem>();
      }
      return mapPage(payload, (record) => {
        const reviewId = readId(record, 'reviewId', 'review_id', 'id');
        if (!reviewId) {
          return undefined;
        }
        const listingId = readId(record, 'listingId', 'listing_id');
        const submittedAt = readString(record, 'submittedAt', 'submitted_at', 'createdAt', 'created_at');
        const priority = readNumber(record, 'priority', 'queuePriority', 'queue_priority');
        const assignedTo = readId(record, 'assignedTo', 'assigned_to', 'assigneeId', 'assignee_id');
        return {
          reviewId,
          listingId,
          listingName:
            readString(record, 'listingName', 'listing_name', 'displayName', 'display_name')
            || listingId,
          submissionType: normalizeToken(
            readString(record, 'submissionType', 'submission_type'),
            'METADATA',
          ),
          reviewStatus: normalizeToken(readString(record, 'reviewStatus', 'review_status', 'status'), 'PENDING'),
          ...(assignedTo ? { assignedTo } : {}),
          ...(priority === undefined ? {} : { priority }),
          ...(submittedAt ? { submittedAt } : {}),
          submittedDate: formatAdminDate(submittedAt),
        } satisfies AppstoreAdminModerationQueueItem;
      });
    },

    async getReview(reviewId) {
      const id = requireAdminIdentifier(reviewId, 'reviewId');
      const payload = await executeAdminOperation(operations.retrieveReview, () =>
        client.moderation.appstore.moderation.reviews.retrieve(id),
      );
      const record = readSingleRecord(payload);
      if (!record) {
        return undefined;
      }
      return projectReviewDetail(record, id);
    },

    async assignReview(reviewId, assignedTo) {
      const id = requireAdminIdentifier(reviewId, 'reviewId');
      const assignee = requireAdminIdentifier(assignedTo, 'assignedTo');
      await executeAdminOperation(operations.assignReview, () =>
        client.moderation.appstore.moderation.reviews.assign(id, { assignedTo: assignee }),
      );
    },

    async decideReview(reviewId, input) {
      const id = requireAdminIdentifier(reviewId, 'reviewId');
      await executeAdminOperation(operations.createDecision, () =>
        client.moderation.appstore.moderation.decisions.create(
          id,
          {
            decisionType: input.decisionType,
            decisionStatus: input.decisionStatus?.trim() || 'FINAL',
            ...(input.reasonCode?.trim() ? { reasonCode: input.reasonCode.trim() } : {}),
            ...(input.reasonDetail?.trim() ? { reasonDetail: input.reasonDetail.trim() } : {}),
            ...(input.policyReference?.trim() ? { policyReference: input.policyReference.trim() } : {}),
          },
          // The API declares `Idempotency-Key` as required for decisions; a
          // fresh key per operator action keeps retries safe.
          { idempotencyKey: uuid() },
        ),
      );
    },

    async createAppeal(input) {
      const decisionId = requireAdminIdentifier(input.decisionId, 'decisionId');
      await executeAdminOperation(operations.createAppeal, () =>
        client.moderation.appstore.moderation.appeals.create({
          decision_id: decisionId,
          appeal_reason: input.appealReason,
        }),
      );
    },

    async listAppeals(query) {
      const payload = await executeAdminOperation(operations.listAppeals, () =>
        client.moderation.appstore.moderation.appeals.list({
          ...(query?.status ? { status: query.status } : {}),
          ...(query?.cursor ? { cursor: query.cursor } : {}),
          ...(query?.pageSize === undefined ? {} : { pageSize: query.pageSize }),
        }),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminModerationAppeal>();
      }
      return mapPage(payload, (record) => projectAppeal(record));
    },

    async getAppeal(appealId) {
      const id = requireAdminIdentifier(appealId, 'appealId');
      const payload = await executeAdminOperation(operations.retrieveAppeal, () =>
        client.moderation.appstore.moderation.appeals.retrieve(id),
      );
      const record = readSingleRecord(payload);
      return record ? projectAppeal(record) : undefined;
    },

    async decideAppeal(appealId, input) {
      const id = requireAdminIdentifier(appealId, 'appealId');
      await executeAdminOperation(operations.decideAppeal, () =>
        client.moderation.appstore.moderation.appeals.decide(id, {
          decision: input.decision,
          note: input.note,
        }),
      );
    },
  };
}

function projectReviewDetail(
  record: Record<string, unknown>,
  fallbackReviewId: string,
): AppstoreAdminModerationReviewDetail {
  const reviewId = readId(record, 'reviewId', 'review_id', 'id') || fallbackReviewId;
  const listingId = readId(record, 'listingId', 'listing_id');
  const submittedAt = readString(record, 'submittedAt', 'submitted_at', 'createdAt', 'created_at');
  const updatedAt = readString(record, 'updatedAt', 'updated_at');
  const assignedTo = readId(record, 'assignedTo', 'assigned_to', 'assigneeId', 'assignee_id');
  const priority = readNumber(record, 'priority', 'queuePriority', 'queue_priority');
  const decision = readRecord(record, 'latestDecision', 'latest_decision', 'decision');
  return {
    reviewId,
    listingId,
    listingName:
      readString(record, 'listingName', 'listing_name', 'displayName', 'display_name') || listingId,
    submissionType: normalizeToken(readString(record, 'submissionType', 'submission_type'), 'METADATA'),
    reviewStatus: normalizeToken(readString(record, 'reviewStatus', 'review_status', 'status'), 'PENDING'),
    ...(assignedTo ? { assignedTo } : {}),
    ...(submittedAt ? { submittedAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    ...(priority === undefined ? {} : { priority }),
    ...(decision === undefined
      ? {}
      : {
          latestDecision: normalizeToken(readString(decision, 'decisionType', 'decision_type', 'decision')),
          latestDecisionReasonCode: readString(decision, 'reasonCode', 'reason_code'),
          latestDecisionReasonDetail: readString(decision, 'reasonDetail', 'reason_detail'),
        }),
    attributes: record,
  };
}

function projectAppeal(record: Record<string, unknown>): AppstoreAdminModerationAppeal | undefined {
  const appealId = readId(record, 'appealId', 'appeal_id', 'id');
  if (!appealId) {
    return undefined;
  }
  const submittedAt = readString(record, 'submittedAt', 'submitted_at', 'createdAt', 'created_at');
  const decidedAt = readString(record, 'decidedAt', 'decided_at', 'updatedAt', 'updated_at');
  const decision = readString(record, 'decision', 'appealDecision', 'appeal_decision');
  const note = readString(record, 'note', 'decisionNote', 'decision_note');
  return {
    appealId,
    reviewId: readId(record, 'reviewId', 'review_id', 'decisionId', 'decision_id'),
    listingId: readId(record, 'listingId', 'listing_id'),
    appealStatus: normalizeToken(readString(record, 'appealStatus', 'appeal_status', 'status'), 'PENDING'),
    appealReason: readString(record, 'appealReason', 'appeal_reason', 'reason'),
    ...(decision ? { decision: normalizeToken(decision) } : {}),
    ...(note ? { note } : {}),
    ...(submittedAt ? { submittedAt } : {}),
    ...(decidedAt ? { decidedAt } : {}),
    submittedDate: formatAdminDate(submittedAt),
  };
}

/** Shared helper for date-range filtering when composing moderation queries. */
export type AppstoreAdminModerationDateRange = AppstoreAdminDateRange;
