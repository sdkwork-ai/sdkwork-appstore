import { useMemo, useState } from 'react';
import { Search, Plug } from 'lucide-react';
import { PLUGIN_CATEGORIES, usePlugins, togglePluginEnabled } from '@/hooks/aiLab';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * 扩展插件页（/plugins，AI Lab 独立页面）。
 * 插件清单来自目录 template 域（templateType=PLUGIN），
 * 启用/停用记录为按用户的模板使用状态（对齐 PC PluginsPage）。
 */
export function PluginsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const { data: plugins, loading, error, execute } = usePlugins(category, query);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = useMemo(() => PLUGIN_CATEGORIES, []);

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    setTogglingId(pluginId);
    setActionError(null);
    try {
      await togglePluginEnabled(pluginId, enabled);
      await execute();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '操作失败，请稍后重试');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">扩展插件</h1>
        <p className="mt-1 text-sm text-emerald-100">为智能体扩展工具与数据能力</p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-emerald-100" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索插件"
            aria-label="搜索插件"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-emerald-200"
          />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-4">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              category === item
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 py-4">
        {actionError && <p className="text-xs text-[var(--danger)]">{actionError}</p>}
        {error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">插件加载失败，请稍后重试</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (plugins ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <Plug className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">该分类下暂无插件</p>
          </div>
        ) : (
          (plugins ?? []).map((plugin) => (
            <article key={plugin.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Plug className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {plugin.name}
                  </h3>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    {plugin.developer} · {plugin.category}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={togglingId === plugin.id}
                  onClick={() => void handleToggle(plugin.id, plugin.enabled)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    plugin.enabled
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-[var(--accent)] text-white'
                  }`}
                >
                  {togglingId === plugin.id ? '处理中…' : plugin.enabled ? '已启用' : '启用'}
                </button>
              </div>
              {plugin.description && (
                <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {plugin.description}
                </p>
              )}
              {plugin.capabilities.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {plugin.capabilities.slice(0, 4).map((capability) => (
                    <span
                      key={capability}
                      className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
