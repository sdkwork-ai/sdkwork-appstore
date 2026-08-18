import { AppItem } from '../../types';
import { AppRow } from '../AppRow';

interface AppSectionProps {
  title: string;
  subtitle?: string;
  categoryTag?: string;
  apps: AppItem[];
  onSeeAll?: () => void;
  showBorder?: boolean;
}

export function AppSection({
  title,
  subtitle,
  categoryTag,
  apps,
  onSeeAll,
  showBorder = false,
}: AppSectionProps) {
  if (apps.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          {categoryTag && (
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {categoryTag}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F5]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onSeeAll}
          className="text-blue-600 dark:text-[#0A84FF] text-sm font-medium hover:underline shrink-0"
        >
          See All
        </button>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 ${
          showBorder ? 'border-t border-gray-100 dark:border-[#2C2C2E] pt-3' : ''
        }`}
      >
        {apps.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
