import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReleaseBanner } from './ReleaseBanner';
import { ReleaseNoteLogItem } from './ReleaseNoteLogItem';

export interface ReleaseNoteEntry {
  name: string;
  version: string;
  date?: string;
  notes?: string;
}

interface ReleaseNotesSectionProps {
  apps?: ReleaseNoteEntry[];
}

export const ReleaseNotesSection: React.FC<ReleaseNotesSectionProps> = ({ apps = [] }) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        <ReleaseBanner
          version="v2.5.0"
          title={t('updates.releaseNotes.bannerTitle')}
          description={t('updates.releaseNotes.bannerDesc')}
        />

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-store-ink ">{t('updates.releaseNotes.logTitle')}</h3>
          <div className="bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card p-5 space-y-4 ">
            <ReleaseNoteLogItem
              title={t('updates.releaseNotes.log1Title')}
              description={t('updates.releaseNotes.log1Desc')}
            />
            <ReleaseNoteLogItem
              title={t('updates.releaseNotes.log2Title')}
              description={t('updates.releaseNotes.log2Desc')}
            />
          </div>
        </div>
      </div>
    );
  }

  const latest = apps[0];

  return (
    <div className="space-y-6">
      <ReleaseBanner
        version={`v${latest.version}`}
        title={t('updates.releaseNotes.bannerTitle')}
        description={t('updates.releaseNotes.bannerDesc')}
      />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-store-ink ">
          {t('updates.releaseNotes.logTitle')}
        </h3>
        <div className="bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card p-5 space-y-4 ">
          {apps.map((app) => (
            <ReleaseNoteLogItem
              key={`${app.name}-${app.version}`}
              title={`${app.name} · v${app.version}${app.date ? ` · ${app.date}` : ''}`}
              description={app.notes || t('updates.releaseNotes.log1Desc')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


