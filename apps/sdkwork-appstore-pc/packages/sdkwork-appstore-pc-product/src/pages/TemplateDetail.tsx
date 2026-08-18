import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TemplateItem, AppItem } from '../types';
import { TemplatesService, AppStoreService } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TemplateOverviewTab } from '../components/templates/TemplateOverviewTab';
import { TemplateScreenshotsTab } from '../components/templates/TemplateScreenshotsTab';
import { TemplateTechStackTab } from '../components/templates/TemplateTechStackTab';
import { TemplateCliTab } from '../components/templates/TemplateCliTab';
import { TemplateDemoTab } from '../components/templates/TemplateDemoTab';
import { TemplateDetailBreadcrumb } from '../components/templates/TemplateDetailBreadcrumb';
import { TemplateDetailHeaderCard } from '../components/templates/TemplateDetailHeaderCard';
import { TemplateDetailMetricsBar } from '../components/templates/TemplateDetailMetricsBar';
import { TemplateDetailNavTabs, TemplateTabType } from '../components/templates/TemplateDetailNavTabs';
import { TemplateDetailAssociatedApp } from '../components/templates/TemplateDetailAssociatedApp';
import { TemplateDetailRecommendations } from '../components/templates/TemplateDetailRecommendations';

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [template, setTemplate] = useState<TemplateItem | null>(null);
  const [relatedApp, setRelatedApp] = useState<AppItem | null>(null);
  const [otherTemplates, setOtherTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [starred, setStarred] = useState(false);
  const [starsCount, setStarsCount] = useState(0);
  const [forksCount, setForksCount] = useState(0);
  const [copiedCli, setCopiedCli] = useState(false);
  const [forking, setForking] = useState(false);
  const [forkedSuccess, setForkedSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<TemplateTabType>('overview');

  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-area');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      try {
        const tmpl = await TemplatesService.getTemplateById(id);
        if (tmpl) {
          setTemplate(tmpl);
          setStarsCount(tmpl.stars);
          setForksCount(tmpl.forks);

          // Fetch associated app if exists
          const appId = tmpl.relatedAppId || 'app-saas-starter';
          const appData = await AppStoreService.getAppById(appId);
          setRelatedApp(appData || null);

          // Fetch other templates for recommendation
          const allTmpls = await TemplatesService.getTemplates();
          setOtherTemplates(allTmpls.filter((t) => t.id !== id).slice(0, 3));
        } else {
          setTemplate(null);
        }
      } catch (err) {
        console.error('Failed to load template detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleStar = async () => {
    if (!template) return;
    try {
      const res = await TemplatesService.starTemplate(template.id);
      setStarsCount(res.stars);
      setStarred(res.isStarred);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFork = async () => {
    if (!template || forking) return;
    setForking(true);
    try {
      const res = await TemplatesService.forkTemplate(template.id);
      setForksCount(res.forks);
      setForkedSuccess(true);
      setTimeout(() => setForkedSuccess(false), 3000);
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
      navigator.clipboard.writeText(cmd);
    } catch (e) {
      console.error(e);
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!template) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full flex-1 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-[#1C1C1E] dark:text-[#F5F5F5]">{t('templates.empty.title')}</h2>
        <button
          onClick={() => navigate('/templates')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          {t('common.actions.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 w-full max-w-full space-y-6 animate-fade-in">
      {/* Sub-component: Top Breadcrumb Navigation */}
      <TemplateDetailBreadcrumb
        templateId={template.id}
        onBack={() => navigate('/templates')}
      />

      {/* Sub-component: Main Template Header Card */}
      <TemplateDetailHeaderCard
        template={template}
        relatedApp={relatedApp}
        starsCount={starsCount}
        forksCount={forksCount}
        starred={starred}
        forking={forking}
        forkedSuccess={forkedSuccess}
        copiedCli={copiedCli}
        onFork={handleFork}
        onStar={handleStar}
        onCopyCli={handleCopyCli}
      />

      {/* Sub-component: Metrics Bar */}
      <TemplateDetailMetricsBar
        license={template.license}
        starsCount={starsCount}
        forksCount={forksCount}
      />

      {/* Sub-component: Navigation Tabs Header */}
      <TemplateDetailNavTabs
        activeTab={activeTab}
        screenshotsCount={template.screenshots?.length || 3}
        onTabChange={setActiveTab}
      />

      {/* Main Tab Content */}
      <div className="bg-white dark:bg-[#181a20] rounded-3xl p-6 md:p-8 border border-gray-200/80 dark:border-[#262933] shadow-sm min-h-[380px]">
        {activeTab === 'overview' && <TemplateOverviewTab template={template} />}
        {activeTab === 'screenshots' && (
          <TemplateScreenshotsTab screenshots={template.screenshots} title={template.title} />
        )}
        {activeTab === 'techstack' && <TemplateTechStackTab template={template} />}
        {activeTab === 'cli' && <TemplateCliTab templateId={template.id} title={template.title} />}
        {activeTab === 'demo' && <TemplateDemoTab template={template} />}
      </div>

      {/* Sub-component: Associated Application Section */}
      {relatedApp && (
        <TemplateDetailAssociatedApp relatedApp={relatedApp} />
      )}

      {/* Sub-component: Other Recommended Templates */}
      <TemplateDetailRecommendations
        templates={otherTemplates}
        onSelect={(id) => navigate(`/template/${id}`)}
        onViewAll={() => navigate('/templates')}
      />
    </div>
  );
}

export default TemplateDetailPage;
