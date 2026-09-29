import React from 'react';
import { useTranslation } from 'react-i18next';

interface McpToolsListProps {
  toolsProvided: string[];
}

export const McpToolsList: React.FC<McpToolsListProps> = ({ toolsProvided }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-3">
      <span className="text-[10px] font-bold text-store-ink-faint uppercase tracking-wider block mb-1.5">
        {t('mcp.modal.toolsProvided', { count: toolsProvided.length })}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {toolsProvided.map((tool, idx) => (
          <span
            key={idx}
            className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft font-medium"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
};
