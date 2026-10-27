import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainCircuit } from 'lucide-react';
import { AppStoreService, AppItem } from '@sdkwork/appstore-pc-core';
import {
  AI_MODEL_EVAL_CATEGORY_NAMES,
  EVAL_SECTIONS,
  LoadingSpinner,
  evalDomainsForSection,
  resolveEvalAppDomain,
  resolveEvalSectionId,
  type EvalDomainId,
  type EvalSectionId,
} from '@sdkwork/appstore-pc-commons';
import { AiEvalSection } from './components/AiEvalSection';

/** Filter chip row shared by the section and domain selectors. */
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
          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
          : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-violet-500/40'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 独立模块「AI模型测评」: multi-spec evaluation applications (model and agent
 * candidates), each spec carrying its own rating and comment thread. Two-level
 * filtering mirrors the education experiment page: the primary row selects a
 * content section (综合/编程/Agent/多模态/安全), the dependent second row
 * narrows to a benchmark domain inside it. Listing summaries carry no
 * category, so the page loads its window from the AI 模型测评 catalog
 * category and stamps it on every row.
 */
export default function AiEvalPage() {
  const { t } = useTranslation();
  const [evalApps, setEvalApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<EvalSectionId | 'all'>('all');
  const [domain, setDomain] = useState<EvalDomainId | 'all'>('all');

  useEffect(() => {
    async function loadEvalApps() {
      try {
        const categories = await AppStoreService.getCategories().catch(() => []);
        const idByName = new Map(categories.map((category) => [category.name, category.id]));
        const categoryId = AI_MODEL_EVAL_CATEGORY_NAMES.map((name) => idByName.get(name)).find(Boolean);
        if (!categoryId) {
          setEvalApps([]);
          return;
        }
        const page = await AppStoreService.listAppsPage({ categoryId, limit: 50 });
        setEvalApps(page.items.map((app) => ({ ...app, category: 'AI模型测评' })));
      } catch (err) {
        console.error('Failed to load AI evaluation apps', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvalApps();
  }, []);

  // Second-level options depend on the selected section; a stale domain
  // selection falls back to 全部 instead of yielding an empty board.
  const domainOptions = useMemo(() => evalDomainsForSection(section), [section]);
  useEffect(() => {
    if (domain !== 'all' && !domainOptions.includes(domain)) {
      setDomain('all');
    }
  }, [domainOptions, domain]);

  const filteredApps = useMemo(() => {
    return evalApps.filter((app) => {
      if (section !== 'all' && resolveEvalSectionId(app) !== section) return false;
      if (domain !== 'all' && resolveEvalAppDomain(app) !== domain) return false;
      return true;
    });
  }, [evalApps, section, domain]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-5 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Module hero banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden">
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-3">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>{t('aiEval.header.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('aiEval.header.title')}
          </h1>
          <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed">
            {t('aiEval.header.subtitle')}
          </p>
        </div>
        <div className="z-10 p-4 rounded-store-card bg-violet-600/10 border border-violet-500/20 text-violet-500">
          <BrainCircuit className="w-10 h-10" />
        </div>
      </div>

      {/* Sub-component: Two-level filter — section row + dependent domain row */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('aiEval.filters.sectionLabel')}
          </span>
          <FilterChip
            active={section === 'all'}
            label={t('aiEval.filters.all')}
            onClick={() => {
              setSection('all');
              setDomain('all');
            }}
          />
          {EVAL_SECTIONS.map((sectionDescriptor) => (
            <FilterChip
              key={sectionDescriptor.id}
              active={section === sectionDescriptor.id}
              label={t(`aiEval.filters.sections.${sectionDescriptor.id}`)}
              onClick={() => setSection(sectionDescriptor.id)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('aiEval.filters.domainLabel')}
          </span>
          <FilterChip
            active={domain === 'all'}
            label={t('aiEval.filters.allDomains')}
            onClick={() => setDomain('all')}
          />
          {domainOptions.map((domainId) => (
            <FilterChip
              key={domainId}
              active={domain === domainId}
              label={t(`aiEval.domains.${domainId}`)}
              onClick={() => setDomain(domainId)}
            />
          ))}
        </div>
      </div>

      {/* Sub-component: Evaluation app grid (grouped by section) */}
      <AiEvalSection apps={filteredApps} />
    </div>
  );
}
