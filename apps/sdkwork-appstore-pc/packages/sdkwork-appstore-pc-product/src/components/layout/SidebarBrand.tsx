import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

interface SidebarBrandProps {
  title?: string;
  subtitle?: string;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  title,
  subtitle
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('nav.brand');
  const displaySubtitle = subtitle || t('nav.subtitle');

  return (
    <div className="px-3 py-2 mb-4 flex items-center gap-2.5">
      <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm">
        <Home className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-gray-100">
          {displayTitle}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">{displaySubtitle}</span>
      </div>
    </div>
  );
};

