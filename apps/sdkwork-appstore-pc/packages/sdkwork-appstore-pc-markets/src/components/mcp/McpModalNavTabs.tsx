import React from 'react';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@sdkwork/appstore-pc-commons';

interface McpModalNavTabsProps {
  activeTab: 'config' | 'test';
  onTabChange: (tab: 'config' | 'test') => void;
}

/**
 * MCP modal section tabs.
 *
 * This used to hand-roll the strip and paint the active tab with
 * `border-store-info text-store-info font-bold` — a teal accent, while the
 * plugin modal's identical widget used brand blue and the skill modal's used
 * orange. The same tab therefore changed colour depending on which modal was
 * open. Rendering the shared `Tabs` primitive makes the active treatment the
 * one the application defines, and keeps it defined in a single place.
 */
export const McpModalNavTabs: React.FC<McpModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <Tabs
      items={[
        { value: 'config', label: t('mcp.modal.tabJson') },
        { value: 'test', label: t('mcp.modal.tabSandbox'), icon: <Terminal className="w-3.5 h-3.5" /> },
      ]}
      value={activeTab}
      onChange={onTabChange}
      className="mb-4"
    />
  );
};
