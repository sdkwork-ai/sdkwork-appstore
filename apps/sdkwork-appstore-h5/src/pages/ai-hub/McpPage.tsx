import { useState } from 'react';
import { Search, Server, Copy, Check } from 'lucide-react';
import { useMcpServers } from '@/hooks/aiLab';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * MCP 服务页（/mcp，AI Lab 独立页面）。
 * 服务注册表来自 mcp 域 servers.list；连接配置片段本地复制，
 * 连接/断开操作未由 MCP app SDK 暴露（与 PC 端一致）。
 */
export function McpPage() {
  const [query, setQuery] = useState('');
  const { data: servers, loading, error } = useMcpServers(query);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyConfig = async (serverId: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(serverId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'error') {
      return { label: '异常', className: 'bg-red-500/10 text-red-500' };
    }
    if (status === 'idle') {
      return { label: '在线', className: 'bg-emerald-500/10 text-emerald-500' };
    }
    return { label: '未连接', className: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]' };
  };

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-sky-600 to-blue-700 px-4 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">MCP 服务</h1>
        <p className="mt-1 text-sm text-sky-100">连接 Model Context Protocol 服务注册表</p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-sky-100" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索 MCP 服务"
            aria-label="搜索 MCP 服务"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-sky-200"
          />
        </div>
      </header>

      <div className="space-y-3 px-4 py-4">
        {error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">MCP 注册表加载失败，请稍后重试</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (servers ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <Server className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">没有匹配的 MCP 服务</p>
          </div>
        ) : (
          (servers ?? []).map((server) => {
            const badge = statusBadge(server.status);
            return (
              <article key={server.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {server.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[var(--text-tertiary)]">
                      {server.publisher} · {server.transportType}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyConfig(server.id, server.configSnippet)}
                    aria-label="复制连接配置"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {copiedId === server.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === server.id ? '已复制' : '配置'}
                  </button>
                </div>
                {server.description && (
                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {server.description}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
