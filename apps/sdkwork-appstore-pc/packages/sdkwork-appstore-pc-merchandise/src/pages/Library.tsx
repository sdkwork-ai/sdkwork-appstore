import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownUp, RefreshCw, Search } from 'lucide-react';
import { AppStoreService } from '../services/api';
import { AppItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LibraryAppCard } from '../components/library/LibraryAppCard';
import { LibraryEmptyState } from '../components/library/LibraryEmptyState';
import { useInstall } from '../providers/InstallProvider';
import { filterAndSortLibraryApps, LibrarySortMode } from '../lib/libraryFilter';

const AUTO_UPDATE_KEY = 'sdkwork_library_auto_update';

export default function Library() {
  const { t } = useTranslation();
  const { openApp, uninstallApp } = useInstall();

  const [installedApps, setInstalledApps] = useState<AppItem[]>([]);
  const [updatableIds, setUpdatableIds] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<LibrarySortMode>('name');
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTO_UPDATE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, pendingUpdates] = await Promise.all([
          AppStoreService.getInstalledApps().catch(() => []),
          AppStoreService.getPendingUpdates().catch(() => []),
        ]);
        setInstalledApps(apps);
        setUpdatableIds(new Set(pendingUpdates.map((app) => app.id)));
      } catch (error) {
        console.error('Failed to load library data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_UPDATE_KEY, autoUpdate ? '1' : '0');
    } catch {
      // ignore
    }
  }, [autoUpdate]);

  const visibleApps = useMemo(
    () => filterAndSortLibraryApps(installedApps, query, sortMode),
    [installedApps, query, sortMode],
  );

  const handleUpdate = async (id: string) => {
    setUpdating((prev) => [...prev, id]);
    try {
      await AppStoreService.updateApp(id);
      setUpdatableIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setUpdating((prev) => prev.filter((uid) => uid !== id));
    }
  };

  const handleUpdateAll = async () => {
    const ids = [...updatableIds];
    if (ids.length === 0) {
      return;
    }
    setUpdating(ids);
    try {
      await AppStoreService.updateAllApps(ids);
      setUpdatableIds(new Set());
    } catch (error) {
      console.error('Batch update failed', error);
    } finally {
      setUpdating([]);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-store-ink ">
            {t('library.header.title')}
          </h1>
          <p className="text-xs text-store-ink-faint mt-1 ">
            {t('library.header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-store-ink-soft cursor-pointer ">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(event) => setAutoUpdate(event.target.checked)}
              className="w-3.5 h-3.5 accent-store-brand"
            />
            {t('library.toolbar.autoUpdate')}
          </label>
          <button
            onClick={handleUpdateAll}
            disabled={updatableIds.size === 0 || updating.length > 0}
            className="px-4 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${updating.length > 0 ? 'animate-spin' : ''}`} />
            {t('library.toolbar.updateAll')}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-store-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('library.toolbar.searchPlaceholder')}
            className="w-full pl-9 pr-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-store-control bg-store-subtle text-xs font-semibold text-store-ink-soft ">
          <ArrowDownUp className="w-3.5 h-3.5" />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as LibrarySortMode)}
            className="bg-transparent outline-none cursor-pointer text-store-ink "
          >
            <option value="name">{t('library.toolbar.sortName')}</option>
            <option value="updated">{t('library.toolbar.sortUpdated')}</option>
          </select>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-store-ink ">
          {t('library.grid.title', { count: visibleApps.length })}
        </h3>
        {visibleApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleApps.map((app) => (
              <LibraryAppCard
                key={app.id}
                app={app}
                hasUpdate={updatableIds.has(app.id)}
                isUpdating={updating.includes(app.id)}
                onOpenApp={openApp}
                onUninstallApp={uninstallApp}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <LibraryEmptyState />
        )}
      </section>
    </div>
  );
}
