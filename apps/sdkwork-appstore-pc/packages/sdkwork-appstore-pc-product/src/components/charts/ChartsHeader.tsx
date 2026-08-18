import React from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../common/SegmentedControl';

interface ChartsHeaderProps {
  activeTab: 'free' | 'paid';
  onTabChange: (val: 'free' | 'paid') => void;
}

export const ChartsHeader: React.FC<ChartsHeaderProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F5]">
          {t('charts.header.title')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t('charts.header.subtitle', '实时更新精选应用与热门排行榜单')}
        </p>
      </div>

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
