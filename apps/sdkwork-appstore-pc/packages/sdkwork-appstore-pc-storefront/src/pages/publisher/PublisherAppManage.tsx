import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, FileText, Send } from 'lucide-react';
import {
    ConsoleService,
    uploadAndAttachReleaseArtifact,
    detectDesktopOs,
  } from '@sdkwork/appstore-pc-core';
import type { ArtifactUploadPort } from '@sdkwork/appstore-pc-core';
import { Tabs } from '@sdkwork/appstore-pc-commons';
import { ListingMediaItem, ManagedAppDetail, PublisherMember, PublisherProfile, ReleaseHistoryEntry, ReleaseItem } from '../../types';
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
  const [releaseForm, setReleaseForm] = useState({ versionName: '', versionCode: '', channelCode: 'production' });
  const [creatingRelease, setCreatingRelease] = useState(false);
  const [rolloutPercent, setRolloutPercent] = useState(10);
  const [applyingRollout, setApplyingRollout] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingReleaseId, setUploadingReleaseId] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [releaseNotice, setReleaseNotice] = useState<string | null>(null);
  // Release notes editing and retirement (releases.notes.update / releases.retire).
  const [editingNotesReleaseId, setEditingNotesReleaseId] = useState<string | null>(null);
  const [releaseNotesDraft, setReleaseNotesDraft] = useState('');
  const [savingReleaseNotes, setSavingReleaseNotes] = useState(false);
  const [retiringReleaseId, setRetiringReleaseId] = useState<string | null>(null);
  // Listing media management (listings.media.list / listings.media.delete).
  const [mediaItems, setMediaItems] = useState<ListingMediaItem[]>([]);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  // Release lifecycle history (listings.releases.history.list).
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<ReleaseHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // member invite state
  const [inviteForm, setInviteForm] = useState({ userId: '', role: 'EDITOR' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [detail, releaseList, me, mediaList] = await Promise.all([
          ConsoleService.getListingById(id).catch(() => undefined),
          ConsoleService.getReleases(id).catch(() => []),
          ConsoleService.getPublisherProfile().catch(() => undefined),
          ConsoleService.listListingMedia(id).catch(() => []),
        ]);
        if (cancelled) {
          return;
        }
        setMediaItems(mediaList);
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

  const handleSaveReleaseNotes = async (releaseId: string) => {
    if (savingReleaseNotes) {
      return;
    }
    setSavingReleaseNotes(true);
    try {
      await ConsoleService.updateReleaseNotes(releaseId, 'zh-CN', releaseNotesDraft);
      setEditingNotesReleaseId(null);
      setReleaseNotice(t('publisher.manage.releases.notesSaved'));
    } catch (error) {
      console.error('Failed to save release notes', error);
    } finally {
      setSavingReleaseNotes(false);
    }
  };

  const handleRetireRelease = async (releaseId: string) => {
    if (retiringReleaseId) {
      return;
    }
    setRetiringReleaseId(releaseId);
    try {
      await ConsoleService.retireRelease(releaseId);
      const refreshed = await ConsoleService.getReleases(id);
      setReleases(refreshed);
    } catch (error) {
      console.error('Failed to retire release', error);
      setReleaseNotice(
        error instanceof Error ? error.message : t('publisher.manage.releases.retireFailed'),
      );
    } finally {
      setRetiringReleaseId(null);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (deletingMediaId) {
      return;
    }
    setDeletingMediaId(mediaId);
    try {
      await ConsoleService.deleteListingMedia(id, mediaId);
      setMediaItems((prev) => prev.filter((item) => item.id !== mediaId));
    } catch (error) {
      console.error('Failed to delete media', error);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleToggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && historyEntries.length === 0) {
      setHistoryLoading(true);
      try {
        const entries = await ConsoleService.listListingReleaseHistory(id);
        setHistoryEntries(entries);
      } catch (error) {
        console.error('Failed to load release history', error);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  const handleArtifactUpload = async (releaseId: string, file: File) => {
    setUploadingReleaseId(releaseId);
    setUploadPercent(0);
    setUploadError(null);
    try {
      await uploadAndAttachReleaseArtifact({
        releaseId,
        platform: detectDesktopOs() || 'windows',
        architecture: 'x64',
        packageFormat: 'archive',
        file,
        onProgress: (percent) => setUploadPercent(percent),
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : t('publisher.manage.releases.uploadFailed'),
      );
    } finally {
      setUploadingReleaseId(null);
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
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-store-line-strong ">
          <h3 className="text-sm font-bold text-store-ink ">
            {t('publisher.manage.error.permissionDenied')}
          </h3>
          <Link to="/publisher" className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-full text-xs font-bold transition-colors">
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
        className="inline-flex items-center gap-1.5 text-xs font-bold text-store-ink-faint hover:text-store-brand transition-colors  "
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('publisher.manage.back')}
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-store-ink ">
            {listing.name}
          </h1>
          <p className="text-xs text-store-ink-faint mt-1 ">
            {listing.slug} · {listing.appKey} · {listing.category}
          </p>
        </div>
        <span
          className={`self-start px-2.5 py-0.5 rounded-full text-xs font-medium ${
            listing.status === '已上架'
              ? 'bg-store-success/10 text-store-success '
              : listing.status === '审核中'
                ? 'bg-store-warning/10 text-store-warning '
                : 'bg-gray-500/10 text-store-ink-faint '
          }`}
        >
          {listing.status}
        </span>
      </div>

      {/* The shared tab primitive, not a hand-rolled strip: this page's tabs
          used to pick their own padding, type size and weight, so the same
          three sections looked like a different control from every other tab
          strip in the app. `Tabs` owns the shape; only the section labels and
          the selected value are page-specific.

          The type argument is load-bearing: `Tabs` is generic in the value
          union, but inference from `items` alone falls back to the parameter's
          `string` default, which makes `onChange={setTab}` a type error.
          Verified against the compiler, not assumed. */}
      <Tabs<TabKey>
        items={tabs.map((tabItem) => ({ value: tabItem.key, label: tabItem.label }))}
        value={tab}
        onChange={setTab}
        ariaLabel={t('publisher.manage.tabs.label')}
        className="mb-6"
      />

      {tab === 'overview' && (
        <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line space-y-4 ">
          <h3 className="text-sm font-bold text-store-ink ">
            {t('publisher.manage.basic.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-store-ink-faint font-semibold ">{t('publisher.manage.basic.name')}</p>
              <p className="text-store-ink font-bold mt-0.5 ">{listing.name}</p>
            </div>
            <div>
              <p className="text-store-ink-faint font-semibold ">{t('publisher.manage.basic.slug')}</p>
              <p className="text-store-ink font-bold mt-0.5 ">{listing.slug}</p>
            </div>
            <div>
              <p className="text-store-ink-faint font-semibold ">{t('publisher.manage.basic.category')}</p>
              <p className="text-store-ink font-bold mt-0.5 ">{listing.category}</p>
            </div>
            <div>
              <p className="text-store-ink-faint font-semibold ">{t('publisher.manage.basic.downloads')}</p>
              <p className="text-store-ink font-bold mt-0.5 ">{listing.downloads}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-store-line ">
            <div>
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.basic.pricingModel')}
              </label>
              <select
                value={basicForm.pricingModel}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, pricingModel: event.target.value }))}
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink outline-none focus:border-store-brand transition-colors h-9 placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
              >
                <option value="FREE">{t('publisher.createApp.pricingFree')}</option>
                <option value="PAID">{t('publisher.createApp.pricingPaid')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.basic.officialWebsiteUrl')}
              </label>
              <input
                value={basicForm.officialWebsiteUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, officialWebsiteUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.basic.supportUrl')}
              </label>
              <input
                value={basicForm.supportUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, supportUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.basic.privacyPolicyUrl')}
              </label>
              <input
                value={basicForm.privacyPolicyUrl}
                onChange={(event) => setBasicForm((prev) => ({ ...prev, privacyPolicyUrl: event.target.value }))}
                placeholder="https://"
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBasic}
              disabled={saving}
              className="px-5 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              {saving ? t('publisher.manage.basic.saving') : t('publisher.manage.basic.save')}
            </button>
            {savedNotice && (
              <span className="text-xs font-bold text-store-success flex items-center gap-1 ">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('publisher.manage.basic.saved')}
              </span>
            )}
          </div>

          <section className="pt-4 border-t border-store-line space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-store-ink ">
              {t('publisher.manage.media.title')}
            </h3>
            {mediaItems.length === 0 ? (
              <p className="text-[11px] text-store-ink-faint ">
                {t('publisher.manage.media.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {mediaItems.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between px-3 py-2 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-control "
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-store-ink ">
                        {t(`publisher.manage.media.role.${media.mediaRole}`, media.mediaRole)}
                      </span>
                      <p className="text-[11px] text-store-ink-faint truncate ">{media.mediaResourceId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(media.id)}
                      disabled={deletingMediaId !== null}
                      className="px-3 py-1.5 border border-store-danger/40 text-store-danger hover:bg-store-danger/10 disabled:opacity-50 rounded-store-control text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {deletingMediaId === media.id
                        ? t('publisher.manage.media.deleting')
                        : t('publisher.manage.media.delete')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'releases' && (
        <div className="space-y-6">
          {releaseNotice && (
            <div className="px-4 py-3 rounded-store-card bg-store-success/10 text-store-success text-xs font-bold ">
              {releaseNotice}
            </div>
          )}

          <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line space-y-4 ">
            <h3 className="text-sm font-bold text-store-ink ">
              {t('publisher.manage.releases.newRelease')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                  {t('publisher.manage.releases.versionName')}
                </label>
                <input
                  value={releaseForm.versionName}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, versionName: event.target.value }))}
                  placeholder="1.2.0"
                  className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                  {t('publisher.manage.releases.versionCode')}
                </label>
                <input
                  value={releaseForm.versionCode}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, versionCode: event.target.value }))}
                  placeholder="12"
                  className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                  {t('publisher.manage.releases.channel')}
                </label>
                <select
                  value={releaseForm.channelCode}
                  onChange={(event) => setReleaseForm((prev) => ({ ...prev, channelCode: event.target.value }))}
                  className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink outline-none focus:border-store-brand transition-colors h-9 placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
                >
                  {/* channel_code values come from appstore_release_channel (seed: production). */}
                  <option value="production">{t('publisher.manage.releases.channelOfficial')}</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreateRelease}
              disabled={creatingRelease || !releaseForm.versionName.trim() || !releaseForm.versionCode.trim()}
              className="px-5 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              {creatingRelease ? t('publisher.manage.releases.creating') : t('publisher.manage.releases.create')}
            </button>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-store-ink ">
              {t('publisher.manage.releases.listTitle')}
            </h3>
            {releases.map((release) => (
              <div
                key={release.id}
                className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card space-y-3 "
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-store-ink ">
                      v{release.versionName} ({release.versionCode})
                    </h4>
                    <p className="text-[11px] text-store-ink-faint mt-0.5 ">
                      {release.channelCode} · {release.publishedAt || release.createdAt || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-500/10 text-store-ink-soft text-xs font-medium ">
                      {t(mapReleaseStatus(release.status))}
                    </span>
                    <button
                      onClick={() => handleSubmitReview(release.id)}
                      disabled={submittingReview}
                      className="px-3 py-1.5 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-store-control text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      {t('publisher.manage.releases.submitReview')}
                    </button>
                    <label
                      className={`px-3 py-1.5 border border-store-line hover:border-store-brand text-store-ink rounded-store-control text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${uploadingReleaseId === release.id ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        disabled={uploadingReleaseId !== null}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = '';
                          if (file) {
                            void handleArtifactUpload(release.id, file);
                          }
                        }}
                      />
                      {uploadingReleaseId === release.id
                        ? t('publisher.manage.releases.uploading', { percent: uploadPercent })
                        : t('publisher.manage.releases.uploadArtifact')}
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-store-line ">
                  <span className="text-[11px] font-bold text-store-ink-soft shrink-0 ">
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
                    className="flex-1 accent-store-brand"
                  />
                  <span className="text-[11px] font-bold text-store-ink w-24 text-right shrink-0 ">
                    {t('publisher.manage.releases.rolloutPercent', {
                      percent: release.targetPercentage ?? rolloutPercent,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-store-line ">
                  {editingNotesReleaseId === release.id ? (
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={releaseNotesDraft}
                        onChange={(event) => setReleaseNotesDraft(event.target.value)}
                        rows={3}
                        placeholder={t('publisher.manage.releases.notesPlaceholder')}
                        className="w-full px-3 py-2 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors focus:ring-2 focus:ring-store-brand/25"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveReleaseNotes(release.id)}
                          disabled={savingReleaseNotes}
                          className="px-3 py-1.5 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-store-control text-xs font-medium transition-colors cursor-pointer"
                        >
                          {savingReleaseNotes
                            ? t('publisher.manage.releases.notesSaving')
                            : t('publisher.manage.releases.notesSave')}
                        </button>
                        <button
                          onClick={() => setEditingNotesReleaseId(null)}
                          className="px-3 py-1.5 bg-store-subtle hover:bg-store-field border border-store-line text-store-ink rounded-store-control text-xs font-medium transition-colors cursor-pointer"
                        >
                          {t('publisher.manage.releases.notesCancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingNotesReleaseId(release.id);
                          setReleaseNotesDraft('');
                        }}
                        className="px-3 py-1.5 bg-store-subtle hover:bg-store-field border border-store-line text-store-ink rounded-store-control text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        {t('publisher.manage.releases.editNotes')}
                      </button>
                      <button
                        onClick={() => handleRetireRelease(release.id)}
                        disabled={retiringReleaseId !== null || release.status === 'RETIRED'}
                        className="px-3 py-1.5 bg-store-subtle hover:bg-store-field border border-store-danger/40 text-store-danger disabled:opacity-50 rounded-store-control text-xs font-medium transition-colors cursor-pointer"
                      >
                        {retiringReleaseId === release.id
                          ? t('publisher.manage.releases.retiring')
                          : t('publisher.manage.releases.retire')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {releases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
                <h4 className="text-xs font-bold text-store-ink ">
                  {t('publisher.manage.releases.listTitle')}
                </h4>
                <p className="text-[11px] text-store-ink-faint ">
                  {t('publisher.manage.error.loadFailed')}
                </p>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <button
              type="button"
              onClick={() => void handleToggleHistory()}
              className="px-3 py-1.5 bg-store-subtle hover:bg-store-field border border-store-line text-store-ink rounded-store-control text-xs font-medium transition-colors cursor-pointer"
            >
              {showHistory
                ? t('publisher.manage.history.hide')
                : t('publisher.manage.history.show')}
            </button>
            {showHistory && (
              historyLoading ? (
                <p className="text-[11px] text-store-ink-faint ">
                  {t('publisher.manage.history.loading')}
                </p>
              ) : historyEntries.length === 0 ? (
                <p className="text-[11px] text-store-ink-faint ">
                  {t('publisher.manage.history.empty')}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {historyEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-control text-xs "
                    >
                      <span className="font-bold text-store-ink shrink-0 ">
                        v{entry.versionName}
                        {entry.versionCode ? ` (${entry.versionCode})` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-store-ink-soft shrink-0 ">
                        {entry.releaseStatus}
                      </span>
                      {entry.channelCode && (
                        <span className="text-store-ink-soft shrink-0 ">{entry.channelCode}</span>
                      )}
                      <span className="text-store-ink-faint ml-auto shrink-0 ">
                        {entry.publishedAt || entry.approvedAt || entry.submittedAt || ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>
        </div>
      )}

      {tab === 'members' && (
        <div className="rounded-store-card p-6 bg-store-subtle/60 dark:bg-store-surface border border-store-line space-y-4 ">
          <h3 className="text-sm font-bold text-store-ink ">
            {t('publisher.manage.members.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.members.userId')}
              </label>
              <input
                value={inviteForm.userId}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, userId: event.target.value }))}
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink placeholder:text-store-ink-faint outline-none focus:border-store-brand transition-colors h-9 focus:ring-2 focus:ring-store-brand/25"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-store-ink-soft mb-1.5 ">
                {t('publisher.manage.members.role')}
              </label>
              <select
                value={inviteForm.role}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full px-3 rounded-store-control bg-store-field border border-store-line text-sm text-store-ink outline-none focus:border-store-brand transition-colors h-9 placeholder:text-store-ink-faint focus:ring-2 focus:ring-store-brand/25"
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
                className="px-5 py-2 bg-store-brand hover:bg-store-brand disabled:opacity-50 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
              >
                {t('publisher.manage.members.inviteBtn')}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-store-control bg-store-surface border border-store-line flex items-center justify-between "
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-store-ink truncate ">
                    {member.userId}
                  </p>
                  <p className="text-[11px] text-store-ink-faint mt-0.5 ">
                    {t('publisher.manage.members.table.joinedAt')}: {member.joinedAt ?? '—'}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand text-xs font-medium shrink-0 ">
                  {member.role}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-store-ink-faint py-4 text-center ">
                {t('publisher.manage.members.empty')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
