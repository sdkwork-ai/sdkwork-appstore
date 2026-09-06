import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APP_PLATFORM_GROUPS,
  type AppPlatformGroupKey,
} from '@sdkwork/appstore-pc-core';

export type PlatformFilterValue = 'all' | AppPlatformGroupKey;

export const PLATFORM_FILTER_ALL = 'all' as const;

interface PlatformFilterBarProps {
  activeFilter: PlatformFilterValue;
  onSelectFilter: (filter: PlatformFilterValue) => void;
}

/** Platform display-group filter chips (全部/安卓/iOS/鸿蒙/PC桌面/PC网页/H5网页/小程序/浏览器扩展). */
export function PlatformFilterBar({ activeFilter, onSelectFilter }: PlatformFilterBarProps) {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      APP_PLATFORM_GROUPS.map((group) => ({
        key: group.key as PlatformFilterValue,
        label: t(`common.platformGroups.${group.i18nKey}`),
        dotClass: group.dotClass,
      })),
    [t],
  );

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-2 shrink-0">
        {t('common.platformGroups.title')}
      </span>
      <button
        onClick={() => onSelectFilter(PLATFORM_FILTER_ALL)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
          activeFilter === PLATFORM_FILTER_ALL
            ? 'bg-blue-600 dark:bg-[#0A84FF] text-white shadow-sm'
            : 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'
        }`}
      >
        {t('common.platformGroups.all')}
      </button>
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onSelectFilter(option.key)}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
            activeFilter === option.key
              ? 'bg-blue-600 dark:bg-[#0A84FF] text-white shadow-sm'
              : 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${option.dotClass}`} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
