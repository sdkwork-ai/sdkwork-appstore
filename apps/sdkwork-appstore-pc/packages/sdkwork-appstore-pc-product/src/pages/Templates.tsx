import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../types';
import { TemplateCard } from '../components/templates/TemplateCard';
import { PublishTemplateModal } from '../components/templates/PublishTemplateModal';
import { TemplatesHeaderBanner } from '../components/templates/TemplatesHeaderBanner';
import { TemplatesCategoryFilter } from '../components/templates/TemplatesCategoryFilter';
import { TemplatesSearchBar } from '../components/templates/TemplatesSearchBar';
import { TemplatesEmptyState } from '../components/templates/TemplatesEmptyState';
import { TemplatesService } from '../services/api';

export function TemplatesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('templates.categories.all'));
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    t('templates.categories.all'),
    t('templates.categories.saasFullstack'),
    t('templates.categories.knowledgeBase'),
    t('templates.categories.agentCollab'),
    t('templates.categories.devTools'),
    t('templates.categories.eCommerce')
  ];

  const loadTemplates = async () => {
    try {
      const data = await TemplatesService.getTemplates(selectedCategory, searchQuery);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, searchQuery]);

  const handlePublish = async (newTmpl: TemplateItem) => {
    const published = await TemplatesService.publishTemplate({
      title: newTmpl.title,
      category: newTmpl.category,
      framework: newTmpl.framework,
      description: newTmpl.description,
      tags: newTmpl.tags,
      repoUrl: newTmpl.repoUrl,
      previewUrl: newTmpl.previewUrl,
    });
    setTemplates((prev) => [published, ...prev]);
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    navigate(`/template/${template.id}`);
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in">
      {/* Header Banner Subcomponent */}
      <TemplatesHeaderBanner />

      {/* Filter and Publish Bar Subcomponent */}
      <TemplatesSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPublishClick={() => setIsPublishModalOpen(true)}
      />

      {/* Categories Horizontal Filter Subcomponent */}
      <TemplatesCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Template Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('templates.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      )}

      {templates.length === 0 && !loading && <TemplatesEmptyState />}

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


