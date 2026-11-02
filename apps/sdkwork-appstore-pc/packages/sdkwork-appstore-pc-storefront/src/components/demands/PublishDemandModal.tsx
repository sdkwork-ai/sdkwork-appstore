import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CompanyDemandsService,
  type DemandAppForm,
  type DemandCategory,
  type DemandHallType,
  type DemandPublishInput,
} from '@sdkwork/appstore-pc-core';
import { DemandsAppFormPicker } from './DemandsAppFormPicker';
import { DemandsCategoryCascader } from './DemandsCategoryCascader';

interface PublishDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (input: DemandPublishInput) => Promise<void>;
}

const DEMAND_TYPE_OPTIONS: readonly DemandHallType[] = [
  'development',
  'video',
  'image',
  'music',
  'voice',
  'design',
  'purchase',
  'other',
];

/**
 * Category root each service family publishes under. The cascader only offers
 * the matching tree, so a video demand cannot be filed under a software leaf.
 */
const DEMAND_TYPE_CATEGORY_ROOT: Record<DemandHallType, string> = {
  development: 'software',
  purchase: 'purchase',
  design: 'design',
  other: 'other',
  video: 'video',
  image: 'image',
  music: 'music',
  voice: 'voice',
};

interface CategoryTreeState {
  status: 'loading' | 'ready' | 'error';
  nodes: DemandCategory[];
}

export const PublishDemandModal: React.FC<PublishDemandModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [appForms, setAppForms] = useState<DemandAppForm[]>([]);
  const [demandType, setDemandType] = useState<DemandHallType>('development');
  const [budget, setBudget] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bidDeadline, setBidDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryTreeState>({ status: 'loading', nodes: [] });

  const loadCategories = useCallback(async (): Promise<void> => {
    setCategories((current) => ({ ...current, status: 'loading' }));
    try {
      const nodes = await CompanyDemandsService.listDemandCategories();
      setCategories({ status: 'ready', nodes });
    } catch {
      setCategories({ status: 'error', nodes: [] });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void loadCategories();
  }, [isOpen, loadCategories]);

  if (!isOpen) return null;

  const requiresAppForm = demandType === 'development';
  const canSubmit = Boolean(
    title.trim() && categoryId !== undefined && description.trim()
    && (!requiresAppForm || appForms.length > 0) && !submitting,
  );
  const categoryRoots = categories.nodes.filter(
    (node) => node.categoryCode === DEMAND_TYPE_CATEGORY_ROOT[demandType],
  );

  const handleSelectCategory = (node: DemandCategory | undefined): void => {
    setCategoryId(node?.id);
    if (node?.appForm !== undefined) {
      setAppForms((current) => current.includes(node.appForm as DemandAppForm)
        ? current
        : [...current, node.appForm as DemandAppForm]);
    }
  };

  const handleDemandTypeChange = (next: DemandHallType): void => {
    setDemandType(next);
    setCategoryId(undefined);
    setAppForms([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || categoryId === undefined) return;
    setSubmitting(true);
    setError(null);
    try {
      await onPublish({
        title: title.trim(),
        categoryId,
        ...(appForms.length === 0 ? {} : { appForms }),
        demandType,
        budget: budget.trim() || undefined,
        budgetMin: budgetMin.trim() || undefined,
        budgetMax: budgetMax.trim() || undefined,
        bidDeadline: bidDeadline ? new Date(bidDeadline).toISOString() : undefined,
        description: description.trim(),
      });
      setTitle('');
      setCategoryId(undefined);
      setAppForms([]);
      setBudget('');
      setBudgetMin('');
      setBudgetMax('');
      setBidDeadline('');
      setDescription('');
      onClose();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-store-field border border-store-line rounded-store-control text-sm text-store-ink placeholder:text-store-ink-faint focus:outline-none focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 px-3 h-9 transition-colors';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-store-overlay backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-store-surface border border-store-line rounded-store-modal shadow-2xl overflow-hidden p-6 text-store-ink max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-store-field border border-store-line flex items-center justify-center cursor-pointer text-store-ink-faint hover:text-store-ink"
          aria-label={t('common.actions.close')}
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-bold">{t('demands.publish.title')}</h3>
        <p className="mt-1 text-xs text-store-ink-soft">{t('demands.publish.subtitle')}</p>
        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">{t('demands.publish.titleLabel')}</span>
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('demands.publish.titlePlaceholder')}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">{t('demands.publish.demandTypeLabel')}</span>
              <select
                className={inputClass}
                value={demandType}
                onChange={(event) => handleDemandTypeChange(event.target.value as DemandHallType)}
              >
                {DEMAND_TYPE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`demands.types.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">{t('demands.publish.categoryLabel')}</span>
              <DemandsCategoryCascader
                nodes={categoryRoots}
                value={categoryId}
                disabled={submitting}
                onSelect={handleSelectCategory}
              />
              {categories.status === 'loading' ? (
                <span className="text-[11px] text-store-ink-faint">{t('demands.category.loading')}</span>
              ) : categories.status === 'error' ? (
                <span className="text-[11px] text-red-500" role="alert">
                  {t('demands.category.error')}{' '}
                  <button
                    type="button"
                    onClick={() => void loadCategories()}
                    className="underline cursor-pointer"
                  >
                    {t('common.actions.retry')}
                  </button>
                </span>
              ) : categoryRoots.length === 0 ? (
                <span className="text-[11px] text-store-ink-faint">{t('demands.category.empty')}</span>
              ) : null}
            </div>
          </div>
          {requiresAppForm ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">
                {t('demands.publish.appFormLabel')}
                <span className="ml-1 text-red-500">*</span>
              </span>
              <DemandsAppFormPicker value={appForms} disabled={submitting} onChange={setAppForms} />
              <span className="text-[11px] text-store-ink-faint">{t('demands.publish.appFormHint')}</span>
            </div>
          ) : null}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">{t('demands.publish.budgetLabel')}</span>
            <input
              className={inputClass}
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder={t('demands.publish.budgetPlaceholder')}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                inputMode="decimal"
                value={budgetMin}
                onChange={(event) => setBudgetMin(event.target.value)}
                placeholder={t('demands.publish.budgetMinPlaceholder')}
              />
              <input
                className={inputClass}
                inputMode="decimal"
                value={budgetMax}
                onChange={(event) => setBudgetMax(event.target.value)}
                placeholder={t('demands.publish.budgetMaxPlaceholder')}
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">{t('demands.publish.bidDeadlineLabel')}</span>
            <input
              className={inputClass}
              type="datetime-local"
              value={bidDeadline}
              onChange={(event) => setBidDeadline(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">{t('demands.publish.descriptionLabel')}</span>
            <textarea
              className={`${inputClass} min-h-[96px] py-2 h-auto`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('demands.publish.descriptionPlaceholder')}
            />
          </label>
          {requiresAppForm && appForms.length === 0 ? (
            <p className="text-[11px] text-store-ink-faint">{t('demands.publish.appFormRequired')}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-red-500" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-2.5 rounded-store-control text-sm font-bold transition-all ${
              canSubmit
                ? 'bg-store-brand text-white hover:opacity-90 cursor-pointer'
                : 'bg-store-field text-store-ink-faint cursor-not-allowed border border-store-line'
            }`}
          >
            {submitting ? t('demands.publish.submitting') : t('demands.publish.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};
