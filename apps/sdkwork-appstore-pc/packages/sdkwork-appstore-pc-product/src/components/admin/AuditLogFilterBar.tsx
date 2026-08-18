import React from 'react';
import { Filter, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuditLogFilterBarProps {
  levels: string[];
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  onExportCsv: () => void;
}

export const AuditLogFilterBar: React.FC<AuditLogFilterBarProps> = ({
  levels,
  selectedLevel,
  onSelectLevel,
  onExportCsv,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-white dark:bg-[#20232b] p-1 rounded-xl border border-gray-200 dark:border-gray-700">
        <Filter className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onSelectLevel(lvl)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedLevel === lvl
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <button
        onClick={onExportCsv}
        className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#20232b] hover:bg-gray-50 dark:hover:bg-[#282c38] border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-blue-500" />
        <span>{t('admin.audit.exportCsv', '导出 CSV')}</span>
      </button>
    </div>
  );
};
