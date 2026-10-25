import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPinned } from 'lucide-react';
import { AppStoreService, AppItem } from '@sdkwork/appstore-pc-core';
import {
  CULTURE_TOURISM_CATEGORY_NAMES,
  LoadingSpinner,
  TourismProfile,
  TOURISM_REGIONS,
  TOURISM_SCENARIOS,
  resolveTourismProfile,
  type TourRegionId,
  type TourScenarioId,
} from '@sdkwork/appstore-pc-commons';
import { TourismSection } from './components/TourismSection';

/** Filter chip row shared by the scenario and region selectors. */
function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all border cursor-pointer ${
        active
          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
          : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-sky-500/40'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 独立模块「文旅应用」(REQ-2026-0003): culture-and-tourism evaluation apps,
 * filterable by scenario (tourist attractions, museums, city walk, heritage,
 * study tours) and region. Listing summaries carry no category, so the page
 * loads its window from the 文旅应用 catalog category and stamps it on every
 * row.
 */
export default function TourismPage() {
  const { t } = useTranslation();
  const [evalApps, setEvalApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<TourScenarioId | 'all'>('all');
  const [region, setRegion] = useState<TourRegionId | 'all'>('all');

  useEffect(() => {
    async function loadEvalApps() {
      try {
        const categories = await AppStoreService.getCategories().catch(() => []);
        const idByName = new Map(categories.map((category) => [category.name, category.id]));
        const categoryId = CULTURE_TOURISM_CATEGORY_NAMES.map((name) => idByName.get(name)).find(Boolean);
        if (!categoryId) {
          setEvalApps([]);
          return;
        }
        const page = await AppStoreService.listAppsPage({ categoryId, limit: 50 });
        setEvalApps(page.items.map((app) => ({ ...app, category: '文旅应用' })));
      } catch (err) {
        console.error('Failed to load tourism apps', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvalApps();
  }, []);

  const filteredApps = useMemo(() => {
    return evalApps.filter((app) => {
      const profile = resolveTourismProfile(app) as TourismProfile | undefined;
      if (!profile) return false;
      if (scenario !== 'all' && !profile.scenarios.includes(scenario)) return false;
      if (region !== 'all' && !profile.regions.includes(region)) return false;
      return true;
    });
  }, [evalApps, scenario, region]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-5 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Module hero banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden">
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-medium mb-3">
            <MapPinned className="w-3.5 h-3.5" />
            <span>{t('tourism.header.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('tourism.header.title')}
          </h1>
          <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed">
            {t('tourism.header.subtitle')}
          </p>
        </div>
        <div className="z-10 p-4 rounded-store-card bg-sky-600/10 border border-sky-500/20 text-sky-600">
          <MapPinned className="w-10 h-10" />
        </div>
      </div>

      {/* Sub-component: Scenario and region filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('tourism.filters.scenarioLabel')}
          </span>
          <FilterChip
            active={scenario === 'all'}
            label={t('tourism.filters.allScenarios')}
            onClick={() => setScenario('all')}
          />
          {TOURISM_SCENARIOS.map((scenarioId) => (
            <FilterChip
              key={scenarioId}
              active={scenario === scenarioId}
              label={t(`tourism.scenarios.${scenarioId}`)}
              onClick={() => setScenario(scenarioId)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('tourism.filters.regionLabel')}
          </span>
          <FilterChip
            active={region === 'all'}
            label={t('tourism.filters.allRegions')}
            onClick={() => setRegion('all')}
          />
          {TOURISM_REGIONS.map((regionId) => (
            <FilterChip
              key={regionId}
              active={region === regionId}
              label={t(`tourism.regions.${regionId}`)}
              onClick={() => setRegion(regionId)}
            />
          ))}
        </div>
      </div>

      {/* Sub-component: Evaluation app grid */}
      <TourismSection apps={filteredApps} />
    </div>
  );
}
