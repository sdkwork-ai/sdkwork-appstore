import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AppStoreService, ConsoleService } from '../../services/api';

export default function PublisherCreateApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        category: form.category || categories[0]?.name || '',
        version: '1.0.0',
        description: form.subtitle,
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
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('publisher.createApp.back')}
      </Link>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('publisher.createApp.title')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('publisher.createApp.subtitle')}
        </p>
      </div>

      <div className="rounded-3xl p-6 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
            {t('publisher.createApp.name')} *
          </label>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={t('publisher.createApp.name')}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
            {t('publisher.createApp.subtitleLabel')}
          </label>
          <input
            value={form.subtitle}
            onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
            placeholder={t('publisher.createApp.subtitleLabel')}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
              {t('publisher.createApp.category')}
            </label>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
              {t('publisher.createApp.pricing')}
            </label>
            <select
              value={form.pricing}
              onChange={(event) => setForm((prev) => ({ ...prev, pricing: event.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="FREE">{t('publisher.createApp.pricingFree')}</option>
              <option value="PAID">{t('publisher.createApp.pricingPaid')}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
            {t('publisher.createApp.keywords')}
          </label>
          <input
            value={form.keywords}
            onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
            placeholder={t('publisher.createApp.keywords')}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold">
            {t('publisher.manage.error.loadFailed')}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
        >
          {submitting ? t('publisher.createApp.submitting') : t('publisher.createApp.submit')}
        </button>
      </div>
    </div>
  );
}
