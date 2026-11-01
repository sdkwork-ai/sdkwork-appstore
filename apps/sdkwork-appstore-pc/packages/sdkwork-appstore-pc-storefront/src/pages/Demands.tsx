import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { DemandClaimInput, DemandHallItem, DemandPublishInput } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '../components/common';
import { CompanyDemandsService } from '../services/api';
import { DemandsPublishButton, DemandsSearchBar } from '../components/demands/DemandsSearchBar';
import { DemandsCategoryFilter } from '../components/demands/DemandsCategoryFilter';
import { DemandCard } from '../components/demands/DemandCard';
import { DemandsEmptyState } from '../components/demands/DemandsEmptyState';
import { PublishDemandModal } from '../components/demands/PublishDemandModal';
import { DemandDetailModal } from '../components/demands/DemandDetailModal';

/**
 * 需求大厅 (demand hall) — the AI Lab demand publishing and claiming page.
 * Mirrors the 应用模板 page layout (toolbar row, category filter, card grid,
 * empty state) per the AI Lab composition standard. Demand data is owned by
 * the company domain and consumed through the pc-core demand hall service
 * port.
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
  /**
   * Host-provided "create project and start" action. Embedding hosts such as
   * the BirdCoder demand hall supply it; the standalone storefront omits it.
   */
  onStartProject?: (demand: DemandHallItem) => void;
}

export function DemandsPage({ searchQuery, onStartProject }: DemandsPageProps = {}) {
  const { t } = useTranslation();
  // Controlled when the surrounding chrome owns the search field; otherwise
  // the page renders its own search input and owns the query.
  const [localQuery, setLocalQuery] = useState('');
  const isControlledSearch = searchQuery !== undefined;
  const effectiveQuery = isControlledSearch ? searchQuery : localQuery;
  const [demands, setDemands] = useState<DemandHallItem[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [detailDemandId, setDetailDemandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDemands = useCallback(async () => {
    try {
      const data = await CompanyDemandsService.listDemands({
        q: effectiveQuery.trim() || undefined,
        demandType: selectedType === 'all' ? undefined : selectedType,
      });
      setDemands(data);
    } catch (err) {
      console.error('Failed to load demands', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveQuery, selectedType]);

  useEffect(() => {
    void loadDemands();
  }, [loadDemands]);

  const handlePublish = async (input: DemandPublishInput) => {
    const published = await CompanyDemandsService.publishDemand(input);
    setDemands((prev) => [published, ...prev]);
  };

  const handleClaim = async (demandId: string, input: DemandClaimInput) => {
    await CompanyDemandsService.claimDemand(demandId, input);
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
        {isControlledSearch && (
          <DemandsPublishButton onClick={() => setIsPublishModalOpen(true)} />
        )}
      </div>

      {/* Demand Grid — mirrors the 应用模板 card grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('demands.loading')}</div>
      ) : (
        <CardGrid>
          {demands.map((demand) => (
            <DemandCard
              key={demand.id}
              demand={demand}
              onSelect={(item) => setDetailDemandId(item.id)}
              onClaim={(item) => setDetailDemandId(item.id)}
            />
          ))}
        </CardGrid>
      )}

      {demands.length === 0 && !loading && <DemandsEmptyState />}

      {/* Modals */}
      <PublishDemandModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
      />
      <DemandDetailModal
        demandId={detailDemandId}
        onClose={() => setDetailDemandId(null)}
        onClaim={handleClaim}
        {...(onStartProject === undefined ? {} : { onStartProject })}
      />
    </div>
  );
}

export default DemandsPage;
