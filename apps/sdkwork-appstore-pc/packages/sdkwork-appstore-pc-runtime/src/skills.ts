import type {
  SdkworkSkillsAppClient,
  SkillArtifactRecord,
  SkillInstallationRecord,
  SkillRecord,
} from '@sdkwork/skills-app-sdk';
import {
  configureSkillsServicePort,
  type SkillsServicePort,
} from '@sdkwork/appstore-pc-core';

import type { SkillItem } from '../types';

const marketplacePageSize = 48;
const installationPageSize = 200;

export function configureAppstorePcSkills(client: SdkworkSkillsAppClient): void {
  configureSkillsServicePort(createSkillsServicePort(client));
}

export function createSkillsServicePort(
  client: SdkworkSkillsAppClient,
): SkillsServicePort {
  const recordsById = new Map<string, SkillRecord>();
  const installedSkillIds = new Set<string>();
  const installedPackageIds = new Set<string>();

  return {
    async getSkills(category = 'All', query = ''): Promise<SkillItem[]> {
      const [marketplace, installations] = await Promise.all([
        client.skills.marketplace.list({
          page: 1,
          pageSize: marketplacePageSize,
          q: query.trim() || undefined,
        }),
        client.skills.skillInstallations.list({
          page: 1,
          pageSize: installationPageSize,
        }),
      ]);

      replaceInstallationState(
        installations.items,
        installedSkillIds,
        installedPackageIds,
      );
      recordsById.clear();
      for (const record of marketplace.items) {
        recordsById.set(record.id, record);
      }

      return marketplace.items
        .filter((record) => matchesCategory(record, category))
        .map((record) =>
          mapSkillRecord(record, installedSkillIds, installedPackageIds),
        );
    },

    async toggleInstallSkill(id: string): Promise<boolean> {
      const record = recordsById.get(id);
      if (!record) {
        throw new Error('The selected Skill is no longer available in this marketplace page.');
      }
      if (
        installedSkillIds.has(record.id) ||
        installedPackageIds.has(record.packageId)
      ) {
        throw new Error('Skill uninstall is not exposed by the Skills app SDK.');
      }

      const artifacts = await client.skills.skillPackages.artifacts.list(record.packageId, {
        page: 1,
        pageSize: 20,
      });
      const artifact = selectInstallableArtifact(artifacts.items, record.version);
      if (!artifact) {
        throw new Error('This Skill does not have a published installable artifact.');
      }

      const installation = await client.skills.skillPackages.installations.create(
        record.packageId,
        { artifactId: artifact.id },
      );
      installedSkillIds.add(installation.skillId || record.id);
      installedPackageIds.add(installation.packageId || record.packageId);
      return true;
    },

    async publishSkill(): Promise<SkillItem> {
      throw new Error('Skill publishing is not exposed by the Skills app SDK.');
    },

    async runSkillSandbox(): Promise<never> {
      throw new Error('Skill sandbox execution is not exposed by the Skills app SDK.');
    },
  };
}

function replaceInstallationState(
  installations: SkillInstallationRecord[],
  skillIds: Set<string>,
  packageIds: Set<string>,
): void {
  skillIds.clear();
  packageIds.clear();
  for (const installation of installations) {
    if (installation.enabled && installation.installStatus !== 'deleted') {
      skillIds.add(installation.skillId);
      packageIds.add(installation.packageId);
    }
  }
}

function matchesCategory(record: SkillRecord, category: string): boolean {
  const normalized = category.trim().toLocaleLowerCase();
  if (!normalized || normalized === 'all' || normalized === '全部') {
    return true;
  }
  return record.categories.some(
    (item) => item.toLocaleLowerCase() === normalized,
  );
}

function mapSkillRecord(
  record: SkillRecord,
  installedSkillIds: Set<string>,
  installedPackageIds: Set<string>,
): SkillItem {
  return {
    activeCount: parseCount(record.installCount),
    author: 'SDKWork Skills',
    category: record.categories[0] ?? 'General',
    description: record.summary ?? record.description ?? '',
    icon: 'Zap',
    iconColor: 'bg-amber-600',
    id: record.id,
    isInstalled:
      installedSkillIds.has(record.id) || installedPackageIds.has(record.packageId),
    name: record.name,
    promptTemplate: '',
    skillMarkdown: '',
    triggers: [],
    version: record.version,
  };
}

function parseCount(value: string): number {
  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) ? count : 0;
}

function selectInstallableArtifact(
  artifacts: SkillArtifactRecord[],
  version: string,
): SkillArtifactRecord | undefined {
  return (
    artifacts.find(
      (artifact) =>
        artifact.status === 'published' && artifact.versionLabel === version,
    ) ?? artifacts.find((artifact) => artifact.status === 'published')
  );
}
