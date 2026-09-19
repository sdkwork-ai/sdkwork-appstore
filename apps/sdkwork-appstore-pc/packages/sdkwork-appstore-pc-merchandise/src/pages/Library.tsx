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
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('library.header.title')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('library.header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(event) => setAutoUpdate(event.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600"
            />
            {t('library.toolbar.autoUpdate')}
          </label>
          <button
            onClick={handleUpdateAll}
            disabled={updatableIds.size === 0 || updating.length > 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${updating.length > 0 ? 'animate-spin' : ''}`} />
            {t('library.toolbar.updateAll')}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('library.toolbar.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#20222a] text-xs font-semibold text-gray-600 dark:text-gray-300">
          <ArrowDownUp className="w-3.5 h-3.5" />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as LibrarySortMode)}
            className="bg-transparent outline-none cursor-pointer text-gray-900 dark:text-gray-100"
          >
            <option value="name">{t('library.toolbar.sortName')}</option>
            <option value="updated">{t('library.toolbar.sortUpdated')}</option>
          </select>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
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
