import React from 'react';

interface TemplateCardTagsProps {
  tags: string[];
}

export const TemplateCardTags: React.FC<TemplateCardTagsProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand "
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};
