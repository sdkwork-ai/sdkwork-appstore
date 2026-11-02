import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveTemplateAppType } from '@sdkwork/appstore-pc-core';
import { Clock3, Layers } from 'lucide-react';
import { TemplateItem, AppItem } from '../types';
import { TemplatesService, AppStoreService } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TemplateOverviewTab } from '../components/templates/TemplateOverviewTab';
import { TemplateScreenshotsTab } from '../components/templates/TemplateScreenshotsTab';
import { TemplateTechStackTab } from '../components/templates/TemplateTechStackTab';
import { TemplateCliTab } from '../components/templates/TemplateCliTab';
import { TemplateDemoTab } from '../components/templates/TemplateDemoTab';
import { TemplateDetailHeaderCard } from '../components/templates/TemplateDetailHeaderCard';
import { TemplateDetailMetricsBar } from '../components/templates/TemplateDetailMetricsBar';
import { TemplateDetailNavTabs, TemplateTabType } from '../components/templates/TemplateDetailNavTabs';
import { TemplateDetailAssociatedApp } from '../components/templates/TemplateDetailAssociatedApp';
import { TemplateSuggestionRail } from '../components/templates/TemplateSuggestionRail';
import { TemplateScanDialog } from '../components/templates/TemplateScanDialog';
import { resolveTemplateScanTarget } from '../lib/templateScan';

/** Detail-page discovery rails, as returned by the catalog service. */
interface TemplateSuggestionState {
  latest: TemplateItem[];
  related: TemplateItem[];
  recommended: TemplateItem[];
}

const EMPTY_SUGGESTIONS: TemplateSuggestionState = { latest: [], related: [], recommended: [] };

/**
 * Find the element that actually scrolls this page. The storefront owns no
 * page-level scroller: the standalone shell scrolls `#main-scroll-area` and an
 * embedding host scrolls its own column (the template library's
 * `.catalogScroll`), so the container is always an ancestor, never the window.
 * @param start - the detail page's own root element.
 * @returns the nearest scrollable ancestor, or null when the page is not inside one.
 */
function findScrollOwner(start: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = start.parentElement;
  while (node !== null) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * 模板详情页 — the routed detail page for one template.
 *
 * Opening a template from the library navigates here instead of raising a
 * dialog, matching how the rest of the App Store reads a listing: the detail
 * URL is shareable, the browser back button returns to the library, and the
 * right column keeps discovery inside the page (最新模板 / 相关模板 / 推荐模板,
 * served by the catalog service in one request).
 */
export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [template, setTemplate] = useState<TemplateItem | null>(null);
  const [relatedApp, setRelatedApp] = useState<AppItem | null>(null);
  const [suggestions, setSuggestions] = useState<TemplateSuggestionState>(EMPTY_SUGGESTIONS);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [starred, setStarred] = useState(false);
  const [starring, setStarring] = useState(false);
  const [starsCount, setStarsCount] = useState(0);
  const [forksCount, setForksCount] = useState(0);
  const [copiedCli, setCopiedCli] = useState(false);
  const [forking, setForking] = useState(false);
  const [forkedSuccess, setForkedSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<TemplateTabType>('overview');
  const [scanOpen, setScanOpen] = useState(false);

  // Feedback timers belong to this page instance: clear them on unmount so a
  // navigation away never leaves a pending state update behind.
  const feedbackTimers = useRef<number[]>([]);
  const scheduleFeedbackReset = useCallback((reset: () => void, delay: number) => {
    const timer = window.setTimeout(reset, delay);
    feedbackTimers.current.push(timer);
  }, []);
  useEffect(() => {
    const timers = feedbackTimers;
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    };
  }, []);

  const closeScan = useCallback(() => { setScanOpen(false) }, []);

  // A detail page always opens at its top, no matter where the catalog was
  // scrolled to when the card was selected.
  useEffect(() => {
    if (loading) return;
    const root = pageRef.current;
    const owner = root === null ? null : findScrollOwner(root);
    if (owner !== null) {
      owner.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [id, loading]);

  /** Load the template and the discovery rails in one round trip set. */
  const loadDetail = useCallback(async (templateId: string, cancelled: () => boolean) => {
    const [detail, rails] = await Promise.all([
      TemplatesService.getTemplateById(templateId),
      // A rail outage must not take the detail page down with it.
      TemplatesService.listTemplateSuggestions(templateId).catch(() => null),
    ]);
    if (cancelled()) return;
    setTemplate(detail);
    setSuggestions(rails ?? EMPTY_SUGGESTIONS);
    if (detail) {
      setStarsCount(detail.stars);
      setForksCount(detail.forks);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSuggestionsLoading(true);
    setError(null);
    setTemplate(null);
    setRelatedApp(null);
    setSuggestions(EMPTY_SUGGESTIONS);
    setActiveTab('overview');
    setScanOpen(false);
    // Per-template action feedback must not leak from the previous template.
    setStarred(false);
    setStarring(false);
    setStarsCount(0);
    setForksCount(0);
    setCopiedCli(false);
    setForking(false);
    setForkedSuccess(false);
    loadDetail(id, () => cancelled)
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setSuggestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, loadDetail]);

  // The associated app is a secondary block: its absence (or an app the
  // current viewer cannot read) leaves the section hidden instead of failing
  // the page.
  useEffect(() => {
    const appId = template?.relatedAppId;
    if (!appId) return;
    let cancelled = false;
    AppStoreService.getAppById(appId)
      .then((app) => {
        if (!cancelled) setRelatedApp(app ?? null);
      })
      .catch(() => {
        if (!cancelled) setRelatedApp(null);
      });
    return () => {
      cancelled = true;
    };
  }, [template]);

  const handleStar = async () => {
    if (!template || starring) return;
    setStarring(true);
    try {
      const res = await TemplatesService.starTemplate(template.id);
      setStarsCount(res.stars);
      setStarred(res.isStarred);
    } catch (e) {
      console.error(e);
    } finally {
      setStarring(false);
    }
  };

  const handleFork = async () => {
    if (!template || forking) return;
    setForking(true);
    try {
      const res = await TemplatesService.forkTemplate(template.id);
      setForksCount(res.forks);
      setForkedSuccess(true);
      scheduleFeedbackReset(() => { setForkedSuccess(false) }, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setForking(false);
    }
  };

  const handleCopyCli = async () => {
    if (!template) return;
    try {
      // Prefer the server-owned template code; fall back to the listing id.
      const cmd = await TemplatesService.getTemplateCliCommand(template.id).catch(
        () => `npx create-sdkwork-app my-app --template ${template.id}`,
      );
      await navigator.clipboard.writeText(cmd);
      setCopiedCli(true);
      scheduleFeedbackReset(() => { setCopiedCli(false) }, 2000);
    } catch (e) {
      // Clipboard access can be denied (insecure context, browser policy);
      // report it instead of claiming a copy that never happened.
      console.error(e);
    }
  };

  // The template's application type drives both the header badge and whether a
  // phone QR is the right way to experience it. The scan target prefers the
  // author's live demo and falls back to the related app's mobile entry.
  const appType = resolveTemplateAppType(template?.platform);
  const scanTarget =
    template !== null && appType?.scannable === true
      ? resolveTemplateScanTarget(template, appType, relatedApp)
      : undefined;

  if (loading) {
    return (
      <div ref={pageRef} className="flex-1 p-6 md:p-8 w-full max-w-full" data-template-detail={id}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div
        ref={pageRef}
        className="flex-1 p-6 md:p-8 w-full max-w-full flex flex-col items-center justify-center min-h-[50vh] gap-3"
        data-template-detail={id}
        data-template-detail-state="not-found"
      >
        <Layers className="w-12 h-12 text-store-ink-faint/50" />
        <h2 className="text-lg font-bold text-store-ink">{t('templates.detail.notFoundTitle')}</h2>
        <p className="text-xs text-store-ink-faint max-w-md text-center">
          {error ?? t('templates.detail.notFoundHint')}
        </p>
        <Link
          to="/templates"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-store-control bg-store-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t('templates.detail.backToLibrary')}
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="flex-1 p-4 md:p-8 w-full max-w-full space-y-4 animate-fade-in"
      data-template-detail={template.id}
    >
      {/* Breadcrumb: the library owns the list route, so the detail page always
          offers one step back to it (the embedded surface redirects /templates
          to its list route). */}
      <nav className="flex items-center gap-2 text-xs text-store-ink-faint min-w-0">
        <Link to="/templates" className="hover:text-store-brand transition-colors shrink-0">
          {t('templates.detail.backToLibrary')}
        </Link>
        <span className="shrink-0">/</span>
        <span className="truncate text-store-ink-soft">{template.category}</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <main className="min-w-0 space-y-4">
          <TemplateDetailHeaderCard
            template={template}
            relatedApp={relatedApp}
            starsCount={starsCount}
            forksCount={forksCount}
            starred={starred}
            forking={forking}
            forkedSuccess={forkedSuccess}
            copiedCli={copiedCli}
            starring={starring}
            appType={appType}
            onFork={handleFork}
            onStar={handleStar}
            onCopyCli={handleCopyCli}
            {...(scanTarget === undefined ? {} : { onScan: () => { setScanOpen(true) } })}
          />

          <TemplateDetailMetricsBar
            license={template.license}
            starsCount={starsCount}
            forksCount={forksCount}
          />

          <TemplateDetailNavTabs
            activeTab={activeTab}
            screenshotsCount={template.screenshots?.length || 3}
            onTabChange={setActiveTab}
          />

          <div className="bg-store-surface rounded-store-card p-6 md:p-8 border border-store-line/80 dark:border-store-line shadow-sm min-h-[380px]">
            {activeTab === 'overview' && <TemplateOverviewTab template={template} />}
            {activeTab === 'screenshots' && (
              <TemplateScreenshotsTab screenshots={template.screenshots} title={template.title} />
            )}
            {activeTab === 'techstack' && <TemplateTechStackTab template={template} />}
            {activeTab === 'cli' && <TemplateCliTab templateId={template.id} title={template.title} />}
            {activeTab === 'demo' && <TemplateDemoTab template={template} />}
          </div>

          {relatedApp ? <TemplateDetailAssociatedApp relatedApp={relatedApp} /> : null}

          <div className="xl:hidden space-y-4" data-template-detail-rails-inline>
            <TemplateSuggestionRail
              kind="latest"
              templates={suggestions.latest}
              loading={suggestionsLoading}
            />
            <TemplateSuggestionRail
              kind="related"
              templates={suggestions.related}
              loading={suggestionsLoading}
            />
            <TemplateSuggestionRail
              kind="recommended"
              templates={suggestions.recommended}
              loading={suggestionsLoading}
            />
          </div>
        </main>

        <aside
          className="hidden xl:flex xl:flex-col gap-4 xl:sticky xl:top-4"
          data-template-detail-rails
        >
          <TemplateSuggestionRail
            kind="latest"
            templates={suggestions.latest}
            loading={suggestionsLoading}
          />
          <TemplateSuggestionRail
            kind="related"
            templates={suggestions.related}
            loading={suggestionsLoading}
          />
          <TemplateSuggestionRail
            kind="recommended"
            templates={suggestions.recommended}
            loading={suggestionsLoading}
          />
        </aside>
      </div>

      {/* The library shortcut stays reachable at the end of the page for narrow
          viewports, where the rails stack under the content. */}
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => navigate('/templates')}
          className="w-full py-2.5 rounded-store-control border border-store-line text-xs font-medium text-store-ink-soft hover:border-store-brand/50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <Clock3 className="w-3.5 h-3.5" />
          {t('templates.detail.backToLibrary')}
        </button>
      </div>

      {scanOpen && scanTarget !== undefined ? (
        <TemplateScanDialog template={template} target={scanTarget} onClose={closeScan} />
      ) : null}
    </div>
  );
}

export default TemplateDetailPage;
