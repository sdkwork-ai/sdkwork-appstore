import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, Cpu, FlaskConical, MessageSquarePlus, Send, Check, Star, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppSpec, AppSpecKind, Review, SpecRatingSummary } from '../../types';
import { AppStoreService } from '../../services/api';
import { CuratedEvalSpec, rankEvalSpecs, summarizeSpecReviews } from '@sdkwork/appstore-pc-commons';
import { StarRatingInput } from './StarRatingInput';
import { ReviewCard } from './ReviewCard';

type SpecKindFilter = 'all' | AppSpecKind;

interface AppSpecEvaluationProps {
  appId: string;
  appName: string;
  specs: AppSpec[];
  /**
   * Heading keys for the vertical evaluation modules; defaults keep the AI
   * 模型测评 copy so existing call sites stay unchanged.
   */
  titleKey?: string;
  subtitleKey?: string;
}

/** Average rating shown on a spec chip before its reviews are loaded. */
function SummaryStars({ summary, className = '' }: { summary: SpecRatingSummary; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] ${className}`}>
      <Star className="w-2.5 h-2.5 text-store-warning fill-yellow-400" />
      <span className={summary.rating > 0 ? 'font-bold text-store-warning' : 'text-store-ink-faint'}>
        {summary.rating > 0 ? summary.rating.toFixed(1) : '--'}
      </span>
      {summary.reviewsCount > 0 && <span className="text-store-ink-faint">({summary.reviewsCount})</span>}
    </span>
  );
}

/** Arena-style leaderboard medal tone for the top three ranks. */
function rankTone(rank: number): string {
  if (rank === 1) return 'bg-amber-400/20 text-amber-600 border-amber-400/40';
  if (rank === 2) return 'bg-slate-300/30 text-slate-600 border-slate-300/50';
  if (rank === 3) return 'bg-orange-400/15 text-orange-600 border-orange-400/30';
  return 'bg-store-raised text-store-ink-faint border-store-line';
}

/**
 * Benchmark accepted from both curated sets: the legacy AI 模型测评 dimension
 * labels live in `name` (display text), the vertical modules' labels in `id`
 * (i18n keys). Rendered identically once the label is resolved through `t`.
 */
interface PanelBenchmark {
  score: number;
  sampleSize?: number;
  sampleUnit?: string;
  dimensions: readonly { name?: string; id?: string; score: number }[];
}

/** Curated benchmark block: composite score, sample size and dimension bars. */
function BenchmarkPanel({ benchmark }: { benchmark: PanelBenchmark }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 rounded-store-card bg-violet-500/5 border border-violet-500/20 space-y-3 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-violet-500">
          {t('appDetail.specEval.benchmarkLabel')}
        </span>
        {benchmark.sampleSize != null && (
          <span className="text-[10px] text-store-ink-faint">
            {t('appDetail.specEval.sampleSize', {
              count: benchmark.sampleSize.toLocaleString(),
              unit: t(`appDetail.specEval.sampleUnit.${benchmark.sampleUnit ?? 'questions'}`),
            })}
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold text-violet-600 leading-none">
        {benchmark.score.toFixed(1)}
      </div>
      <div className="space-y-1.5">
        {benchmark.dimensions.map((dim) => {
          const labelKey = dim.name ?? dim.id ?? '';
          return (
            <div key={dim.name ?? dim.id ?? labelKey} className="flex items-center gap-2">
              {/* Legacy names are display text and pass through unchanged;
                vertical ids resolve through their module namespace. */}
              <span className="w-16 shrink-0 text-[10px] text-store-ink-faint truncate">
                {t(labelKey, { defaultValue: labelKey })}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-store-raised overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-[10px] font-bold text-store-ink-soft">{dim.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SpecReviewForm: React.FC<{
  appId: string;
  spec: AppSpec;
  onReviewSubmitted: (review: Review) => void;
  onClose: () => void;
}> = ({ appId, spec, onReviewSubmitted, onClose }) => {
  const { t } = useTranslation();
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newReview = await AppStoreService.submitSpecReview({
        appId,
        specId: spec.id,
        user: userName.trim() || t('appDetail.reviews.defaultUser'),
        rating: userRating,
        title: t('appDetail.specEval.defaultTitle', { name: spec.name }),
        comment: comment.trim(),
      });
      onReviewSubmitted(newReview);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('提交规格评价失败', err);
      // Anonymous sessions 401 on the comments endpoint; point the user at
      // sign-in instead of a bare failure.
      const raw = err instanceof Error ? err.message : '';
      setSubmitError(
        /401|unauthorized|auth/i.test(raw)
          ? t('appDetail.reviews.loginRequired')
          : raw || t('appDetail.reviews.submitFailed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-5 bg-store-subtle rounded-store-card border border-violet-500/20 space-y-4 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-store-ink">
          {t('appDetail.specEval.formTitle', { name: spec.name })}
        </h4>
        <StarRatingInput value={userRating} onChange={setUserRating} />
      </div>

      <input
        type="text"
        placeholder={t('appDetail.reviews.namePlaceholder')}
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full px-3 text-sm rounded-store-control border border-store-line bg-store-field text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
      />

      <textarea
        rows={3}
        required
        placeholder={t('appDetail.specEval.commentPlaceholder', { name: spec.name })}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full px-3 py-2.5 text-sm rounded-store-control border border-store-line bg-store-field text-store-ink focus:outline-none focus:border-store-brand placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
      />

      {submitError && (
        <p className="text-xs text-store-danger">{submitError}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-store-control text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          {submitSuccess ? (
            <>
              <Check className="w-4 h-4 text-store-success" />
              <span>{t('appDetail.reviews.submitSuccess')}</span>
            </>
          ) : isSubmitting ? (
            <span>{t('appDetail.reviews.submitting')}</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{t('appDetail.specEval.submitBtn')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/**
 * Multi-spec evaluation panel of an AI 模型测评 app, presented as an arena
 * leaderboard: specs are ranked by the curated benchmark baseline, and each
 * spec pairs that official score with live user ratings and comment threads
 * backed by sdkwork-comments.
 */
export const AppSpecEvaluation: React.FC<AppSpecEvaluationProps> = ({ appId, appName, specs, titleKey, subtitleKey }) => {
  const { t } = useTranslation();
  const [kindFilter, setKindFilter] = useState<SpecKindFilter>('all');
  const [activeSpecId, setActiveSpecId] = useState(specs[0]?.id ?? '');
  const [reviewsBySpec, setReviewsBySpec] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setActiveSpecId(specs[0]?.id ?? '');
  }, [specs]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // One bounded thread fetch per spec; the per-spec summaries feed the
    // selector chips and the active panel at once.
    Promise.all(
      specs.map((spec) =>
        AppStoreService.getSpecReviews(appId, spec.id).catch((err) => {
          console.error(`Failed to load reviews for spec ${spec.id}`, err);
          return [] as Review[];
        }),
      ),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, Review[]> = {};
      specs.forEach((spec, index) => {
        next[spec.id] = results[index];
      });
      setReviewsBySpec(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [appId, specs]);

  // Leaderboard order: curated benchmark score first, unrated specs last.
  const rankedSpecs = useMemo(() => rankEvalSpecs(specs), [specs]);
  const rankById = useMemo(() => {
    const next = new Map<string, number>();
    rankedSpecs.forEach((spec, index) => next.set(spec.id, index + 1));
    return next;
  }, [rankedSpecs]);

  const activeSpec = useMemo(
    () => (specs.find((spec) => spec.id === activeSpecId) ?? specs[0]) as CuratedEvalSpec | undefined,
    [specs, activeSpecId],
  );

  const visibleSpecs = useMemo(
    () => (kindFilter === 'all' ? rankedSpecs : rankedSpecs.filter((spec) => spec.kind === kindFilter)),
    [rankedSpecs, kindFilter],
  );

  const summaryFor = useCallback(
    (specId: string): SpecRatingSummary => summarizeSpecReviews(reviewsBySpec[specId] ?? []),
    [reviewsBySpec],
  );

  const handleReviewSubmitted = (review: Review) => {
    setReviewsBySpec((prev) => ({
      ...prev,
      [review.specId ?? activeSpec?.id ?? '']: [review, ...(prev[review.specId ?? activeSpec?.id ?? ''] ?? [])],
    }));
  };

  const activeReviews = reviewsBySpec[activeSpec?.id ?? ''] ?? [];
  const activeSummary = summaryFor(activeSpec?.id ?? '');
  const activeBenchmark = activeSpec?.benchmark;
  const modelCount = specs.filter((spec) => spec.kind === 'model').length;
  const agentCount = specs.filter((spec) => spec.kind === 'agent').length;

  return (
    <div className="flex-1 flex flex-col mb-10 pt-8 border-t border-store-line-soft">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-xl md:text-2xl font-extrabold text-store-ink flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-violet-500" />
          {t(titleKey ?? 'appDetail.specEval.title')}
        </h3>
      </div>
      <p className="text-xs text-store-ink-faint mb-5">
        {t(subtitleKey ?? 'appDetail.specEval.subtitle', {
          name: appName,
          model: modelCount,
          agent: agentCount,
        })}
      </p>

      {/* Kind filter */}
      <div className="flex items-center gap-1.5 mb-3">
        {(['all', 'model', 'agent'] as SpecKindFilter[]).map((kind) => (
          <button
            key={kind}
            onClick={() => setKindFilter(kind)}
            className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all border cursor-pointer ${
              kindFilter === kind
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-violet-500/40'
            }`}
          >
            {t(`appDetail.specEval.kind.${kind}`)}
          </button>
        ))}
      </div>

      {/* Leaderboard spec selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleSpecs.map((spec) => {
          const curated = spec as CuratedEvalSpec;
          const isModel = spec.kind === 'model';
          const Icon = isModel ? Cpu : Bot;
          const active = spec.id === activeSpec?.id;
          const rank = rankById.get(spec.id) ?? 0;
          return (
            <button
              key={spec.id}
              onClick={() => {
                setActiveSpecId(spec.id);
                setShowReviewForm(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-store-control text-xs font-medium border transition-all cursor-pointer ${
                active
                  ? 'bg-violet-600/10 text-violet-600 border-violet-500/40 shadow-sm'
                  : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-violet-500/40'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${rankTone(rank)}`}>
                #{rank}
              </span>
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-violet-600' : 'text-store-ink-faint'}`} />
              <span>{spec.name}</span>
              {curated.benchmark && (
                <span className="text-[10px] font-bold text-violet-500">{curated.benchmark.score.toFixed(1)}</span>
              )}
              <SummaryStars summary={summaryFor(spec.id)} />
            </button>
          );
        })}
      </div>

      {/* Active spec panel */}
      {activeSpec && (
        <div className="p-5 rounded-store-card bg-store-subtle/60 border border-store-line space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${rankTone(rankById.get(activeSpec.id) ?? 0)}`}>
                  #{rankById.get(activeSpec.id)} {t('appDetail.specEval.rankSuffix')}
                </span>
                <h4 className="text-base font-bold text-store-ink truncate">{activeSpec.name}</h4>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">
                  {t(activeSpec.kind === 'model' ? 'appDetail.specEval.kind.model' : 'appDetail.specEval.kind.agent')}
                </span>
              </div>
              {activeSpec.publisher && (
                <p className="text-xs text-store-ink-faint mt-0.5">{activeSpec.publisher}</p>
              )}
              {activeSpec.summary && (
                <p className="text-xs text-store-ink-soft mt-1">{activeSpec.summary}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-3xl font-extrabold text-store-ink">
                {activeSummary.rating > 0 ? activeSummary.rating.toFixed(1) : '--'}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(activeSummary.rating)
                          ? 'text-store-warning fill-yellow-400'
                          : 'text-store-ink-faint'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-store-ink-faint mt-0.5">
                  {t('appDetail.specEval.userRatingLabel', { count: activeSummary.reviewsCount })}
                </p>
              </div>
            </div>
          </div>

          {/* Dual signal: curated baseline + live user rating */}
          {activeBenchmark && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BenchmarkPanel benchmark={activeBenchmark} />
              <div className="p-4 rounded-store-card bg-store-warning/5 border border-store-warning/20 space-y-3 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-store-warning">
                  {t('appDetail.specEval.communityLabel')}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-store-ink leading-none">
                    {activeSummary.rating > 0 ? activeSummary.rating.toFixed(1) : '--'}
                  </span>
                  <span className="text-xs text-store-ink-faint pb-0.5">/ 5.0</span>
                </div>
                <p className="text-[11px] text-store-ink-soft leading-relaxed">
                  {t('appDetail.specEval.communityDesc', { count: activeSummary.reviewsCount, name: activeSpec.name })}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-store-ink-faint">
                  <Trophy className="w-3 h-3" />
                  <span>{t('appDetail.specEval.communityHint')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-store-ink">
              {t('appDetail.specEval.reviewsTitle', { name: activeSpec.name })}
            </h5>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-store-control bg-violet-500/10 border border-violet-500/20 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showReviewForm ? t('appDetail.reviews.cancelReview') : t('appDetail.specEval.writeReview')}</span>
            </button>
          </div>

          {showReviewForm && (
            <SpecReviewForm
              appId={appId}
              spec={activeSpec}
              onReviewSubmitted={handleReviewSubmitted}
              onClose={() => setShowReviewForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading && (
              <div className="col-span-1 md:col-span-2 text-center text-store-ink-faint py-6">
                {t('appDetail.specEval.loading')}
              </div>
            )}
            {!loading && activeReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {!loading && activeReviews.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center text-store-ink-faint py-6">
                {t('appDetail.specEval.noReviews', { name: activeSpec.name })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
