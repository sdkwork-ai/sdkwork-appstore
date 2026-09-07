import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIHubService, AppStoreService } from '@sdkwork/appstore-pc-core';
import { AppItem, ExpertItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner } from '@sdkwork/appstore-pc-commons';
import { AIHubHeaderBanner } from './components/AIHubHeaderBanner';
import { AIExpertsHeader } from './components/AIExpertsHeader';
import { FeaturedScenariosSection } from './components/FeaturedScenariosSection';
import { AIExpertsRoster } from './components/AIExpertsRoster';
import { ExpertDetailModal } from './components/ExpertDetailModal';
import { AISandboxAssistant } from './components/AISandboxAssistant';
import { AIAppsGrid } from './components/AIAppsGrid';
import { CreateCustomExpertModal } from './components/CreateCustomExpertModal';
import { AIHubTabNav, AIHubTabType } from './components/AIHubTabNav';
import { AISandboxContextBanner } from './components/AISandboxContextBanner';
import { expertItems } from './data/expertsData';

export default function AIHubPage() {
  const { t } = useTranslation();
  const [aiApps, setAiApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'experts' | 'sandbox' | 'apps'
  const [activeTab, setActiveTab] = useState<AIHubTabType>('experts');

  // Experts State
  const [expertsList, setExpertsList] = useState<ExpertItem[]>(expertItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [myExpertIds, setMyExpertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_hub_my_experts');
      return saved ? JSON.parse(saved) : ['exp-senior-dev', 'exp-wechat-miniapp', 'exp-info-express'];
    } catch (e) {
      return ['exp-senior-dev', 'exp-wechat-miniapp', 'exp-info-express'];
    }
  });

  // Modal State
  const [selectedExpert, setSelectedExpert] = useState<ExpertItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Active Prompt for Sandbox
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [activeExpertName, setActiveExpertName] = useState<string>('');

  useEffect(() => {
    async function loadAIHub() {
      try {
        // Prefer the catalog-runtime AI category feed; fall back to a
        // client-side keyword filter when the category feed is empty.
        const categoryApps = await AIHubService.getAIApps().catch(() => []);
        if (categoryApps.length > 0) {
          setAiApps(categoryApps);
          return;
        }
        const all = await AppStoreService.getAllApps();
        const filtered = all.filter(a =>
          a.category === 'AI' ||
          a.category === 'AI 智能' ||
          a.id.includes('qwen') ||
          a.id.includes('ima') ||
          a.name.includes('AI') ||
          a.description.includes('AI')
        );
        setAiApps(filtered.length > 0 ? filtered : all.slice(0, 6));
      } catch (err) {
        console.error('Failed to load AI Hub page data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAIHub();
  }, []);

  const handleToggleMyExpert = (expertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMyExpertIds(prev => {
      const next = prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId];
      try {
        localStorage.setItem('ai_hub_my_experts', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save my experts', err);
      }
      return next;
    });
  };

  const handleOpenExpertDetail = (expert: ExpertItem) => {
    setSelectedExpert(expert);
    setIsDetailModalOpen(true);
  };

  const handleOpenSandboxChat = (expert: ExpertItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveExpertName(expert.name);
    const prefill = `${t('aihub.sandbox.prefillSystemInstruction', {
      name: expert.name,
      nickname: expert.nickname,
    })}\n${expert.systemPrompt || expert.description}\n\n${t('aihub.sandbox.prefillNeeds')}`;
    setSandboxPrompt(prefill);
    setActiveTab('sandbox');
  };

  const handleTestInSandboxFromModal = (expert: ExpertItem, userMessage?: string) => {
    setActiveExpertName(expert.name);
    const msg = userMessage && userMessage.trim() ? userMessage : t('aihub.sandbox.defaultCollaborateMsg');
    const prefill = `${t('aihub.sandbox.prefillSystemInstruction', {
      name: expert.name,
      nickname: expert.nickname,
    })}\n${expert.systemPrompt || expert.description}\n\n${t('aihub.sandbox.prefillUserQuestion')}\n${msg}`;
    setSandboxPrompt(prefill);
    setActiveTab('sandbox');
  };

  const handleCreateCustomExpert = (data: {
    name: string;
    nickname: string;
    category: string;
    description: string;
    systemPrompt: string;
    tags: string[];
  }) => {
    const newExp: ExpertItem = {
      id: `custom-exp-${Date.now()}`,
      name: data.name,
      nickname: data.nickname,
      avatarBg: 'bg-purple-600',
      avatarIcon: 'Bot',
      scenarioCategory: data.category,
      filterTag: 'OPC:一人公司',
      description: data.description,
      systemPrompt: data.systemPrompt || t('aihub.experts.customModal.defaultSystemPrompt', { name: data.name }),
      tags: data.tags,
      popularity: 1000,
      rating: 5.0,
      isOfficial: false,
      badge: t('aihub.experts.customModal.myCreation')
    };

    setExpertsList(prev => [newExp, ...prev]);
    setMyExpertIds(prev => [...prev, newExp.id]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-7 w-full max-w-full select-none transition-colors duration-200 @container">
      {/* Sub-component: AI Hub Header Banner */}
      <AIHubHeaderBanner />

      {/* Main Sub-Navigation Bar / Tabs Subcomponent */}
      <AIHubTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        expertsCount={expertsList.length}
        appsCount={aiApps.length}
      />

      {/* Tab 1: AI Experts Marketplace */}
      {activeTab === 'experts' && (
        <div className="space-y-7 animate-fade-in">
          {/* Top Search & Actions Banner */}
          <AIExpertsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showOnlyMine={showOnlyMine}
            onToggleShowMine={() => setShowOnlyMine(prev => !prev)}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            selectedTag={''}
            onSelectTag={() => {}}
            totalCount={expertsList.length}
          />

          {/* Section 1: 精选场景 (Featured Scenarios) */}
          <FeaturedScenariosSection
            selectedScenario={selectedScenario}
            onSelectScenario={(scenTitle) => setSelectedScenario(scenTitle)}
            onSelectExpertByName={(name) => {
              const matched = expertsList.find(e => e.name === name);
              if (matched) handleOpenExpertDetail(matched);
            }}
          />

          {/* Section 2: 专家 / 专家团 (Experts Grid with Filter Tags & Sort) */}
          <AIExpertsRoster
            experts={expertsList}
            myExpertIds={myExpertIds}
            onToggleMyExpert={handleToggleMyExpert}
            onSelectExpert={handleOpenExpertDetail}
            onOpenSandboxChat={handleOpenSandboxChat}
            searchQuery={searchQuery}
            showOnlyMine={showOnlyMine}
            selectedScenario={selectedScenario}
          />
        </div>
      )}

      {/* Tab 2: AI Sandbox Assistant */}
      {activeTab === 'sandbox' && (
        <div className="space-y-4 animate-fade-in">
          <AISandboxContextBanner
            activeExpertName={activeExpertName}
            onResetContext={() => setActiveExpertName('')}
          />
          <AISandboxAssistant
            initialPrompt={sandboxPrompt}
            activeExpertName={activeExpertName}
          />
        </div>
      )}

      {/* Tab 3: AI Apps Grid */}
      {activeTab === 'apps' && (
        <div className="animate-fade-in">
          <AIAppsGrid apps={aiApps} />
        </div>
      )}

      {/* Modal: Expert Detail Modal */}
      <ExpertDetailModal
        expert={selectedExpert}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isMyExpert={selectedExpert ? myExpertIds.includes(selectedExpert.id) : false}
        onToggleMyExpert={(id) => handleToggleMyExpert(id)}
        onTestInSandbox={handleTestInSandboxFromModal}
      />

      {/* Modal: Create Custom Expert Subcomponent */}
      <CreateCustomExpertModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateExpert={handleCreateCustomExpert}
      />
    </div>
  );
}
