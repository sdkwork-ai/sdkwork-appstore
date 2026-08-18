import React, { useState } from 'react';
import { Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { McpServerItem } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { McpConfigSnippet } from './McpConfigSnippet';
import { McpSandboxTab } from './McpSandboxTab';
import { McpModalNavTabs } from './McpModalNavTabs';
import { McpModalFooter } from './McpModalFooter';
import { McpService } from '../../services/api';

interface McpConfigModalProps {
  server: McpServerItem | null;
  onClose: () => void;
}

export const McpConfigModal: React.FC<McpConfigModalProps> = ({ server, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');
  const [selectedTool, setSelectedTool] = useState('');
  const [testPayload, setTestPayload] = useState('{\n  "query": "SELECT NOW();"\n}');
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ result: string; latencyMs: number } | null>(null);

  React.useEffect(() => {
    if (server && server.toolsProvided && server.toolsProvided.length > 0) {
      setSelectedTool(server.toolsProvided[0]);
    }
  }, [server]);

  if (!server) return null;

  const handleRunTool = async () => {
    setExecuting(true);
    try {
      const res = await McpService.executeMcpTool(server.id, selectedTool, testPayload);
      setExecResult({ result: res.output, latencyMs: res.latencyMs });
    } catch {
      setExecResult({ result: '{\n  "status": "error",\n  "message": "Tool execution failed"\n}', latencyMs: 0 });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      icon={<Server className="w-5 h-5 text-white" />}
      title={`${server.name} ${t('mcp.modal.configTitle')}`}
      subtitle={t('mcp.modal.subtitle')}
      maxWidthClass="max-w-2xl"
    >
      {/* Subcomponent: Modal Nav Tabs */}
      <McpModalNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'config' ? (
        <McpConfigSnippet configSnippet={server.configSnippet} />
      ) : (
        <McpSandboxTab
          toolsProvided={server.toolsProvided}
          selectedTool={selectedTool}
          testPayload={testPayload}
          executing={executing}
          execResult={execResult}
          onToolChange={setSelectedTool}
          onPayloadChange={setTestPayload}
          onRunTool={handleRunTool}
        />
      )}

      <McpModalFooter onClose={onClose} />
    </ModalShell>
  );
};



