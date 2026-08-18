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
      className="group bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
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

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
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


