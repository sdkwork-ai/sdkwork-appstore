import React from 'react';
import { useTranslation } from 'react-i18next';

interface DemandsCategoryFilterProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

/** 需求大类过滤，值与 `company_demand.demand_type` 对齐。 */
export const DEMAND_TYPE_VALUES = ['all', 'development', 'purchase', 'design', 'other'] as const;

export const DemandsCategoryFilter: React.FC<DemandsCategoryFilterProps> = ({
  selectedType,
  onSelectType,
}) => {
  const { t } = useTranslation();

  const typeLabel = (value: string) => {
    switch (value) {
      case 'all':
        return t('common.actions.all');
      case 'development':
        return t('demands.types.development');
      case 'purchase':
        return t('demands.types.purchase');
      case 'design':
        return t('demands.types.design');
      case 'other':
        return t('demands.types.other');
      default:
        return value;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
      {DEMAND_TYPE_VALUES.map((value) => (
        <button
          key={value}
          onClick={() => onSelectType(value)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            selectedType === value
              ? 'bg-store-brand text-white border-store-brand'
              : 'bg-store-surface text-store-ink-soft border-store-line hover:border-store-brand/50'
          }`}
        >
          {typeLabel(value)}
        </button>
      ))}
    </div>
  );
};
