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
          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};
