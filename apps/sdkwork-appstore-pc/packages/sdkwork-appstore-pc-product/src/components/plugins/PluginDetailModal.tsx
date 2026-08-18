import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { PluginModalHeader } from './PluginModalHeader';
import { PluginOverviewTab } from './PluginOverviewTab';
import { PluginModalFooter } from './PluginModalFooter';
import { PluginSchemaTab } from './PluginSchemaTab';
import { PluginSandboxTab } from './PluginSandboxTab';
import { PluginModalNavTabs } from './PluginModalNavTabs';
import { PluginsService } from '../../services/api';

interface PluginDetailModalProps {
  plugin: PluginItem | null;
  onClose: () => void;
  onToggleEnable: (id: string) => void;
}

export const PluginDetailModal: React.FC<PluginDetailModalProps> = ({
  plugin,
  onClose,
  onToggleEnable,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'sandbox'>('overview');
  const [schemaText, setSchemaText] = useState('');
  const [testCapability, setTestCapability] = useState('');
  const [testParams, setTestParams] = useState('{\n  "query": "hello world"\n}');
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ result: string; latencyMs: number } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    if (plugin) {
      setActiveTab('overview');
      setTestCapability(plugin.capabilities[0] || 'execute');
      setExecResult(null);
      PluginsService.getPluginSchema(plugin.id)
        .then((s) => setSchemaText(s))
        .catch(() => setSchemaText(''));
    }
  }, [plugin]);

  if (!plugin) return null;

  const handleRunTest = async () => {
    setExecuting(true);
    try {
      const res = await PluginsService.executePluginApi(plugin.id, testCapability, testParams);
      setExecResult({ result: res.result, latencyMs: res.latencyMs });
    } catch {
      setExecResult({ result: '{\n  "error": "Execution failed"\n}', latencyMs: 0 });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Subcomponent: Modal Header */}
      <PluginModalHeader plugin={plugin} />

      {/* Subcomponent: Tabs Nav */}
      <PluginModalNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <PluginOverviewTab plugin={plugin} />
      )}

      {/* Tab: Schema */}
      {activeTab === 'schema' && (
        <PluginSchemaTab
          apiSchemaType={plugin.apiSchemaType}
          schemaText={schemaText}
          copiedSchema={copiedSchema}
          onCopySchema={handleCopySchema}
        />
      )}

      {/* Tab: Sandbox Playground */}
      {activeTab === 'sandbox' && (
        <PluginSandboxTab
          capabilities={plugin.capabilities}
          testCapability={testCapability}
          testParams={testParams}
          executing={executing}
          execResult={execResult}
          onCapabilityChange={setTestCapability}
          onParamsChange={setTestParams}
          onRunTest={handleRunTest}
        />
      )}

      {/* Subcomponent: Modal Footer */}
      <PluginModalFooter
        plugin={plugin}
        onClose={onClose}
        onToggleEnable={onToggleEnable}
      />
    </ModalShell>
  );
};




