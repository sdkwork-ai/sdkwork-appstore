import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '../types';
import { PluginCard } from '../components/plugins/PluginCard';
import { PluginFilter } from '../components/plugins/PluginFilter';
import { PluginDetailModal } from '../components/plugins/PluginDetailModal';
import { PluginsHeaderBanner } from '../components/plugins/PluginsHeaderBanner';
import { RegisterPluginModal } from '../components/plugins/RegisterPluginModal';
import { PluginsEmptyState } from '../components/plugins/PluginsEmptyState';
import { PluginsService } from '../services/api';

export function PluginsPage() {
  const { t } = useTranslation();
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
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

  const handleRegisterSubmit = async (pluginData: {
    name: string;
    category: string;
    apiSchemaType: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST';
    description: string;
    capabilities: string[];
  }) => {
    setActionError(null);
    try {
      const created = await PluginsService.registerPlugin(pluginData);
      setPlugins((prev) => [created, ...prev]);
      setIsRegisterOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Plugin registration failed.');
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in">
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
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer h-10"
        >
          <Plus className="w-4 h-4" />
          <span>{t('plugins.header.registerBtn')}</span>
        </button>
      </div>

      {actionError && (
        <p role="alert" className="text-xs text-indigo-700 dark:text-indigo-300">
          {actionError}
        </p>
      )}

      {/* Plugin Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('plugins.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onToggleEnable={handleToggleEnable}
              onSelect={setSelectedPlugin}
            />
          ))}
        </div>
      )}

      {plugins.length === 0 && !loading && <PluginsEmptyState />}

      {/* Plugin Detail & Playground Modal */}
      <PluginDetailModal
        plugin={selectedPlugin}
        onClose={() => setSelectedPlugin(null)}
        onToggleEnable={handleToggleEnable}
      />

      {/* Register Plugin Modal Subcomponent */}
      <RegisterPluginModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
        categories={categories}
      />
    </div>
  );
}

export default PluginsPage;

