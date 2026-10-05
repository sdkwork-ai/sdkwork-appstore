import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useLibraryUpdates, formatApiError, installListingAndDownload } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { mapLibraryUpdateRow } from '@sdkwork/appstore-library-core';

export function UpdatesPage() {
  const navigate = useNavigate();
  const { data, loading, error, execute } = useLibraryUpdates();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const updates = useMemo(() => {
    const libraryItems = data?.libraryItems ?? [];
    return (data?.updates ?? []).map((update, index) =>
      mapLibraryUpdateRow(update, index, libraryItems),
    );
  }, [data]);

  async function handleUpdateDownload(update: (typeof updates)[number]) {
    if (!update.artifactId) {
      setActionError('该更新暂无可下载的安装包。');
      return;
    }
    setDownloadingId(update.id);
    setActionError(null);
    try {
      // Re-install through the library: the backend advances the row's
      // installed version to the latest published release, so the update
      // leaves the pending list, then the fresh artifact is downloaded.
      const downloadUrl = await installListingAndDownload({
        listingId: update.listingSlug,
        platform: update.platform,
        appKey: update.appKey || undefined,
      });
      if (downloadUrl?.downloadUrl) {
        window.open(downloadUrl.downloadUrl, '_blank', 'noopener,noreferrer');
      }
      await execute();
    } catch (err) {
      setActionError(formatApiError(err instanceof Error ? err : new Error(String(err))));
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <header
        className="page-header sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
          backdropFilter: 'blur(16px)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ color: 'var(--text-primary)' }}
              aria-label="返回"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                更新
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {updates.length > 0 ? `${updates.length} 个可用更新` : '已是最新版本'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void execute()}
            className="btn-primary flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {error ? (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            {formatApiError(error)}
          </div>
        ) : null}
        {actionError ? (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            {actionError}
          </div>
        ) : null}

        {updates.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--success)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              暂无待安装的更新。
            </p>
            <Link to="/library" className="mt-4 inline-block text-sm font-medium" style={{ color: 'var(--accent)' }}>
              打开我的库
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="app-icon flex h-12 w-12 flex-shrink-0 items-center justify-center text-lg font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
                  >
                    {update.appName[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {update.appName}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span>v{update.currentVersion}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium" style={{ color: 'var(--accent)' }}>
                        v{update.newVersion}
                      </span>
                      <span>({update.size})</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={!update.artifactId || downloadingId === update.id}
                    onClick={() => void handleUpdateDownload(update)}
                    className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {downloadingId === update.id ? '准备中…' : '更新'}
                  </button>
                  {update.listingSlug ? (
                    <Link
                      to={`/app/${update.listingSlug}`}
                      className="btn-secondary rounded-full px-4 py-2 text-sm font-medium"
                    >
                      查看
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
