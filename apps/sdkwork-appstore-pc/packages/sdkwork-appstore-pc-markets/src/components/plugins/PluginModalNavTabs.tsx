import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, FileCode } from 'lucide-react';
import { Tabs } from '@sdkwork/appstore-pc-commons';

interface PluginModalNavTabsProps {
  activeTab: 'overview' | 'schema' | 'sandbox';
  onTabChange: (tab: 'overview' | 'schema' | 'sandbox') => void;
}

/**
 * Plugin modal section tabs.
 *
 * Hand-rolled before, with `border-store-brand text-store-brand font-bold` for
 * the active tab — a different label weight and a different text colour from
 * the shared `Tabs` primitive, so the same widget did not match the MCP or
 * skill modals. Now it renders that primitive.
 */
export const PluginModalNavTabs: React.FC<PluginModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <Tabs
      items={[
        { value: 'overview', label: t('plugins.modal.overviewTab') },
        { value: 'schema', label: t('plugins.modal.schemaTab'), icon: <FileCode className="w-3.5 h-3.5" /> },
        { value: 'sandbox', label: t('plugins.modal.sandboxTab'), icon: <Play className="w-3.5 h-3.5" /> },
      ]}
      value={activeTab}
      onChange={onTabChange}
      className="mt-4"
    />
  );
};
