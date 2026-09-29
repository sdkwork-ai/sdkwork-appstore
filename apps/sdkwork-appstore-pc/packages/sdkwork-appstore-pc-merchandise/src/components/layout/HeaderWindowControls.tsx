import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Square, X } from 'lucide-react';

export const HeaderWindowControls: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 pl-2 border-l border-store-line text-store-ink-faint ">
      <button 
        type="button" 
        className="p-1 hover:bg-store-raised rounded-store-control text-store-ink-faint hover:text-store-ink-soft transition-colors text-xs font-medium"
        title={t('nav.header.window.minimize')}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button 
        type="button" 
        className="p-1 hover:bg-store-raised rounded-store-control text-store-ink-faint hover:text-store-ink-soft transition-colors text-xs font-medium"
        title={t('nav.header.window.maximize')}
      >
        <Square className="w-3 h-3" />
      </button>
      <button 
        type="button" 
        className="p-1 hover:bg-store-danger hover:text-white rounded-store-control text-store-ink-faint transition-colors text-xs font-medium"
        title={t('nav.header.window.close')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

