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
    <div className="flex flex-col bg-store-surface border border-store-line dark:border-store-line/80 rounded-store-card p-4 transition-all shadow-sm ">
      <div className="flex items-center justify-between mb-3.5">
        <Link 
          to={`/search?category=${encodeURIComponent(categoryQuery)}`} 
          className="flex items-center gap-1.5 group text-sm font-bold text-store-ink hover:text-store-brand transition-colors "
        >
          <span>{title}</span>
          <ChevronRight className="w-4 h-4 text-store-ink-faint group-hover:text-store-brand transition-colors" />
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
