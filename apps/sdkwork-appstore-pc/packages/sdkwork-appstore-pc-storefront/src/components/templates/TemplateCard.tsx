import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateItem } from '../../types';
import { TemplateCardHeader } from './TemplateCardHeader';
import { TemplateScreenPreview } from './TemplateScreenPreview';
import { TemplateCardTags } from './TemplateCardTags';
import { TemplateCardFooter } from './TemplateCardFooter';

interface TemplateCardProps {
  template: TemplateItem;
  onSelect?: (template: TemplateItem) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const navigate = useNavigate();

  const handleGoToTemplateDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/template/${template.id}`);
    if (onSelect) onSelect(template);
  };

  const handleGoToAppDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const appId = template.relatedAppId || 'app-saas-starter';
    navigate(`/app/${appId}`);
  };

  return (
    <div
      onClick={handleGoToTemplateDetail}
      className="group bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between "
    >
      <div>
        {/* Subcomponent: Card Header */}
        <TemplateCardHeader template={template} />

        {/* Subcomponent: High-Fidelity UI Interface Preview Banner */}
        <TemplateScreenPreview
          previewImage={template.previewImage}
          screenshots={template.screenshots}
          title={template.title}
          category={template.category}
          framework={template.framework}
          isOfficial={template.isOfficial}
        />

        <p className="text-xs text-store-ink-soft mt-2 line-clamp-2 leading-relaxed ">
          {template.description}
        </p>

        {/* Subcomponent: Tags */}
        <TemplateCardTags tags={template.tags} />
      </div>

      {/* Subcomponent: Footer Actions */}
      <TemplateCardFooter
        stars={template.stars}
        forks={template.forks}
        onAppDetailClick={handleGoToAppDetail}
      />
    </div>
  );
};


