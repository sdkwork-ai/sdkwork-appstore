import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { Tabs } from '@sdkwork/appstore-pc-commons';

interface SkillModalNavTabsProps {
  activeTab: 'info' | 'test';
  onTabChange: (tab: 'info' | 'test') => void;
}

/**
 * Skill modal section tabs.
 *
 * The third variant of the same widget: its active tab was painted
 * `border-store-warning text-store-warning` — orange — where the plugin modal
 * used brand blue and the MCP modal used teal, all with `font-bold` instead of
 * the primitive's `font-medium`. Rendering the shared `Tabs` primitive makes
 * the active treatment the application's own.
 */
export const SkillModalNavTabs: React.FC<SkillModalNavTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <Tabs
      items={[
        { value: 'info', label: t('skills.modal.overviewTab') },
        { value: 'test', label: t('skills.modal.sandboxTab'), icon: <Play className="w-3.5 h-3.5" /> },
      ]}
      value={activeTab}
      onChange={onTabChange}
      className="mt-3"
    />
  );
};
