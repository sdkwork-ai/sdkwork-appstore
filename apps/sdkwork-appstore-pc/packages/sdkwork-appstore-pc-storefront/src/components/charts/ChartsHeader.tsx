import React from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../common/SegmentedControl';

interface ChartsHeaderProps {
  activeTab: 'free' | 'paid';
  onTabChange: (val: 'free' | 'paid') => void;
}

/** The charts page's free/paid tab control. The former title block is gone:
    the sidebar already names the page. */
export const ChartsHeader: React.FC<ChartsHeaderProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <header className="flex md:justify-end mb-8">
      <SegmentedControl
        options={[
          { value: 'free', label: t('charts.tabs.topFree') },
          { value: 'paid', label: t('charts.tabs.topPaid') },
        ]}
        value={activeTab}
        onChange={(val) => onTabChange(val as 'free' | 'paid')}
      />
    </header>
  );
};
