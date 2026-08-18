import React from 'react';
import { McpServerItem } from '../../types';
import { McpCardHeader } from './McpCardHeader';
import { McpToolsList } from './McpToolsList';
import { McpCardFooter } from './McpCardFooter';

interface McpCardProps {
  server: McpServerItem;
  onToggleConnect: (id: string) => void;
  onOpenConfig: (server: McpServerItem) => void;
}

export const McpCard: React.FC<McpCardProps> = ({
  server,
  onToggleConnect,
  onOpenConfig,
}) => {
  return (
    <div className="group bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 p-4 rounded-2xl transition-all duration-200 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* Subcomponent: MCP Card Header */}
        <McpCardHeader server={server} />

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
          {server.description}
        </p>

        {/* Subcomponent: Provided Tools List */}
        <McpToolsList toolsProvided={server.toolsProvided} />
      </div>

      {/* Subcomponent: Card Footer Actions */}
      <McpCardFooter
        server={server}
        onOpenConfig={onOpenConfig}
        onToggleConnect={onToggleConnect}
      />
    </div>
  );
};

