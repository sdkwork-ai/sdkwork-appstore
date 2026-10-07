import type { AppstoreAppSdkClient } from '@sdkwork/appstore-h5-core';

import type { ConsoleSettingsPageResult } from '../types/consoleSettingsModels';

/** Publisher profile fields editable from the console settings screen. */
export interface ConsolePublisherProfile {
  id: string;
  displayName: string;
  supportEmail?: string;
  websiteUrl?: string;
  verificationStatus?: string;
  legalName?: string;
}

/**
 * Console Settings service.
 *
 * The generated app SDK clients are injected by the application root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export class ConsoleSettingsService {
  readonly capability = 'console-settings';

  constructor(private readonly client: AppstoreAppSdkClient) {}

  empty(): ConsoleSettingsPageResult<never> {
    return { items: [] };
  }

  /** Retrieves the caller's own publisher profile (`publishers.me.retrieve`). */
  async getPublisherProfile(): Promise<ConsolePublisherProfile | undefined> {
    const me = await this.client.publishers.getMe().catch(() => undefined);
    const row = me as unknown as Record<string, unknown> | undefined;
    if (!row || !readString(row, 'id')) {
      return undefined;
    }
    return {
      id: readString(row, 'id'),
      displayName: readString(row, 'displayName', 'display_name'),
      supportEmail: readString(row, 'supportEmail', 'support_email') || undefined,
      websiteUrl: readString(row, 'websiteUrl', 'website_url') || undefined,
      verificationStatus: readString(row, 'verificationStatus', 'verification_status') || undefined,
      legalName: readString(row, 'legalName', 'legal_name') || undefined,
    };
  }

  /** Updates the caller's own publisher profile (`publishers.update`). */
  async updateProfile(
    publisherId: string,
    patch: { displayName?: string; supportEmail?: string; websiteUrl?: string },
  ): Promise<ConsolePublisherProfile> {
    const result = await this.client.publishers.update(publisherId, {
      displayName: patch.displayName,
      supportEmail: patch.supportEmail,
      websiteUrl: patch.websiteUrl,
    });
    const row = result as unknown as Record<string, unknown>;
    return {
      id: readString(row, 'id') || publisherId,
      displayName: readString(row, 'displayName', 'display_name'),
      supportEmail: readString(row, 'supportEmail', 'support_email') || undefined,
      websiteUrl: readString(row, 'websiteUrl', 'website_url') || undefined,
      verificationStatus: readString(row, 'verificationStatus', 'verification_status') || undefined,
      legalName: readString(row, 'legalName', 'legal_name') || undefined,
    };
  }
}

let clientAccessor: (() => AppstoreAppSdkClient) | null = null;

/**
 * Configure the console settings service with an AppstoreAppSdkClient
 * accessor. The app root calls this during bootstrap before any settings
 * screen renders.
 */
export function configureConsoleSettingsClient(accessor: () => AppstoreAppSdkClient): void {
  clientAccessor = accessor;
}

function getService(): ConsoleSettingsService {
  if (!clientAccessor) {
    throw new Error(
      'Console settings service is not configured. Call configureConsoleSettingsClient() during app bootstrap.',
    );
  }
  return new ConsoleSettingsService(clientAccessor());
}

/** Singleton accessor wired by the application bootstrap. */
export function consoleSettingsService(): ConsoleSettingsService {
  return getService();
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}
