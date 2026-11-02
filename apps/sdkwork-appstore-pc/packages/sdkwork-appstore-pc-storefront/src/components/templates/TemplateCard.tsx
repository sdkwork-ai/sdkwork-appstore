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
    // The routed detail page is the owner of the click: the catalog page passes
    // its navigation callback, and a card rendered without one still resolves
    // to the same route.
    if (onSelect) {
      onSelect(template);
    } else {
      navigate(`/templates/${template.id}`);
    }
  };

  const handleGoToAppDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const appId = template.relatedAppId || 'app-saas-starter';
    navigate(`/app/${appId}`);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={template.title}
      onClick={handleGoToTemplateDetail}
      onKeyDown={(event) => {
        // Only the card itself owns Enter/Space: a nested control (the app
        // detail button) must keep its own keyboard activation.
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleGoToTemplateDetail();
        }
      }}
      className="group bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-store-brand/40 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
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


