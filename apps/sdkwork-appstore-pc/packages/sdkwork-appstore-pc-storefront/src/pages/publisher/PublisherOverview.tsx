import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Mail, Globe, Plus, ShieldAlert } from 'lucide-react';
import { ConsoleService } from '../../services/api';
import { ManagedApp, PublisherProfile } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type StatusFilter = 'all' | 'live' | 'review' | 'draft' | 'offline';

const STATUS_FILTERS: StatusFilter[] = ['all', 'live', 'review', 'draft', 'offline'];

export default function PublisherOverview() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PublisherProfile | undefined>();
  const [apps, setApps] = useState<ManagedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({ displayName: '', legalName: '', supportEmail: '', websiteUrl: '' });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [me, managedApps] = await Promise.all([
          ConsoleService.getPublisherProfile().catch(() => undefined),
          ConsoleService.getManagedApps().catch(() => []),
        ]);
        if (!cancelled) {
          setProfile(me);
          setApps(managedApps);
        }
      } catch (error) {
        console.error('Failed to load publisher data', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = async () => {
    if (!form.displayName.trim()) {
      return;
    }
    setRegistering(true);
    try {
      const created = await ConsoleService.registerPublisher({
        displayName: form.displayName,
        legalName: form.legalName,
        supportEmail: form.supportEmail,
        websiteUrl: form.websiteUrl,
      });
      setProfile(created);
      setNotice(t('publisher.onboarding.success'));
      // Best-effort verification submission; failures never block onboarding.
      await ConsoleService.submitVerification({ verificationType: 'INDIVIDUAL' }).catch(() => false);
    } catch (error) {
      console.error('Failed to register publisher', error);
      setNotice(null);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const visibleApps = apps.filter((app) => {
    switch (statusFilter) {
      case 'live':
        return app.status === '已上架';
      case 'review':
        return app.status === '审核中';
      case 'draft':
        return app.status === '已提交上架';
      case 'offline':
        return app.status === '已下架';
      default:
        return true;
    }
  });

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-store-ink ">
            {t('publisher.header.title')}
          </h1>
          <p className="text-xs text-store-ink-faint mt-1 ">
            {t('publisher.header.subtitle')}
          </p>
        </div>
        {profile && (
          <Link
            to="/publisher/apps/new"
            className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('publisher.overview.createApp')}
          </Link>
        )}
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-store-card bg-store-success/10 text-store-success text-xs font-bold ">
          {notice}
        </div>
      )}

      {!profile ? (
        <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line space-y-4 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-store-control bg-store-brand/10 text-store-brand flex items-center justify-center ">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-store-ink ">
                {t('publisher.onboarding.title')}
              </h2>
              <p className="text-xs text-store-ink-faint ">
                {t('publisher.onboarding.subtitle')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
              placeholder={t('publisher.onboarding.displayName')}
              className="px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
            />
            <input
              value={form.legalName}
              onChange={(event) => setForm((prev) => ({ ...prev, legalName: event.target.value }))}
              placeholder={t('publisher.onboarding.legalName')}
              className="px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
            />
            <input
              value={form.supportEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, supportEmail: event.target.value }))}
              placeholder={t('publisher.onboarding.supportEmail')}
              type="email"
              className="px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
            />
            <input
              value={form.websiteUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, websiteUrl: event.target.value }))}
              placeholder={t('publisher.onboarding.websiteUrl')}
              type="url"
              className="px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={registering || !form.displayName.trim()}
            className="px-5 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
          >
            {registering ? t('publisher.onboarding.submitting') : t('publisher.onboarding.submit')}
          </button>
        </div>
      ) : (
        <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line flex flex-col md:flex-row md:items-center gap-4 ">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-store-card bg-gradient-to-br from-store-brand to-store-brand text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-store-ink flex items-center gap-1.5 ">
                {profile.displayName}
                {profile.verificationStatus === 'VERIFIED' && (
                  <BadgeCheck className="w-4 h-4 text-store-success" />
                )}
              </h2>
              <p className="text-[11px] text-store-ink-faint flex items-center gap-3 mt-0.5 ">
                {profile.supportEmail && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.supportEmail}</span>
                )}
                {profile.websiteUrl && (
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{profile.websiteUrl}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {profile.verificationStatus === 'VERIFIED' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-store-success/10 text-store-success text-xs font-medium flex items-center gap-1 ">
                <BadgeCheck className="w-3.5 h-3.5" />
                {t('publisher.onboarding.verified')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-store-warning/10 text-store-warning text-xs font-medium flex items-center gap-1 ">
                <ShieldAlert className="w-3.5 h-3.5" />
                {t('publisher.onboarding.pendingVerification')}
              </span>
            )}
          </div>
        </div>
      )}

      {profile && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-store-ink ">
              {t('publisher.overview.title')}
            </h3>
            <div className="flex items-center gap-1.5">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-store-brand text-white'
                      : 'bg-store-subtle text-store-ink-faint hover:text-store-ink '
                  }`}
                >
                  {t(`publisher.overview.status${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {visibleApps.map((app) => (
              <Link
                key={app.id}
                to={`/publisher/apps/${app.id}`}
                className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card hover:border-store-line-strong transition-all flex items-center justify-between gap-3 "
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-store-ink truncate ">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-store-ink-faint mt-0.5 ">
                    v{app.version} · {app.downloads} · {app.updatedAt ?? ''}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    app.status === '已上架'
                      ? 'bg-store-success/10 text-store-success '
                      : app.status === '审核中'
                        ? 'bg-store-warning/10 text-store-warning '
                        : app.status === '已下架'
                          ? 'bg-store-danger/10 text-store-danger '
                          : 'bg-gray-500/10 text-store-ink-faint '
                  }`}
                >
                  {app.status}
                </span>
              </Link>
            ))}
            {visibleApps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
                <h4 className="text-xs font-bold text-store-ink ">
                  {t('publisher.manage.error.loadFailed')}
                </h4>
                <Link
                  to="/publisher/apps/new"
                  className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-full text-[11px] font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('publisher.overview.createApp')}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
