import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ClipboardList } from 'lucide-react';
import type { DemandHallItem, DemandPublishInput } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '../components/common';
import { CompanyDemandsService } from '../services/api';
import { DemandsPublishButton, DemandsSearchBar } from '../components/demands/DemandsSearchBar';
import { DemandsCategoryFilter } from '../components/demands/DemandsCategoryFilter';
import { DemandCard } from '../components/demands/DemandCard';
import { DemandClaimDialog } from '../components/demands/DemandClaimDialog';
import { DemandClaimNotice } from '../components/demands/DemandClaimNotice';
import { DemandsEmptyState } from '../components/demands/DemandsEmptyState';
import { PublishDemandModal } from '../components/demands/PublishDemandModal';

/**
 * 需求大厅 (demand hall) — the AI Lab demand publishing and claiming page.
 * Mirrors the 应用模板 page layout (toolbar row, category filter, card grid,
 * empty state) per the AI Lab composition standard. Demand data is owned by
 * the company domain and consumed through the pc-core demand hall service
 * port.
 *
 * Selecting a card navigates to its detail page (a shareable, back-navigable
 * read surface), while its 抢单 button opens the quick-claim dialog in place —
 * bidding never costs the reader their list position or filters.
 */
export interface DemandsPageProps {
  /**
   * Controlled catalog text filter. When the surrounding chrome owns the
   * search field (the store header's global search, or an embedding host's
   * toolbar) it passes the query here and the page renders no search row of
   * its own — the publish button rides the category-filter row instead. Left
   * unset, the page renders its own search-and-publish row (single-page
   * embeds without another search field).
   */
  searchQuery?: string;
}

export function DemandsPage({ searchQuery }: DemandsPageProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Controlled when the surrounding chrome owns the search field; otherwise
  // the page renders its own search input and owns the query.
  const [localQuery, setLocalQuery] = useState('');
  const isControlledSearch = searchQuery !== undefined;
  const effectiveQuery = isControlledSearch ? searchQuery : localQuery;
  const [demands, setDemands] = useState<DemandHallItem[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [claimTarget, setClaimTarget] = useState<DemandHallItem | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDemands = useCallback(async () => {
    try {
      const data = await CompanyDemandsService.listDemands({
        q: effectiveQuery.trim() || undefined,
        demandType: selectedType === 'all' ? undefined : selectedType,
      });
      setDemands(data);
      setLoadFailed(false);
    } catch (err) {
      console.error('Failed to load demands', err);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [effectiveQuery, selectedType]);

  useEffect(() => {
    void loadDemands();
  }, [loadDemands]);

  // The success notice clears itself so a completed claim does not leave a
  // stale banner above a freshly filtered list.
  useEffect(() => {
    if (!claimFeedback) return;
    const timer = window.setTimeout(() => setClaimFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [claimFeedback]);

  const handlePublish = async (input: DemandPublishInput) => {
    const published = await CompanyDemandsService.publishDemand(input);
    setDemands((prev) => [published, ...prev]);
  };

  const openDemand = (demand: DemandHallItem) => {
    navigate(`/demands/${encodeURIComponent(demand.id)}`);
  };

  /** Reflect the new bid immediately, then reconcile with the server list. */
  const handleClaimSubmitted = async (claimed: DemandHallItem) => {
    setClaimFeedback(t('demands.claim.success'));
    setDemands((prev) => prev.map((demand) => (
      demand.id === claimed.id ? { ...demand, bidCount: demand.bidCount + 1 } : demand
    )));
    await loadDemands();
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Search-and-publish row: only when no surrounding chrome owns the
          search field. */}
      {!isControlledSearch && (
        <DemandsSearchBar
          searchQuery={localQuery}
          onSearchChange={setLocalQuery}
          onPublishClick={() => setIsPublishModalOpen(true)}
        />
      )}

      {/* Demand Type Filter with the publish action at the row's end under the
          controlled layout. */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <DemandsCategoryFilter selectedType={selectedType} onSelectType={setSelectedType} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/demands/my-claims"
            className="inline-flex items-center gap-1.5 rounded-store-control border border-store-line bg-store-surface px-4 py-2 text-xs font-medium text-store-ink-soft hover:border-store-brand/50 hover:text-store-brand transition-colors"
            data-my-claims-entry
          >
            <ClipboardList className="w-4 h-4" />
            {t('demands.myClaims.entry')}
          </Link>
          {isControlledSearch && (
            <DemandsPublishButton onClick={() => setIsPublishModalOpen(true)} />
          )}
        </div>
      </div>

      {claimFeedback ? (
        <DemandClaimNotice message={claimFeedback} onDismiss={() => setClaimFeedback(null)} />
      ) : null}

      {loadFailed ? (
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-store-card border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-500"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="min-w-0 flex-1">{t('demands.loadFailed')}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadDemands();
            }}
            className="shrink-0 rounded-store-control border border-red-500/30 px-3 py-1.5 font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            {t('common.actions.retry')}
          </button>
        </div>
      ) : null}

      {/* Demand Grid — mirrors the 应用模板 card grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('demands.loading')}</div>
      ) : (
        <CardGrid>
          {demands.map((demand) => (
            <DemandCard
              key={demand.id}
              demand={demand}
              onSelect={openDemand}
              onClaim={setClaimTarget}
            />
          ))}
        </CardGrid>
      )}

      {demands.length === 0 && !loading && !loadFailed && <DemandsEmptyState />}

      <DemandClaimDialog
        demand={claimTarget}
        onClose={() => setClaimTarget(null)}
        onSubmitted={handleClaimSubmitted}
      />

      <PublishDemandModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
      />
    </div>
  );
}

export default DemandsPage;
