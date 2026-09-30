import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Download, Share2, Heart, Shield, ChevronRight, Flag, FolderPlus } from 'lucide-react';
import {
  usePublicListing,
  useApi,
  formatApiError,
  installListingAndDownload,
  useListingSimilar,
  useListingReviews,
  useListingOwnership,
  purchaseListingViaCommerce,
} from '@/hooks/useApi';
import { resolveListingInstallState, isPaidPricingModel } from '@sdkwork/appstore-listing-acquire-core';
import {
  openListingReportChannel,
  LISTING_REPORT_REASONS,
} from '@sdkwork/appstore-listing-support-core';
import { isAuthenticated } from '@/bootstrap/iamRuntime';
import { getStoreClient } from '@/services/storeClient';
import { getCommentsClient } from '@/bootstrap/sdkClients';
import { userStoreService, type UserCategory } from '@/services/userStoreClient';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { readRecordString as readString } from '@sdkwork/appstore-h5-commons';

export function ListingDetailPage() {
  // Path parameter name follows the shared route contract
  // (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7): PC and every other
  // client root mount this screen at `/app/:id`.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const slug = id ?? '';
  const { data, loading, error } = usePublicListing(slug);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportNotice, setReportNotice] = useState<{ title: string; message: string } | null>(null);
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectCategories, setCollectCategories] = useState<UserCategory[]>([]);
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectNotice, setCollectNotice] = useState<string | null>(null);
  const [devOtherApps, setDevOtherApps] = useState<{ id: string; name: string; developer: string }[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const authed = isAuthenticated();
  const row = (data ?? {}) as unknown as unknown as Record<string, unknown>;
  const listingId = readString(row, 'id', 'listingId', 'listing_id') || slug;
  const commentsThreadId = readString(row, 'commentsThreadId', 'comments_thread_id') || undefined;
  const commerceProductId = readString(row, 'commerceProductId', 'commerce_product_id') || undefined;
  const { data: similarData } = useListingSimilar(listingId, 6);
  const reviewsApi = useListingReviews(commentsThreadId);
  const reviewItems = reviewsApi.data?.items ?? [];
  const ownershipApi = useListingOwnership(listingId, authed);
  const owned = ownershipApi.data === true;

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    getStoreClient().listings.listDeveloperOther(listingId, { limit: 6 }).then((page) => {
      if (cancelled) return;
      setDevOtherApps((page?.items ?? []).map((r: any) => ({
        id: String(r.listingSlug ?? r.id ?? ''),
        name: String(r.displayName ?? r.title ?? '应用'),
        developer: String(r.developerName ?? r.publisherName ?? ''),
      })));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [listingId]);

  function openCollectSheet() {
    if (!isAuthenticated()) { navigate('/login', { state: { from: { pathname: `/app/${slug}` } } }); return; }
    setCollectOpen(true); setCollectLoading(true); setCollectNotice(null);
    userStoreService.listCategories(getStoreClient()).then((cats) => setCollectCategories(cats)).catch(() => setCollectCategories([])).finally(() => setCollectLoading(false));
  }
  async function handleCollect(categoryId: string) {
    setCollectLoading(true); setCollectNotice(null);
    try {
      await userStoreService.addToCategory(getStoreClient(), categoryId, listingId);
      setCollectNotice('已收录');
      setCollectCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, itemCount: c.itemCount + 1 } : c));
    } catch (err) { setCollectNotice(formatApiError(err instanceof Error ? err : new Error(String(err)))); }
    finally { setCollectLoading(false); }
  }
  async function handleReviewSubmit() {
    const text = reviewBody.trim();
    if (!text || reviewSubmitting || !commentsThreadId) return;
    setReviewSubmitting(true); setReviewError('');
    try {
      const client = getStoreClient();
      await client.listings.updateRating(listingId, { rating: reviewRating });
      await getCommentsClient().comments.comments.create(commentsThreadId, { body: text });
      setReviewBody(''); setReviewRating(5); reviewsApi.execute();
    } catch (err) { setReviewError(formatApiError(err instanceof Error ? err : new Error(String(err)))); }
    finally { setReviewSubmitting(false); }
  }
  async function handleReviewLike(commentId: string) {
    const client = getCommentsClient();
    if (likedComments.has(commentId)) {
      await getCommentsClient().engagement.likes.delete('comment', commentId);
      setLikedComments((prev) => { const s = new Set(prev); s.delete(commentId); return s; });
    } else {
      await getCommentsClient().engagement.likes.update('comment', commentId);
      setLikedComments((prev) => new Set(prev).add(commentId));
    }
  }

  const mediaApi = useApi(
    () => getStoreClient().listings.listMedia(listingId),
    { immediate: false },
  );

  useEffect(() => {
    if (listingId && isAuthenticated()) {
      void mediaApi.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const appKey = readString(row, 'appKey', 'app_key');
  const app = {
    name: readString(row, 'displayName', 'display_name', 'title') || slug || '应用',
    subtitle: readString(row, 'subtitle', 'tagline'),
    developer: readString(row, 'developerName', 'publisherName') || '开发者',
    rating: Number(row.averageRating ?? row.rating ?? 0),
    ratingCount: Number(row.ratingCount ?? row.rating_count ?? 0),
    pricingModel: readString(row, 'pricingModel', 'pricing_model') || 'FREE',
    category: readString(row, 'categoryCode', 'category') || '通用',
    version: readString(row, 'versionName', 'version') || '—',
    description:
      readString(row, 'description', 'shortDescription', 'summary') ||
      '应用详情将在本地化内容发布后展示。',
    whatsNew: readString(row, 'whatsNew', 'whats_new_summary', 'releaseNotes') || '',
    privacyUrl: readString(row, 'privacyPolicyUrl', 'privacy_policy_url'),
    supportUrl: readString(row, 'supportUrl', 'support_url'),
  };

  const similarApps = (similarData?.items ?? []).map((item, index) => {
    const sim = item as unknown as Record<string, unknown>;
    const id = String(sim.listingSlug ?? sim.id ?? index);
    return {
      id,
      name: String(sim.displayName ?? sim.display_name ?? '应用'),
    };
  }).filter((s) => s.id !== slug && s.id !== listingId);

  async function handleGetOrInstall() {
    if (!authed) {
      navigate('/login', { state: { from: { pathname: `/app/${slug}` } } });
      return;
    }
    setActionError(null);
    if (isPaidPricingModel(app.pricingModel) && !owned && !installed) {
      setInstalling(true);
      try {
        const checkout = await purchaseListingViaCommerce({
          commerceProductId,
        });
        if (checkout.status === 'error' || checkout.status === 'unavailable') {
          setActionError(checkout.message);
        } else {
          setPurchaseNotice(checkout.message);
        }
      } catch (err) {
        setActionError(formatApiError(err instanceof Error ? err : new Error(String(err))));
      } finally {
        setInstalling(false);
      }
      return;
    }
    setInstalling(true);
    try {
      const result = await installListingAndDownload({
        listingId,
        platform: 'ANDROID',
        appKey: appKey || undefined,
      });
      setInstalled(true);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setActionError(formatApiError(err instanceof Error ? err : new Error(String(err))));
    } finally {
      setInstalling(false);
    }
  }

  async function handleWishlistToggle() {    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/app/${slug}` } } });
      return;
    }
    setActionError(null);
    try {
      const client = getStoreClient();
      if (isWishlisted) {
        await client.wishlist.removeItem(listingId);
        setIsWishlisted(false);
      } else {
        await client.wishlist.addItem(listingId);
        setIsWishlisted(true);
      }
    } catch (err) {
      setActionError(formatApiError(err instanceof Error ? err : new Error(String(err))));
    }
  }

  const priceLabel = app.pricingModel === 'FREE' || app.pricingModel === 'FREEMIUM' ? '免费' : '付费';
  const installState = resolveListingInstallState({
    pricingModel: app.pricingModel,
    owned,
    installed,
    installing,
  });
  const installLabel =
    installState === 'installing'
      ? '安装中…'
      : installState === 'installed' || installState === 'owned'
        ? '打开'
        : installState === 'paid'
          ? '购买'
          : '获取';

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
            aria-label="返回"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center"
              aria-label="分享"
              onClick={() => {
                if (navigator.share) {
                  void navigator.share({ title: app.name, url: window.location.href });
                }
              }}
            >
              <Share2 className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              type="button"
              onClick={openCollectSheet}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="收录到个人商店"
            >
              <FolderPlus className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              type="button"
              onClick={openCollectSheet}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="收录到个人商店"
            >
              <FolderPlus className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              type="button"
              onClick={() => void handleWishlistToggle()}
              className="flex h-10 w-10 items-center justify-center"
              aria-label={isWishlisted ? '取消收藏' : '收藏'}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? 'fill-[var(--danger)] text-[var(--danger)]' : ''}`}
                style={{ color: isWishlisted ? undefined : 'var(--text-secondary)' }}
              />
            </button>
          </div>
        </div>
      </header>

      {(error || actionError) && (
        <div
          className="mx-4 mt-2 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          {error ? formatApiError(error) : actionError}
        </div>
      )}

      {purchaseNotice ? (
        <div
          className="mx-4 mt-2 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}
          role="status"
        >
          {purchaseNotice}
        </div>
      ) : null}

      <div className="pb-28 pt-2">
        <section className="px-4 py-4">
          <div className="flex gap-4">
            <div
              className="app-icon flex h-20 w-20 flex-shrink-0 items-center justify-center text-3xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
            >
              {app.name[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">{app.name}</h1>
              {app.subtitle ? (
                <p className="text-sm text-[var(--text-secondary)]">{app.subtitle}</p>
              ) : null}
              <p className="text-sm font-medium text-[var(--accent)]">{app.developer}</p>
            </div>
          </div>
        </section>

        <section className="mx-4 mb-4 grid grid-cols-3 gap-2 rounded-xl p-3" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-[var(--star)] text-[var(--star)]" />
              <span className="text-sm font-bold">{app.rating > 0 ? app.rating.toFixed(1) : '—'}</span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">评分</p>
          </div>
          <div className="text-center border-x" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm font-bold text-[var(--accent)]">{priceLabel}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">价格</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-primary)]">{app.category}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">分类</p>
          </div>
        </section>

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="section-title mb-3">截图与预览</h2>
          {isAuthenticated() && (mediaApi.data?.items?.length ?? 0) > 0 ? (
            <div className="scroll-x flex gap-3">
              {(mediaApi.data?.items ?? []).map((item, index) => {
                const media = item as unknown as Record<string, unknown>;
                const url = readString(media, 'mediaUrl', 'media_url', 'url');
                return (
                  <div
                    key={String(media.id ?? index)}
                    className="skeleton h-48 w-28 flex-shrink-0 rounded-xl"
                    style={url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover' } : undefined}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">
              {isAuthenticated() ? '暂无截图' : '登录后查看截图与预览'}
            </p>
          )}
        </section>

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="section-title mb-2">应用介绍</h2>
          <div className={`relative ${!showFullDesc ? 'max-h-24 overflow-hidden' : ''}`}>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{app.description}</p>
            {!showFullDesc ? (
              <div
                className="absolute bottom-0 left-0 right-0 h-10"
                style={{ background: 'linear-gradient(to top, var(--bg-canvas), transparent)' }}
              />
            ) : null}
          </div>
          {app.description.length > 100 ? (
            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-2 text-sm font-medium text-[var(--accent)]"
            >
              {showFullDesc ? '收起' : '展开全部'}
            </button>
          ) : null}
        </section>

        {app.whatsNew ? (
          <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="section-title mb-2">新功能</h2>
            <p className="text-sm text-[var(--text-secondary)]">{app.whatsNew}</p>
          </section>
        ) : null}

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="section-title mb-3">评分与评价</h2>

          {authed && commentsThreadId ? (
            <div className="card p-3 mb-3">
              <div className="flex gap-1" role="radiogroup" aria-label="选择评分">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)}
                    aria-label={`${star} 星`}
                    className="text-2xl leading-none transition-colors"
                    style={{ color: star <= reviewRating ? '#fbbf24' : 'var(--border-subtle)' }}
                  >★</button>
                ))}
              </div>
              <textarea className="mt-2 w-full rounded-xl border p-2 text-sm" rows={3}
                placeholder="分享你的使用体验…" value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
              />
              {reviewError && <p className="mt-1 text-xs text-[var(--danger)]">{reviewError}</p>}
              <button type="button" disabled={reviewSubmitting || !reviewBody.trim()}
                onClick={() => void handleReviewSubmit()}
                className="btn-primary mt-2 w-full text-sm"
              >{reviewSubmitting ? '提交中…' : '提交评价'}</button>
            </div>
          ) : null}

          {!commentsThreadId ? (
            <p className="text-sm text-[var(--text-tertiary)]">该应用尚未绑定评价线程。</p>
          ) : reviewsApi.loading ? (
            <LoadingSpinner size="sm" />
          ) : reviewsApi.error ? (
            <p className="text-sm text-[var(--accent)]">{formatApiError(reviewsApi.error)}</p>
          ) : reviewItems.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)]">暂无用户评价，成为首位评价者吧。</p>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((raw: unknown) => {
                const c = (raw ?? {}) as unknown as Record<string, unknown>;
                const cid = String(c.id ?? '');
                return (
                  <div key={cid} className="card p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {c.createdAt ? new Date(String(c.createdAt)).toLocaleDateString('zh-CN') : ''}
                      </p>
                      {authed && cid ? (
                        <button type="button" onClick={() => void handleReviewLike(cid)}
                          className="text-xs text-[var(--text-tertiary)]"
                        >♡ 点赞</button>
                      ) : null}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{String(c.body ?? '')}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {devOtherApps.length > 0 ? (
          <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="section-title mb-3">开发者的其他应用</h2>
            <div className="space-y-2">
              {devOtherApps.map((dev) => (
                <Link key={dev.id} to={`/app/${dev.id}`} className="card card-press flex items-center gap-3 p-3">
                  <div className="app-icon flex h-12 w-12 flex-shrink-0 items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
                  >{dev.name[0]}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{dev.name}</h3>
                    <p className="truncate text-xs text-[var(--text-tertiary)]">{dev.developer}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {similarApps.length > 0 ? (
          <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="section-title mb-3">相似应用</h2>
            <div className="scroll-x flex gap-3">
              {similarApps.map((sim) => (
                <Link
                  key={sim.id}
                  to={`/app/${sim.id}`}
                  className="card card-press min-w-[120px] flex-shrink-0 p-3 text-center"
                >
                  <div
                    className="app-icon mx-auto mb-2 flex h-14 w-14 items-center justify-center font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
                  >
                    {sim.name[0]}
                  </div>
                  <p className="truncate text-xs font-semibold">{sim.name}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="section-title mb-3">信息</h2>
          <div className="card divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <InfoRow label="开发者" value={app.developer} />
            <InfoRow label="分类" value={app.category} />
            <InfoRow label="版本" value={app.version} />
          </div>
        </section>

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => {
              setReportNotice(null);
              setReportReason('');
              setReportOpen(true);
            }}
            className="card flex w-full items-center gap-3 p-4 text-left"
          >
            <Flag className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">举报应用</h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">通过开发者或平台支持渠道提交</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 text-[var(--text-tertiary)]" />
          </button>
        </section>

        <section className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="card flex gap-3 p-4">
            <Shield className="h-6 w-6 flex-shrink-0 text-[var(--accent)]" />
            <div>
              <h3 className="text-sm font-semibold">隐私与安全</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                查看开发者提供的隐私实践说明。
              </p>
              {app.privacyUrl ? (
                <a href={app.privacyUrl} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                  隐私政策
                  <ChevronRight className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {collectOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          style={{ backgroundColor: 'color-mix(in srgb, black 40%, transparent)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="collect-title"
          onClick={() => setCollectOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl p-4 pb-8"
            style={{ backgroundColor: 'var(--bg-surface)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 id="collect-title" className="text-sm font-semibold text-[var(--text-primary)]">
                收录到我的分类
              </h3>
              <button
                type="button"
                onClick={() => setCollectOpen(false)}
                className="text-xs text-[var(--text-tertiary)]"
              >
                关闭
              </button>
            </div>

            {collectLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : collectCategories.length === 0 ? (
              <div className="py-4 text-center text-sm text-[var(--text-secondary)]">
                还没有分类，
                <Link to="/user-store" className="text-[var(--accent)]" onClick={() => setCollectOpen(false)}>
                  去创建一个
                </Link>
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {collectCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    disabled={collectLoading}
                    onClick={() => void handleCollect(category.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <FolderPlus className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                    <span className="flex-1 text-sm text-[var(--text-primary)]">{category.name}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{category.itemCount} 个应用</span>
                  </button>
                ))}
              </div>
            )}

            {collectNotice ? (
              <p className="mt-3 px-1 text-xs text-[var(--accent)]">{collectNotice}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {collectOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end"
          style={{ backgroundColor: 'color-mix(in srgb, black 40%, transparent)' }}
          role="dialog" aria-modal="true" onClick={() => setCollectOpen(false)}
        >
          <div className="w-full rounded-t-3xl p-4 pb-8"
            style={{ backgroundColor: 'var(--bg-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">收录到我的分类</h3>
              <button type="button" onClick={() => setCollectOpen(false)} className="text-xs text-[var(--text-tertiary)]">关闭</button>
            </div>
            {collectLoading ? (
              <div className="flex justify-center py-6"><LoadingSpinner /></div>
            ) : collectCategories.length === 0 ? (
              <div className="py-4 text-center text-sm text-[var(--text-secondary)]">
                还没有分类，<Link to="/user-store" className="text-[var(--accent)]" onClick={() => setCollectOpen(false)}>去创建一个</Link>
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {collectCategories.map((cat) => (
                  <button key={cat.id} type="button" disabled={collectLoading}
                    onClick={() => void handleCollect(cat.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <FolderPlus className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                    <span className="flex-1 text-sm text-[var(--text-primary)]">{cat.name}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{cat.itemCount} 个应用</span>
                  </button>
                ))}
              </div>
            )}
            {collectNotice && <p className="mt-3 px-1 text-xs text-[var(--accent)]">{collectNotice}</p>}
          </div>
        </div>
      ) : null}

      {reportOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          style={{ backgroundColor: 'color-mix(in srgb, black 40%, transparent)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-2xl)] p-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="report-title" className="text-lg font-bold text-[var(--text-primary)]">
                举报应用
              </h2>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="text-sm font-medium text-[var(--accent)]"
              >
                关闭
              </button>
            </div>
            {reportNotice ? (
              <div className="py-6 text-center">
                <p className="font-semibold text-[var(--text-primary)]">{reportNotice.title}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{reportNotice.message}</p>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="btn-primary mt-6 w-full"
                >
                  知道了
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-[var(--text-secondary)]">选择最符合的问题类型</p>
                <div className="space-y-2">
                  {LISTING_REPORT_REASONS.map((option) => (
                    <label
                      key={option.value}
                      className="card flex cursor-pointer items-start gap-3 p-3"
                      style={
                        reportReason === option.value
                          ? { borderColor: 'var(--accent)' }
                          : undefined
                      }
                    >
                      <input
                        type="radio"
                        name="h5-report-reason"
                        value={option.value}
                        checked={reportReason === option.value}
                        onChange={() => setReportReason(option.value)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-[var(--text-primary)]">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="mt-0.5 block text-xs text-[var(--text-tertiary)]">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!reportReason}
                  onClick={() => {
                    if (!reportReason) return;
                    const outcome = openListingReportChannel({
                      listingId,
                      displayName: app.name,
                      reasonValue: reportReason,
                      reasons: LISTING_REPORT_REASONS,
                      supportUrl: app.supportUrl,
                      platformReportEmail: import.meta.env.VITE_APPSTORE_ABUSE_REPORT_EMAIL,
                    });
                    setReportNotice({ title: outcome.title, message: outcome.message });
                  }}
                  className="btn-primary mt-4 w-full disabled:opacity-50"
                >
                  提交举报
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t p-4"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
          backdropFilter: 'blur(16px)',
          borderColor: 'var(--border-subtle)',
          paddingBottom: 'max(1rem, var(--safe-area-bottom))',
        }}
      >
        <button
          type="button"
          disabled={installing}
          onClick={() => void handleGetOrInstall()}
          className="btn-primary w-full"
        >
          <Download className="h-5 w-5" />
          {installLabel}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

