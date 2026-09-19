import React from 'react';
import { useTranslation } from 'react-i18next';

interface UpdateItemNotesProps {
  appId: string;
  version?: string;
  date?: string;
  notes?: string;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export const UpdateItemNotes: React.FC<UpdateItemNotesProps> = ({
  appId,
  version = '1.0.0',
  date,
  notes = '',
  isExpanded,
  onToggleExpand,
}) => {
  const { t } = useTranslation();
  const dateText = date || t('updates.item.recentUpdate');

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
        <span>{t('updates.item.version', { version })}</span>
        <span>{dateText}</span>
      </div>
      <div className="relative">
        <p
          className={`text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${
            !isExpanded ? 'line-clamp-2' : ''
          }`}
        >
          {notes}
        </p>
        {!isExpanded && notes && notes.length > 100 && (
          <span
            onClick={() => onToggleExpand(appId)}
            className="inline-block mt-1 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline text-xs font-semibold"
          >
            {t('updates.item.showMore')}
          </span>
        )}
      </div>
    </div>
  );
};

