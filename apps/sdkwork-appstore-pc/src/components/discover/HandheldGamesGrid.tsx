import { ChevronRight } from 'lucide-react';
import { AppItem } from '../../types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HandheldGameCard } from './HandheldGameCard';

interface HandheldGamesGridProps {
  apps: AppItem[];
}

export function HandheldGamesGrid({ apps }: HandheldGamesGridProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <Link 
          to="/search?category=productivity" 
          className="flex items-center gap-1.5 group text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-colors"
        >
          <span>{t('discover.sections.productivityApps')}</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map((game) => (
          <HandheldGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

