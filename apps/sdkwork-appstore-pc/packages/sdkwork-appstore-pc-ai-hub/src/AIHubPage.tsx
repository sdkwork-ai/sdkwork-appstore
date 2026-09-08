import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIHubService, AppStoreService, PluginsService, SkillsService } from '@sdkwork/appstore-pc-core';
import { AppItem, ExpertItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner } from '@sdkwork/appstore-pc-commons';
// Marketplace add flows, reused verbatim so the AI Lab's add dropdown opens
// the exact same modals (and copy) as the marketplace's Plugins/Skills pages.
import { RegisterPluginModal } from '@sdkwork/appstore-pc-markets';
import { PublishSkillModal } from '@sdkwork/appstore-pc-markets';
import { AIHubHeaderBanner } from './components/AIHubHeaderBanner';
import { AIExpertsHeader } from './components/AIExpertsHeader';
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

  // Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  // Marketplace add flows, reused from the Plugins/Skills marketplace pages:
  // the header's add dropdown opens these same modals with the same copy.
  const [isRegisterPluginOpen, setIsRegisterPluginOpen] = useState(false);
  const [isPublishSkillOpen, setIsPublishSkillOpen] = useState(false);
  const [marketActionError, setMarketActionError] = useState<string | null>(null);

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
  };

  // Marketplace-shared submit handlers: identical payloads and service calls
  // to the marketplace's PluginsPage.handleRegisterSubmit and
  // SkillsPage.handlePublishSubmit, so both surfaces behave the same.
  const PLUGIN_CATEGORIES = [
    t('plugins.categories.all'),
    t('plugins.categories.codeDev'),
    t('plugins.categories.dataRetrieval'),
    t('plugins.categories.docProcessing'),
    t('plugins.categories.databaseApps'),
    t('plugins.categories.imageProcessing'),
    t('plugins.categories.business')
  ];
  const SKILL_CATEGORIES = [
    t('skills.categories.all'),
    t('skills.categories.dataScience'),
    t('skills.categories.frontendDesign'),
    t('skills.categories.architecture'),
    t('skills.categories.codeRefactor'),
    t('skills.categories.nlp')
  ];

  const handleRegisterPluginSubmit = async (pluginData: {
    name: string;
    category: string;
    apiSchemaType: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST';
    description: string;
    capabilities: string[];
  }) => {
    setMarketActionError(null);
    try {
      await PluginsService.registerPlugin(pluginData);
      setIsRegisterPluginOpen(false);
    } catch (error) {
      setMarketActionError(error instanceof Error ? error.message : 'Plugin registration failed.');
    }
  };

  const handlePublishSkillSubmit = async (skillData: {
    name: string;
    category: string;
    triggers: string[];
    promptTemplate: string;
    skillMarkdown: string;
  }) => {
    setMarketActionError(null);
    try {
      await SkillsService.publishSkill(skillData);
      setIsPublishSkillOpen(false);
    } catch (error) {
      setMarketActionError(error instanceof Error ? error.message : 'Skill publishing failed.');
    }
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
          {/* Top Search & Actions Banner (marketplace-style add dropdown) */}
          <AIExpertsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showOnlyMine={showOnlyMine}
            onToggleShowMine={() => setShowOnlyMine(prev => !prev)}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onOpenRegisterPlugin={() => setIsRegisterPluginOpen(true)}
            onOpenPublishSkill={() => setIsPublishSkillOpen(true)}
            selectedTag={''}
            onSelectTag={() => {}}
            totalCount={expertsList.length}
          />

          {marketActionError && (
            <p role="alert" className="text-xs text-indigo-700 dark:text-indigo-300">
              {marketActionError}
            </p>
          )}
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

      {/* Modal: Create Custom Expert Subcomponent */}
      <CreateCustomExpertModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateExpert={handleCreateCustomExpert}
      />

      {/* Marketplace modals, reused verbatim from the Plugins/Skills pages */}
      <RegisterPluginModal
        isOpen={isRegisterPluginOpen}
        onClose={() => setIsRegisterPluginOpen(false)}
        onSubmit={handleRegisterPluginSubmit}
        categories={PLUGIN_CATEGORIES}
      />
      <PublishSkillModal
        isOpen={isPublishSkillOpen}
        onClose={() => setIsPublishSkillOpen(false)}
        onSubmit={handlePublishSkillSubmit}
        categories={SKILL_CATEGORIES}
      />
    </div>
  );
}
