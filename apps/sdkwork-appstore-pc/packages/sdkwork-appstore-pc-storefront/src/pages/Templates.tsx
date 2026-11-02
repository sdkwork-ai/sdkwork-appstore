import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../types';
import { CardGrid } from '../components/common';
import { TemplateCard } from '../components/templates/TemplateCard';
import { PublishTemplateModal } from '../components/templates/PublishTemplateModal';
import { TemplatesPublishButton } from '../components/templates/TemplatesPublishButton';
import { TemplatesCategoryFilter, type TemplateCategoryOption } from '../components/templates/TemplatesCategoryFilter';
import { TemplatesPlatformFilter } from '../components/templates/TemplatesPlatformFilter';
import { TemplatesEmptyState } from '../components/templates/TemplatesEmptyState';
import { TemplatesService } from '../services/api';

/** Props for the templates catalog page. */
export interface TemplatesPageProps {
  /**
   * Controlled catalog text filter. The surrounding chrome owns the search
   * field (the store header's global search, or an embedding host's toolbar)
   * and passes its query here; the page renders no search input of its own.
   * Unset filters by the empty string, i.e. the full catalog.
   */
  searchQuery?: string;
  /**
   * CSS selector of the host-provided container that receives the publish
   * button (a portal target in the host's toolbar row). When set, the button
   * portals there instead of riding the platform-filter row — the publish
   * modal and action stay page-owned. Standalone storefront omits it.
   */
  publishSlotSelector?: string;
}

export function TemplatesPage({ searchQuery, publishSlotSelector }: TemplatesPageProps = {}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const publishQuery = searchQuery ?? '';
  // The host toolbar's portal target mounts in the same commit as this page
  // (the host row renders before the embed in the composition tree), so a
  // post-commit lookup always finds it.
  const [publishSlot, setPublishSlot] = useState<Element | null>(null);

  useEffect(() => {
    if (publishSlotSelector === undefined) return;
    setPublishSlot(document.querySelector(publishSlotSelector));
  }, [publishSlotSelector]);

  // Category values are the catalog's own strings; labels come from the locale
  // dictionary. Keeping them apart lets the filter work in every locale.
  const categories: TemplateCategoryOption[] = [
    { value: '', label: t('templates.categories.all') },
    { value: 'SaaS 全栈', label: t('templates.categories.saasFullstack') },
    { value: '知识库系统', label: t('templates.categories.knowledgeBase') },
    { value: 'Agent 协同', label: t('templates.categories.agentCollab') },
    { value: '开发者工具', label: t('templates.categories.devTools') },
    { value: '电商应用', label: t('templates.categories.eCommerce') }
  ];

  const loadTemplates = async () => {
    try {
      const data = await TemplatesService.getTemplates(selectedCategory, publishQuery, selectedPlatform);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, publishQuery, selectedPlatform]);

  const handlePublish = async (newTmpl: TemplateItem) => {
    const published = await TemplatesService.publishTemplate({
      title: newTmpl.title,
      category: newTmpl.category,
      framework: newTmpl.framework,
      description: newTmpl.description,
      tags: newTmpl.tags,
      repoUrl: newTmpl.repoUrl,
      previewUrl: newTmpl.previewUrl,
      platform: newTmpl.platform,
    });
    setTemplates((prev) => [published, ...prev]);
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    // Selecting a template is a page navigation: the embed mounts the detail
    // route, and the standalone storefront owns the same path.
    navigate(`/templates/${template.id}`);
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Platform Filter & Publish Bar — the publish action rides the top
          filter row (or portals into the host toolbar); text search belongs to
          the surrounding chrome. */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <TemplatesPlatformFilter selected={selectedPlatform} onSelect={setSelectedPlatform} />
        </div>
        {publishSlotSelector === undefined && (
          <TemplatesPublishButton onClick={() => setIsPublishModalOpen(true)} />
        )}
      </div>

      {/* Categories Horizontal Filter Subcomponent */}
      <TemplatesCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Template Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('templates.loading')}</div>
      ) : (
        <CardGrid>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
            />
          ))}
        </CardGrid>
      )}

      {templates.length === 0 && !loading && <TemplatesEmptyState />}

      {/* Publish button portaled into the host toolbar row; the modal and the
          publish action stay page-owned. */}
      {publishSlot !== null && createPortal(
        <TemplatesPublishButton onClick={() => setIsPublishModalOpen(true)} />,
        publishSlot,
      )}

      {/* Modals */}
      <PublishTemplateModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
      />
    </div>
  );
}

export default TemplatesPage;
