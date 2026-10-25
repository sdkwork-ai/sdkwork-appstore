import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartPulse, ShieldAlert } from 'lucide-react';
import { AppStoreService, AppItem } from '@sdkwork/appstore-pc-core';
import {
  HEALTHCARE_CATEGORY_NAMES,
  HEALTHCARE_SCENARIOS,
  HealthcareProfile,
  LoadingSpinner,
  resolveHealthcareProfile,
  type HealthcareScenarioId,
} from '@sdkwork/appstore-pc-commons';
import { HealthcareSection } from './components/HealthcareSection';

/** Filter chip row of the scenario selector. */
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
          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
          : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-rose-500/40'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 独立模块「医疗卫生应用」(REQ-2026-0004): healthcare evaluation apps,
 * filterable by scenario (clinical, public health, health management, pharma
 * and devices, medical education). Safety is a first-class signal; the
 * non-diagnosis disclaimer is shown on the detail page. Listing summaries
 * carry no category, so the page loads its window from the 医疗卫生应用
 * catalog category and stamps it on every row.
 */
export default function HealthcarePage() {
  const { t } = useTranslation();
  const [evalApps, setEvalApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<HealthcareScenarioId | 'all'>('all');

  useEffect(() => {
    async function loadEvalApps() {
      try {
        const categories = await AppStoreService.getCategories().catch(() => []);
        const idByName = new Map(categories.map((category) => [category.name, category.id]));
        const categoryId = HEALTHCARE_CATEGORY_NAMES.map((name) => idByName.get(name)).find(Boolean);
        if (!categoryId) {
          setEvalApps([]);
          return;
        }
        const page = await AppStoreService.listAppsPage({ categoryId, limit: 50 });
        setEvalApps(page.items.map((app) => ({ ...app, category: '医疗卫生应用' })));
      } catch (err) {
        console.error('Failed to load healthcare apps', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvalApps();
  }, []);

  const filteredApps = useMemo(() => {
    return evalApps.filter((app) => {
      const profile = resolveHealthcareProfile(app) as HealthcareProfile | undefined;
      if (!profile) return false;
      if (scenario !== 'all' && !profile.scenarios.includes(scenario)) return false;
      return true;
    });
  }, [evalApps, scenario]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-5 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Module hero banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden">
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium mb-3">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{t('healthcare.header.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('healthcare.header.title')}
          </h1>
          <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed">
            {t('healthcare.header.subtitle')}
          </p>
        </div>
        <div className="z-10 p-4 rounded-store-card bg-rose-600/10 border border-rose-500/20 text-rose-600">
          <HeartPulse className="w-10 h-10" />
        </div>
      </div>

      {/* Sub-component: Non-diagnosis compliance notice (fixed, not dismissible) */}
      <div className="flex items-start gap-2 p-3 rounded-store-card bg-amber-400/10 border border-amber-400/30 text-amber-700 dark:text-amber-400">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">{t('healthcare.disclaimer.body')}</p>
      </div>

      {/* Sub-component: Scenario filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-store-ink-faint mr-1">
          {t('healthcare.filters.scenarioLabel')}
        </span>
        <FilterChip
          active={scenario === 'all'}
          label={t('healthcare.filters.allScenarios')}
          onClick={() => setScenario('all')}
        />
        {HEALTHCARE_SCENARIOS.map((scenarioId) => (
          <FilterChip
            key={scenarioId}
            active={scenario === scenarioId}
            label={t(`healthcare.scenarios.${scenarioId}`)}
            onClick={() => setScenario(scenarioId)}
          />
        ))}
      </div>

      {/* Sub-component: Evaluation app grid */}
      <HealthcareSection apps={filteredApps} />
    </div>
  );
}
