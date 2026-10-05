import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  formatApiError,
  isAppStoreApiError,
  publisherService,
  usePublisher,
} from '@sdkwork/appstore-publisher-console-core';
import { LoadingSpinner } from '@sdkwork/appstore-h5-commons';

/** Storefront create-menu presets (`?type=`) mapped to store application types. */
const APP_TYPE_BY_PARAM: Record<string, string> = {
  app: 'APP',
  website: 'WEBSITE',
  promo: 'PROMO',
};

export function PublisherNewAppPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appType = APP_TYPE_BY_PARAM[searchParams.get('type') ?? ''] ?? 'APP';
  const { data: publisherData, loading: publisherLoading } = usePublisher();
  const [appKey, setAppKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [defaultLocale, setDefaultLocale] = useState('zh-CN');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!publisherData) {
      setError('请先创建发布者资料再注册应用。');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await publisherService.bootstrapApp({
        appKey: appKey.trim(),
        displayName: displayName.trim(),
        defaultLocale: defaultLocale.trim(),
        appType,
      });
      const listingId = (result.listing as { id?: string })?.id;
      if (listingId) {
        navigate(`/publisher/apps/${listingId}`);
        return;
      }
      navigate('/publisher');
    } catch (submitError) {
      setError(
        formatApiError(
          isAppStoreApiError(submitError)
            ? submitError
            : submitError instanceof Error
              ? submitError
              : new Error(String(submitError)),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (publisherLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <header className="page-header">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/publisher" className="flex h-10 w-10 items-center justify-center" aria-label="返回">
            <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">创建应用</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        {!publisherData && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            需要发布者资料才能创建应用。
          </p>
        )}

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)] mb-1 block">应用标识（kebab-case）</span>
          <input
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)]"
            placeholder="my-awesome-app"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)] mb-1 block">显示名称</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)]"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)] mb-1 block">默认语言</span>
          <input
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)]"
          />
        </label>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !publisherData}
          className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium disabled:opacity-60"
        >
          {submitting ? '创建中…' : '创建应用与上架条目'}
        </button>
      </form>
    </div>
  );
}
