import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { McpServerItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { McpCard } from './components/mcp/McpCard';
import { McpConfigModal } from './components/mcp/McpConfigModal';
import { AddMcpServerModal } from './components/mcp/AddMcpServerModal';
import { McpEmptyState } from './components/mcp/McpEmptyState';
import { McpService } from '@sdkwork/appstore-pc-core';

/** Props for the MCP catalog page. */
export interface McpPageProps {
  /**
   * Controlled catalog text filter. The surrounding chrome owns the search
   * field (the store header's global search, or an embedding host's toolbar)
   * and passes its query here; the page renders no search input of its own.
   * Unset filters by the empty string, i.e. the full catalog.
   */
  searchQuery?: string;
}

export function McpPage({ searchQuery }: McpPageProps = {}) {
  const { t } = useTranslation();
  const [servers, setServers] = useState<McpServerItem[]>([]);
  const [selectedServer, setSelectedServer] = useState<McpServerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadServers = async () => {
    try {
      const data = await McpService.getMcpServers(searchQuery ?? '');
      setServers(data);
    } catch (err) {
      console.error('Failed to load MCP servers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, [searchQuery]);

  const handleToggleConnect = async (id: string) => {
    setActionError(null);
    try {
      await McpService.toggleConnectServer(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'MCP action failed.');
      return;
    }
    setServers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextConn = !s.connected;
          return {
            ...s,
            connected: nextConn,
            status: nextConn ? 'active' : 'disconnected',
          };
        }
        return s;
      })
    );
    if (selectedServer && selectedServer.id === id) {
      setSelectedServer((prev) =>
        prev
          ? {
              ...prev,
              connected: !prev.connected,
              status: !prev.connected ? 'active' : 'disconnected',
            }
          : null
      );
    }
  };

  const handleAddSubmit = async (serverData: {
    name: string;
    publisher: string;
    description: string;
    transportType: 'stdio' | 'sse' | 'http';
    commandOrUrl: string;
    toolsProvided: string[];
  }) => {
    setActionError(null);
    try {
      const created = await McpService.addMcpServer(serverData);
      setServers((prev) => [created, ...prev]);
      setIsAddOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'MCP server registration failed.');
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Deploy action row — the page's one affordance rides the top; text
          search belongs to the surrounding chrome. */}
      <div className="flex md:justify-end">
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-store-brand hover:bg-store-brand-hover text-white rounded-store-control text-xs font-medium transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('mcp.header.deployBtn')}</span>
        </button>
      </div>
      {actionError && (
        <p role="alert" className="text-xs text-store-danger ">
          {actionError}
        </p>
      )}

      {/* MCP Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('mcp.loading')}</div>
      ) : (
        <CardGrid>
          {servers.map((server) => (
            <McpCard
              key={server.id}
              server={server}
              onToggleConnect={handleToggleConnect}
              onOpenConfig={setSelectedServer}
            />
          ))}
        </CardGrid>
      )}

      {servers.length === 0 && !loading && <McpEmptyState />}

      {/* Config Modal */}
      <McpConfigModal
        server={selectedServer}
        onClose={() => setSelectedServer(null)}
      />

      {/* Add MCP Server Modal Subcomponent */}
      <AddMcpServerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
}

export default McpPage;
