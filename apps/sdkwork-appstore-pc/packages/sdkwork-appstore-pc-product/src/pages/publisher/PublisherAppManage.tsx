import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { ConsoleService } from '../../services/api';
import { ManagedAppDetail, PublisherMember, PublisherProfile, ReleaseItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type TabKey = 'overview' | 'releases' | 'members';

function mapReleaseStatus(status: string): string {
  switch (status.toLocaleUpperCase()) {
    case 'DRAFT':
      return 'publisher.manage.releases.statusDraft';
    case 'PENDING':
    case 'IN_REVIEW':
    case 'SUBMITTED':
      return 'publisher.manage.releases.statusPending';
    case 'APPROVED':
      return 'publisher.manage.releases.statusApproved';
    case 'PUBLISHED':
      return 'publisher.manage.releases.statusPublished';
    case 'RETIRED':
      return 'publisher.manage.releases.statusRetired';
    default:
      return 'publisher.manage.releases.statusDraft';
  }
}

export default function PublisherAppManage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('overview');
  const [listing, setListing] = useState<ManagedAppDetail | undefined>();
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [members, setMembers] = useState<PublisherMember[]>([]);
  const [profile, setProfile] = useState<PublisherProfile | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // basic-info edit state
  const [basicForm, setBasicForm] = useState({ pricingModel: 'FREE', officialWebsiteUrl: '', supportUrl: '', privacyPolicyUrl: '' });
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // release create state
  const [releaseForm, setReleaseForm] = useState({ versionName: '', versionCode: '', channelCode: 'PRODUCTION' });
  const [creatingRelease, setCreatingRelease] = useState(false);
  const [rolloutPercent, setRolloutPercent] = useState(10);
  const [applyingRollout, setApplyingRollout] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [releaseNotice, setReleaseNotice] = useState<string | null>(null);

  // member invite state
  const [inviteForm, setInviteForm] = useState({ userId: '', role: 'EDITOR' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [detail, releaseList, me] = await Promise.all([
          ConsoleService.getListingById(id).catch(() => undefined),
          ConsoleService.getReleases(id).catch(() => []),
          ConsoleService.getPublisherProfile().catch(() => undefined),
        ]);
        if (cancelled) {
          return;
        }
        if (!detail) {
          setLoadError(true);
        } else {
          setListing(detail);
          setBasicForm({
            pricingModel: detail.pricingModel || 'FREE',
            officialWebsiteUrl: '',
            supportUrl: '',
            privacyPolicyUrl: '',
          });
        }
        setReleases(releaseList);
        if (releaseList.length > 0) {
          setRolloutPercent(releaseList[0].targetPercentage ?? 10);
        }
        if (me) {
          setProfile(me);
          const withMembers = await ConsoleService.listMembers(me.id).catch(() => []);
          if (!cancelled) {
            setMembers(withMembers);
          }
        }
      } catch (error) {
        console.error('Failed to load listing', error);
        setLoadError(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveBasic = async () => {
    setSaving(true);
    setSavedNotice(false);
    try {
      await ConsoleService.updateListing(id, {
        pricingModel: basicForm.pricingModel,
        officialWebsiteUrl: basicForm.officialWebsiteUrl || undefined,
        supportUrl: basicForm.supportUrl || undefined,
        privacyPolicyUrl: basicForm.privacyPolicyUrl || undefined,
      });
      setSavedNotice(true);
    } catch (error) {
      console.error('Failed to update listing', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRelease = async () => {
    if (!releaseForm.versionName.trim() || !releaseForm.versionCode.trim()) {
      return;
    }
    setCreatingRelease(true);
    setReleaseNotice(null);
    try {
      await ConsoleService.createRelease(id, {
        channelCode: releaseForm.channelCode,
        versionName: releaseForm.versionName.trim(),
        versionCode: releaseForm.versionCode.trim(),
      });
      setReleaseForm({ versionName: '', versionCode: '', channelCode: releaseForm.channelCode });
      const refreshed = await ConsoleService.getReleases(id);
      setReleases(refreshed);
      setRolloutPercent(refreshed[0]?.targetPercentage ?? 10);
    } catch (error) {
      console.error('Failed to create release', error);
      setReleaseNotice(t('publisher.manage.error.loadFailed'));
    } finally {
      setCreatingRelease(false);
    }
  };

  const handleApplyRollout = async (releaseId: string, percent: number) => {
    setApplyingRollout(true);
    try {
      await ConsoleService.updateReleaseRollout(releaseId, percent);
      const refreshed = await ConsoleService.getReleases(id);
      setReleases(refreshed);
    } catch (error) {
      console.error('Failed to update rollout', error);
    } finally {
      setApplyingRollout(false);
    }
  };

  const handleSubmitReview = async (releaseId?: string) => {
    setSubmittingReview(true);
    setReleaseNotice(null);
    try {
      await ConsoleService.submitListingForReview(id, releaseId);
      setReleaseNotice(t('publisher.manage.releases.reviewSubmitted'));
      const refreshed = await ConsoleService.getReleases(id);
      setReleases(refreshed);
    } catch (error) {
      console.error('Failed to submit for review', error);
      setReleaseNotice(t('publisher.manage.error.loadFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInvite = async () => {
    if (!profile || !inviteForm.userId.trim()) {
      return;
    }
    setInviting(true);
    try {
      await ConsoleService.inviteMember(profile.id, {
        userId: inviteForm.userId.trim(),
        role: inviteForm.role,
      });
      setInviteForm({ userId: '', role: 'EDITOR' });
      const refreshed = await ConsoleService.listMembers(profile.id);
      setMembers(refreshed);
    } catch (error) {
      console.error('Failed to invite member', error);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (loadError || !listing) {
    return (
      <div className="p-6 md:p-8 w-full max-w-full">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('publisher.manage.error.permissionDenied')}
          </h3>
          <Link to="/publisher" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors">
            {t('publisher.manage.back')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: t('publisher.manage.tabs.overview') },
    { key: 'releases', label: t('publisher.manage.tabs.releases') },
    { key: 'members', label: t('publisher.manage.tabs.members') },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      <Link
        to="/publisher"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('publisher.manage.back')}
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {listing.name}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {listing.slug} · {listing.appKey} · {listing.category}
          </p>
        </div>
        <span
          className={`self-start px-3 py-1.5 rounded-full text-[11px] font-bold ${
            listing.status === '已上架'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : listing.status === '审核中'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-gray-500/10 text-gray-500 dark:text-gray-400'
          }`}
        >
          {listing.status}
        </span>
      </div>

      <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              tab === tabItem.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rounded-3xl p-6 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('publisher.manage.basic.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('publisher.manage.basic.name')}</p>
              <p className="text-gray-900 dark:text-gray-100 font-bold mt-0.5">{listing.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('publisher.manage.basic.slug')}</p>
              <p className="text-gray-900 dark:text-gray-100 font-bold mt-0.5">{listing.slug}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('publisher.manage.basic.category')}</p>
              <p className="text-gray-900 dark:text-gray-100 font-bold mt-0.5">{listing.category}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('publisher.manage.basic.downloads')}</p>
              <p className="text-gray-900 dark:text-gray-100 font-bold mt-0.5">{listing.downloads}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.basic.pricingModel')}
              </label>
              <select
                value={basicForm.pricingModel}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, pricingModel: event.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="FREE">{t('publisher.createApp.pricingFree')}</option>
                <option value="PAID">{t('publisher.createApp.pricingPaid')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.basic.officialWebsiteUrl')}
              </label>
              <input
                value={basicForm.officialWebsiteUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, officialWebsiteUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.basic.supportUrl')}
              </label>
              <input
                value={basicForm.supportUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, supportUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.basic.privacyPolicyUrl')}
              </label>
              <input
                value={basicForm.privacyPolicyUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, privacyPolicyUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBasic}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              {saving ? t('publisher.manage.basic.saving') : t('publisher.manage.basic.save')}
            </button>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('publisher.manage.basic.saved')}
              </span>
            )}
          </div>
        </div>
      )}

      {tab === 'releases' && (
        <div className="space-y-6">
          {releaseNotice && (
            <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {releaseNotice}
            </div>
          )}

          <div className="rounded-3xl p-6 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('publisher.manage.releases.newRelease')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t('publisher.manage.releases.versionName')}
                </label>
                <input
                  value={releaseForm.versionName}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, versionName: event.target.value }))}
                  placeholder="1.2.0"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t('publisher.manage.releases.versionCode')}
                </label>
                <input
                  value={releaseForm.versionCode}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, versionCode: event.target.value }))}
                  placeholder="12"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t('publisher.manage.releases.channel')}
                </label>
                <select
                  value={releaseForm.channelCode}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, channelCode: event.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="PRODUCTION">{t('publisher.manage.releases.channelOfficial')}</option>
                  <option value="BETA">{t('publisher.manage.releases.channelBeta')}</option>
                  <option value="GRAY">{t('publisher.manage.releases.channelGray')}</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreateRelease}
              disabled={creatingRelease || !releaseForm.versionName.trim() || !releaseForm.versionCode.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              {creatingRelease ? t('publisher.manage.releases.creating') : t('publisher.manage.releases.create')}
            </button>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {t('publisher.manage.releases.listTitle')}
            </h3>
            {releases.map((release) => (
              <div
                key={release.id}
                className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      v{release.versionName} ({release.versionCode})
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {release.channelCode} · {release.publishedAt || release.createdAt || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                      {t(mapReleaseStatus(release.status))}
                    </span>
                    <button
                      onClick={() => handleSubmitReview(release.id)}
                      disabled={submittingReview}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      {t('publisher.manage.releases.submitReview')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
                    {t('publisher.manage.releases.rollout')}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={release.targetPercentage ?? rolloutPercent}
                    onChange={(event) => handleApplyRollout(release.id, Number(event.target.value))}
                    disabled={applyingRollout}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 w-24 text-right shrink-0">
                    {t('publisher.manage.releases.rolloutPercent', {
                      percent: release.targetPercentage ?? rolloutPercent,
                    })}
                  </span>
                </div>
              </div>
            ))}
            {releases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('publisher.manage.releases.listTitle')}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t('publisher.manage.error.loadFailed')}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'members' && (
        <div className="rounded-3xl p-6 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('publisher.manage.members.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.members.userId')}
              </label>
              <input
                value={inviteForm.userId}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, userId: event.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                {t('publisher.manage.members.role')}
              </label>
              <select
                value={inviteForm.role}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ADMIN">{t('publisher.manage.members.roleAdmin')}</option>
                <option value="EDITOR">{t('publisher.manage.members.roleEditor')}</option>
                <option value="VIEWER">{t('publisher.manage.members.roleViewer')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteForm.userId.trim() || !profile}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                {t('publisher.manage.members.inviteBtn')}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {member.userId}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('publisher.manage.members.table.joinedAt')}: {member.joinedAt ?? '—'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold shrink-0">
                  {member.role}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
                {t('publisher.manage.members.empty')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
