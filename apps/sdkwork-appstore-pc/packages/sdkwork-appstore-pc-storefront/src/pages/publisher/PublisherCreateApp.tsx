import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AppStoreService, ConsoleService } from '../../services/api';

/** Navbar create-menu presets (`?type=`) mapped to store application types. */
const APP_TYPE_BY_PARAM: Record<string, string> = {
  app: 'APP',
  website: 'WEBSITE',
  promo: 'PROMO',
};

export default function PublisherCreateApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appType = APP_TYPE_BY_PARAM[searchParams.get('type') ?? ''] ?? 'APP';
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    category: '',
    pricing: 'FREE',
    keywords: '',
  });

  useEffect(() => {
    AppStoreService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('error');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await ConsoleService.publishApp({
        name: form.name.trim(),
        categoryId: form.category || categories[0]?.id || undefined,
        version: '1.0.0',
        description: form.subtitle,
        appType,
        pricingModel: form.pricing,
      });
      navigate(`/publisher/apps/${created.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create app', err);
      setError('error');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-2xl transition-colors duration-200 select-none space-y-6">
      <Link
        to="/publisher"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-store-ink-faint hover:text-store-brand transition-colors  "
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('publisher.createApp.back')}
      </Link>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-store-ink ">
          {t('publisher.createApp.title')}
        </h1>
        <p className="text-xs text-store-ink-faint mt-1 ">
          {t('publisher.createApp.subtitle')}
        </p>
      </div>

      <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line space-y-4 ">
        <div>
          <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
            {t('publisher.createApp.name')} *
          </label>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={t('publisher.createApp.name')}
            className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
            {t('publisher.createApp.subtitleLabel')}
          </label>
          <input
            value={form.subtitle}
            onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
            placeholder={t('publisher.createApp.subtitleLabel')}
            className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
              {t('publisher.createApp.category')}
            </label>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink outline-none focus:border-store-brand transition-colors h-9 placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
              {t('publisher.createApp.pricing')}
            </label>
            <select
              value={form.pricing}
              onChange={(event) => setForm((prev) => ({ ...prev, pricing: event.target.value }))}
              className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink outline-none focus:border-store-brand transition-colors h-9 placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
            >
              <option value="FREE">{t('publisher.createApp.pricingFree')}</option>
              <option value="PAID">{t('publisher.createApp.pricingPaid')}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
            {t('publisher.createApp.keywords')}
          </label>
          <input
            value={form.keywords}
            onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
            placeholder={t('publisher.createApp.keywords')}
            className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-store-card bg-store-danger/10 text-store-danger text-xs font-bold ">
            {t('publisher.manage.error.loadFailed')}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim()}
          className="px-5 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
        >
          {submitting ? t('publisher.createApp.submitting') : t('publisher.createApp.submit')}
        </button>
      </div>
    </div>
  );
}
