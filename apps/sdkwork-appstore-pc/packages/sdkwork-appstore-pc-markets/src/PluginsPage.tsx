import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import type { PluginsHost } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { PluginCard } from './components/plugins/PluginCard';
import { PluginFilter } from './components/plugins/PluginFilter';
import { PluginDetailModal } from './components/plugins/PluginDetailModal';
import { PluginsEmptyState } from './components/plugins/PluginsEmptyState';
import { PluginsService } from '@sdkwork/appstore-pc-core';
import { ALL_CATEGORY, type CategoryOption } from './components/marketCategories';

/** Props for the plugins catalog page. */
export interface PluginsPageProps {
  /**
   * Controlled catalog text filter. The surrounding chrome owns the search
   * field (the store header's global search, or an embedding host's toolbar)
   * and passes its query here; the page renders no search input of its own.
   * Unset filters by the empty string, i.e. the full catalog.
   */
  searchQuery?: string;
  /**
   * The embedding host's plugin install port. With it, a catalog entry that
   * publishes a source installs into the host's own plugin tree; without it
   * (a standalone storefront) the card keeps the catalog's enable state.
   */
  pluginsHost?: PluginsHost;
}

export function PluginsPage({ searchQuery, pluginsHost }: PluginsPageProps = {}) {
  const { t } = useTranslation();
  // The catalog is loaded once and filtered locally: the category chips are
  // derived from the full catalog, so selecting one never hides the others and
  // every chip names a category the catalog actually contains.
  const [allPlugins, setAllPlugins] = useState<PluginItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    PluginsService.getPlugins()
      .then((data) => {
        if (!cancelled) {
          setAllPlugins(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load plugins', err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo<CategoryOption[]>(() => {
    const values = new Set<string>();
    allPlugins.forEach((plugin) => {
      if (plugin.category) {
        values.add(plugin.category);
      }
    });
    return [
      { value: ALL_CATEGORY, label: t('plugins.categories.all') },
      ...[...values]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ value, label: value })),
    ];
  }, [allPlugins, t]);

  const plugins = useMemo(() => {
    const query = (searchQuery ?? '').trim().toLocaleLowerCase();
    return allPlugins.filter((plugin) => {
      if (selectedCategory !== ALL_CATEGORY && plugin.category !== selectedCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [plugin.name, plugin.developer, plugin.description, plugin.category, ...plugin.capabilities]
        .some((text) => text.toLocaleLowerCase().includes(query));
    });
  }, [allPlugins, selectedCategory, searchQuery]);

  const handleToggleEnable = async (id: string) => {
    setActionError(null);
    try {
      await PluginsService.togglePlugin(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Plugin action failed.');
      return;
    }
    setAllPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    if (selectedPlugin && selectedPlugin.id === id) {
      setSelectedPlugin((prev) => (prev ? { ...prev, enabled: !prev.enabled } : null));
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Category Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <PluginFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
      </div>

      {actionError && (
        <p role="alert" className="text-xs text-store-brand ">
          {actionError}
        </p>
      )}

      {/* Plugin Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('plugins.loading')}</div>
      ) : (
        <CardGrid>
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onToggleEnable={handleToggleEnable}
              onSelect={setSelectedPlugin}
              {...(pluginsHost === undefined ? {} : { pluginsHost })}
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
        {...(pluginsHost === undefined ? {} : { pluginsHost })}
      />
    </div>
  );
}

export default PluginsPage;
