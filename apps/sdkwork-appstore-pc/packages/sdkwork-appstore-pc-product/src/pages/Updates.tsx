import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UpdatesHeader } from '../components/updates/UpdatesHeader';
import { UpdateItem } from '../components/updates/UpdateItem';
import { UpdatesEmptyState } from '../components/updates/UpdatesEmptyState';
import { UpdatesTabNav, UpdatesTabType } from '../components/updates/UpdatesTabNav';
import { StorageStatsBanner } from '../components/updates/StorageStatsBanner';
import { DownloadQueueCard } from '../components/updates/DownloadQueueCard';
import { LibraryAppsGrid } from '../components/updates/LibraryAppsGrid';
import { ReleaseNotesSection } from '../components/updates/ReleaseNotesSection';
import { useInstall } from '../providers/InstallProvider';

export default function Updates() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as UpdatesTabType) || 'downloads';

  const [appsWithUpdates, setAppsWithUpdates] = useState<AppItem[]>([]);
  const [allApps, setAllApps] = useState<AppItem[]>([]);
  const [updating, setUpdating] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  const {
    installedAppIds,
    uninstallApp,
    openApp,
    activeDownloadApp,
    downloadState,
    downloadProgress
  } = useInstall();

  useEffect(() => {
    async function loadData() {
      try {
        const [updatesData, appsData] = await Promise.all([
          AppStoreService.getPendingUpdates(),
          AppStoreService.getAllApps()
        ]);
        setAppsWithUpdates(updatesData);
        setAllApps(appsData);
      } catch (error) {
        console.error("Failed to load updates data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdate = async (id: string) => {
    setUpdating(prev => [...prev, id]);
    try {
      await AppStoreService.updateApp(id);
      setAppsWithUpdates(prev => prev.filter(app => app.id !== id));
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setUpdating(prev => prev.filter(uid => uid !== id));
    }
  };

  const handleUpdateAll = async () => {
    const ids = appsWithUpdates.map(a => a.id);
    setUpdating(ids);
    try {
      await AppStoreService.updateAllApps(ids);
      setAppsWithUpdates([]);
    } catch (error) {
      console.error("Batch update failed", error);
    } finally {
      setUpdating([]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const installedApps = allApps.filter(a => installedAppIds.has(a.id));

  // Real release notes: pending-update apps carry the latest release notes;
  // installed apps without pending updates keep their listing summary.
  const releaseNoteApps = [
    ...appsWithUpdates,
    ...installedApps.filter((app) => !appsWithUpdates.some((u) => u.id === app.id)),
  ]
    .map((app) => ({
      name: app.name,
      version: app.whatsNew?.version ?? app.version ?? '1.0.0',
      date: app.whatsNew?.date,
      notes: app.whatsNew?.notes,
    }))
    .filter((entry) => entry.notes || entry.date)
    .slice(0, 20);

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      {/* Sub-component: Top Header Filter Tabs */}
      <UpdatesTabNav
        currentTab={currentTab}
        onSelectTab={(tab) => setSearchParams({ tab })}
        pendingUpdatesCount={appsWithUpdates.length}
        installedAppsCount={installedApps.length}
      />

      {/* Tab Content: Downloads & Management */}
      {currentTab === 'downloads' && (
        <div className="space-y-6">
          <UpdatesHeader
            hasUpdates={appsWithUpdates.length > 0}
            isUpdatingAll={updating.length === appsWithUpdates.length && appsWithUpdates.length > 0}
            isUpdatingAny={updating.length > 0}
            onUpdateAll={handleUpdateAll}
          />

          {/* Sub-component: System Storage & Queue Banner */}
          <StorageStatsBanner installedAppsCount={installedApps.length} />

          {/* Sub-component: Active Downloading Task Queue */}
          {activeDownloadApp && (
            <DownloadQueueCard
              app={activeDownloadApp}
              downloadState={downloadState}
              progress={downloadProgress(activeDownloadApp.id)}
              onOpenApp={openApp}
            />
          )}

          {/* Pending Updates List */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center justify-between">
              <span>{t('updates.pendingList.title', { count: appsWithUpdates.length, defaultValue: `待更新软件列表 (${appsWithUpdates.length})` })}</span>
            </h3>

            <div className="flex flex-col gap-4">
              {appsWithUpdates.map(app => (
                <UpdateItem
                  key={app.id}
                  app={app}
                  isUpdating={updating.includes(app.id)}
                  isExpanded={expandedNotes.includes(app.id)}
                  onUpdate={handleUpdate}
                  onToggleExpand={toggleExpand}
                />
              ))}
              
              {appsWithUpdates.length === 0 && <UpdatesEmptyState />}
            </div>
          </section>
        </div>
      )}

      {/* Tab Content: My Application Library */}
      {currentTab === 'library' && (
        <LibraryAppsGrid
          installedApps={installedApps}
          onOpenApp={openApp}
          onUninstallApp={uninstallApp}
        />
      )}

      {/* Tab Content: Release Notes */}
      {currentTab === 'new' && (
        <ReleaseNotesSection apps={releaseNoteApps} />
      )}
    </div>
  );
}

