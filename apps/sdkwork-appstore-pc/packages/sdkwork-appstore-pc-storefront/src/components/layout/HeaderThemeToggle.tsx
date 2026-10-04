import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../providers/ThemeProvider';

export const HeaderThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={t('common.accessibility.toggleTheme')}
      className="p-1.5 text-store-ink-faint hover:text-store-ink rounded-full hover:bg-store-subtle transition-colors cursor-pointer text-xs font-medium"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
