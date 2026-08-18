import { AppItem } from '../../types';
import { AppRow } from '../AppRow';
import { ChartsEmptyState } from './ChartsEmptyState';

interface ChartsListProps {
  apps: AppItem[];
  loading: boolean;
}

export function ChartsList({ apps, loading }: ChartsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-[#0A84FF]"></div>
      </div>
    );
  }

  if (apps.length === 0) {
    return <ChartsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
      {apps.map((app) => (
        <AppRow key={app.id} app={app} showRank />
      ))}
    </div>
  );
}
