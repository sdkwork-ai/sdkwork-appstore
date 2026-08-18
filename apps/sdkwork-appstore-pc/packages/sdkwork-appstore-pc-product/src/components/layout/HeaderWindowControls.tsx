import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Square, X } from 'lucide-react';

export const HeaderWindowControls: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-[#22252c] text-gray-400">
      <button 
        type="button" 
        className="p-1 hover:bg-gray-200 dark:hover:bg-[#22252c] rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        title={t('nav.header.window.minimize')}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button 
        type="button" 
        className="p-1 hover:bg-gray-200 dark:hover:bg-[#22252c] rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        title={t('nav.header.window.maximize')}
      >
        <Square className="w-3 h-3" />
      </button>
      <button 
        type="button" 
        className="p-1 hover:bg-rose-600 hover:text-white rounded text-gray-400 transition-colors"
        title={t('nav.header.window.close')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

