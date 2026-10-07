import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  formatApiError,
  publisherService,
  usePublisher,
  usePublisherListings,
} from '@sdkwork/appstore-publisher-console-core';
import { LoadingSpinner, readString } from '@sdkwork/appstore-h5-commons';

function mapReviewLabel(reviewStatus: string, listingStatus: string): string {
  if (reviewStatus === 'in_review' || reviewStatus === 'pending' || reviewStatus === 'pending_review') {
    return '审核中';
  }
  if (reviewStatus === 'rejected') {
    return '已拒绝';
  }
  if (reviewStatus === 'approved' && listingStatus === 'active') {
    return '已上架';
  }
  return '草稿';
}

/** Inline publisher registration (publishers.create) for H5-first publishers. */
function PublisherRegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!displayName.trim() || submitting) {
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await publisherService.createPublisher({
        displayName: displayName.trim(),
        supportEmail: supportEmail.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        publisherType: 'INDIVIDUAL',
      });
      onRegistered();
    } catch (err) {
      setMessage(formatApiError(err as Error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card p-4 space-y-3 mb-4">
      <h2 className="font-semibold text-[var(--text-primary)]">注册发布者</h2>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="发布者名称"
        aria-label="发布者名称"
        className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
      />
      <input
        value={supportEmail}
        onChange={(e) => setSupportEmail(e.target.value)}
        placeholder="联系邮箱（选填）"
        type="email"
        aria-label="联系邮箱"
        className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
      />
      <input
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="官网地址（选填）"
        type="url"
        aria-label="官网地址"
        className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
      />
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={submitting || !displayName.trim()}
        className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
      >
        {submitting ? '注册中…' : '注册发布者'}
      </button>
      {message && <p className="text-xs text-[var(--text-tertiary)]">{message}</p>}
    </section>
  );
}

export function PublisherConsolePage() {
  const { data: publisherData, loading: publisherLoading, error: publisherError, execute: refreshPublisher } = usePublisher();
  const { data: listingsData, loading: listingsLoading, error: listingsError } = usePublisherListings();
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<{ id: string; label: string }[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const items = listingsData?.items ?? [];
  const loading = publisherLoading || listingsLoading;
  const error = publisherError ?? listingsError;

  const publisherRow = (publisherData ?? {}) as unknown as Record<string, unknown>;
  const publisherId = readString(publisherRow, 'id');
  const publisherName = readString(publisherRow, 'displayName', 'display_name') || '开发者';

  async function loadMembers() {
    if (!publisherId || membersLoading) {
      return;
    }
    setMembersOpen(true);
    setMembersLoading(true);
    setMembersError(null);
    try {
      const page = await publisherService.listMembers(publisherId);
      const rows = ((page as unknown as { items?: unknown }).items ?? []) as Record<string, unknown>[];
      setMembers(
        rows.map((row, index) => ({
          id: readString(row, 'id') || String(index),
          label: `${readString(row, 'displayName', 'display_name') || readString(row, 'userId', 'user_id') || '成员'} · ${
            readString(row, 'memberRole', 'member_role') || readString(row, 'role') || 'member'
          }`,
        })),
      );
    } catch (err) {
      setMembersError(formatApiError(err as Error));
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleInvite() {
    if (!publisherId || !inviteUserId.trim() || inviting) {
      return;
    }
    setInviting(true);
    setInviteMessage(null);
    try {
      await publisherService.inviteMember(publisherId, { inviteeUserId: inviteUserId.trim(), memberRole: 'member' });
      setInviteUserId('');
      setInviteMessage('邀请已发送。');
      await loadMembers();
    } catch (err) {
      setInviteMessage(formatApiError(err as Error));
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <header className="page-header">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/settings" className="flex h-10 w-10 items-center justify-center" aria-label="返回设置">
            <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">开发者中心</h1>
          <Link
            to="/publisher/apps/new"
            className="flex h-10 w-10 items-center justify-center text-[var(--accent)]"
            aria-label="创建应用"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      </header>

      <div className="px-4 py-4">
        <p className="text-sm text-[var(--text-tertiary)] mb-4">发布者：{publisherName}</p>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {formatApiError(error)}
          </div>
        )}

        {!publisherData && <PublisherRegisterForm onRegistered={() => void refreshPublisher()} />}

        {publisherId && (
          <section className="card p-4 space-y-3 mb-4">
            <button
              type="button"
              onClick={() => (membersOpen ? setMembersOpen(false) : void loadMembers())}
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              {membersOpen ? '收起成员' : '成员管理'}
            </button>
            {membersOpen && (
              <div className="space-y-2">
                {membersLoading && <p className="text-xs text-[var(--text-tertiary)]">加载中…</p>}
                {membersError && <p className="text-xs text-[var(--text-tertiary)]">{membersError}</p>}
                {!membersLoading && !membersError && members.length === 0 && (
                  <p className="text-xs text-[var(--text-tertiary)]">暂无成员。</p>
                )}
                {members.map((member) => (
                  <div key={member.id} className="px-3 py-2 border border-[var(--border-default)] rounded-xl text-xs">
                    {member.label}
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    value={inviteUserId}
                    onChange={(e) => setInviteUserId(e.target.value)}
                    placeholder="被邀请用户 ID"
                    aria-label="被邀请用户 ID"
                    className="flex-1 px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleInvite()}
                    disabled={inviting || !inviteUserId.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {inviting ? '邀请中…' : '邀请'}
                  </button>
                </div>
                {inviteMessage && <p className="text-xs text-[var(--text-tertiary)]">{inviteMessage}</p>}
              </div>
            )}
          </section>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-tertiary)] mb-4">暂无应用</p>
            <Link
              to="/publisher/apps/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-full text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              创建应用
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => {
              const row = (item ?? {}) as Record<string, unknown>;
              const id = readString(row, 'id') || String(index);
              const slug = readString(row, 'listingSlug', 'listing_slug') || id;
              const reviewStatus = readString(row, 'reviewStatus', 'review_status').toLowerCase();
              const listingStatus = readString(row, 'listingStatus', 'listing_status').toLowerCase();
              return (
                <li key={id}>
                  <Link
                    to={`/publisher/apps/${id}`}
                    className="block card card-press px-4 py-3"
                  >
                    <div className="font-semibold text-[var(--text-primary)]">{slug}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      {listingStatus} · {mapReviewLabel(reviewStatus, listingStatus)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
