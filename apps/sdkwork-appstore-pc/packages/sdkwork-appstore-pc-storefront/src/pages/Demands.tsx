import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { DemandClaimInput, DemandHallItem, DemandPublishInput } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '../components/common';
import { CompanyDemandsService } from '../services/api';
import { DemandsHeaderBanner } from '../components/demands/DemandsHeaderBanner';
import { DemandsSearchBar } from '../components/demands/DemandsSearchBar';
import { DemandsCategoryFilter } from '../components/demands/DemandsCategoryFilter';
import { DemandCard } from '../components/demands/DemandCard';
import { DemandsEmptyState } from '../components/demands/DemandsEmptyState';
import { PublishDemandModal } from '../components/demands/PublishDemandModal';
import { DemandDetailModal } from '../components/demands/DemandDetailModal';

/**
 * 需求大厅 (demand hall) — the AI Lab demand publishing and claiming page.
 * Mirrors the 应用模板 page layout (header banner, search bar, category
 * filter, card grid, empty state) per the AI Lab composition standard.
 * Demand data is owned by the company domain and consumed through the
 * pc-core demand hall service port.
 */
export function DemandsPage() {
  const { t } = useTranslation();
  const [demands, setDemands] = useState<DemandHallItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [detailDemandId, setDetailDemandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDemands = useCallback(async () => {
    try {
      const data = await CompanyDemandsService.listDemands({
        q: searchQuery.trim() || undefined,
        demandType: selectedType === 'all' ? undefined : selectedType,
      });
      setDemands(data);
    } catch (err) {
      console.error('Failed to load demands', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

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
      {/* Header Banner Subcomponent */}
      <DemandsHeaderBanner />

      {/* Filter and Publish Bar Subcomponent */}
      <DemandsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPublishClick={() => setIsPublishModalOpen(true)}
      />

      {/* Demand Type Filter Subcomponent */}
      <DemandsCategoryFilter selectedType={selectedType} onSelectType={setSelectedType} />

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
      />
    </div>
  );
}

export default DemandsPage;
