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
            <span className="text-[10px] font-bold text-store-ink-faint uppercase tracking-widest ">
              {categoryTag}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-store-ink ">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-store-ink-faint font-medium mt-0.5 ">
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onSeeAll}
          className="text-store-brand text-sm font-medium hover:underline shrink-0 "
        >
          See All
        </button>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 ${
          showBorder ? 'border-t border-store-line-soft pt-3 ' : ''
        }`}
      >
        {apps.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
