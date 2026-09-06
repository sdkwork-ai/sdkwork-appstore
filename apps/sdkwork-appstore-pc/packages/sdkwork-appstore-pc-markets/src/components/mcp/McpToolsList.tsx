import React from 'react';
import { useTranslation } from 'react-i18next';

interface McpToolsListProps {
  toolsProvided: string[];
}

export const McpToolsList: React.FC<McpToolsListProps> = ({ toolsProvided }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-3">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
        {t('mcp.modal.toolsProvided', { count: toolsProvided.length })}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {toolsProvided.map((tool, idx) => (
          <span
            key={idx}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#222530] text-gray-700 dark:text-gray-300"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
};
