import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainCircuit } from 'lucide-react';
import { AppStoreService, AppItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner, AI_MODEL_EVAL_CATEGORY_NAMES } from '@sdkwork/appstore-pc-commons';
import { AiEvalSection } from './components/AiEvalSection';

/**
 * 独立模块「AI模型测评」: multi-spec evaluation applications (model and agent
 * candidates), each spec carrying its own rating and comment thread. Listing
 * summaries carry no category, so the page loads its window from the
 * AI 模型测评 catalog category and stamps it on every row.
 */
export default function AiEvalPage() {
  const { t } = useTranslation();
  const [evalApps, setEvalApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-7 w-full max-w-full select-none transition-colors duration-200">
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

      {/* Sub-component: Evaluation app grid */}
      <AiEvalSection apps={evalApps} />
    </div>
  );
}
