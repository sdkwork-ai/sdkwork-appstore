import React from 'react';
import { McpServerItem } from '@sdkwork/appstore-pc-core';
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
    <div className="group bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-info/50 p-4 rounded-store-card transition-all duration-200 hover:shadow-lg flex flex-col justify-between ">
      <div>
        {/* Subcomponent: MCP Card Header */}
        <McpCardHeader server={server} />

        <p className="text-xs text-store-ink-soft mt-3 line-clamp-2 leading-relaxed ">
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

