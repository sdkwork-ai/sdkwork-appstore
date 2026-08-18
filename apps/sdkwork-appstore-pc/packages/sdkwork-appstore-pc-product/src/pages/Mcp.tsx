import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { McpServerItem } from '../types';
import { McpCard } from '../components/mcp/McpCard';
import { McpConfigModal } from '../components/mcp/McpConfigModal';
import { McpHeaderBanner } from '../components/mcp/McpHeaderBanner';
import { McpSearchBar } from '../components/mcp/McpSearchBar';
import { AddMcpServerModal } from '../components/mcp/AddMcpServerModal';
import { McpEmptyState } from '../components/mcp/McpEmptyState';
import { McpService } from '../services/api';

export function McpPage() {
  const { t } = useTranslation();
  const [servers, setServers] = useState<McpServerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<McpServerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadServers = async () => {
    try {
      const data = await McpService.getMcpServers(searchQuery);
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
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in">
      {/* Header Banner Subcomponent */}
      <McpHeaderBanner />

      {/* Search and Action Header */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1">
          <McpSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('mcp.header.deployBtn')}</span>
        </button>
      </div>
      {actionError && (
        <p role="alert" className="text-xs text-cyan-700 dark:text-cyan-300">
          {actionError}
        </p>
      )}

      {/* MCP Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('mcp.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {servers.map((server) => (
            <McpCard
              key={server.id}
              server={server}
              onToggleConnect={handleToggleConnect}
              onOpenConfig={setSelectedServer}
            />
          ))}
        </div>
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
