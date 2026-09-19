import { ChevronRight } from 'lucide-react';
import { AppItem } from '../../types';
import { AppRow } from '../AppRow';
import { Link } from 'react-router-dom';

interface CollectionGridSectionProps {
  title: string;
  categoryQuery: string;
  apps: AppItem[];
}

export function CollectionGridSection({ title, categoryQuery, apps }: CollectionGridSectionProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-4 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <Link 
          to={`/search?category=${encodeURIComponent(categoryQuery)}`} 
          className="flex items-center gap-1.5 group text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-colors"
        >
          <span>{title}</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {apps.slice(0, 6).map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
