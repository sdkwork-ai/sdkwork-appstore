import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { PluginCard } from './components/plugins/PluginCard';
import { PluginFilter } from './components/plugins/PluginFilter';
import { PluginDetailModal } from './components/plugins/PluginDetailModal';
import { PluginsHeaderBanner } from './components/plugins/PluginsHeaderBanner';
import { PluginsEmptyState } from './components/plugins/PluginsEmptyState';
import { PluginsService } from '@sdkwork/appstore-pc-core';

export function PluginsPage() {
  const { t } = useTranslation();
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = [
    t('plugins.categories.all'),
    t('plugins.categories.codeDev'),
    t('plugins.categories.dataRetrieval'),
    t('plugins.categories.docProcessing'),
    t('plugins.categories.databaseApps'),
    t('plugins.categories.imageProcessing'),
    t('plugins.categories.business')
  ];

  const loadPlugins = async () => {
    try {
      const data = await PluginsService.getPlugins(selectedCategory, searchQuery);
      setPlugins(data);
    } catch (err) {
      console.error('Failed to load plugins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, [selectedCategory, searchQuery]);

  const handleToggleEnable = async (id: string) => {
    setActionError(null);
    try {
      await PluginsService.togglePlugin(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Plugin action failed.');
      return;
    }
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    if (selectedPlugin && selectedPlugin.id === id) {
      setSelectedPlugin((prev) => (prev ? { ...prev, enabled: !prev.enabled } : null));
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Header Banner Subcomponent */}
      <PluginsHeaderBanner />

      {/* Filter & Register Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <PluginFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
      </div>

      {actionError && (
        <p role="alert" className="text-xs text-indigo-700 dark:text-indigo-300">
          {actionError}
        </p>
      )}

      {/* Plugin Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('plugins.loading')}</div>
      ) : (
        <CardGrid>
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onToggleEnable={handleToggleEnable}
              onSelect={setSelectedPlugin}
            />
          ))}
        </CardGrid>
      )}

      {plugins.length === 0 && !loading && <PluginsEmptyState />}

      {/* Plugin Detail & Playground Modal */}
      <PluginDetailModal
        plugin={selectedPlugin}
        onClose={() => setSelectedPlugin(null)}
        onToggleEnable={handleToggleEnable}
      />
    </div>
  );
}

export default PluginsPage;

