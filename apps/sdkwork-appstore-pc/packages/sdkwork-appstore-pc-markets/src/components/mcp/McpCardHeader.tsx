import React from 'react';
import { McpServerItem } from '@sdkwork/appstore-pc-core';
import { DynamicIcon } from '@sdkwork/appstore-pc-commons';
import { McpServerStatusBadge } from './McpServerStatusBadge';

interface McpCardHeaderProps {
  server: McpServerItem;
}

export const McpCardHeader: React.FC<McpCardHeaderProps> = ({ server }) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${server.iconColor}`}>
          <DynamicIcon name={server.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-store-ink group-hover:text-store-info transition-colors truncate ">
            {server.name}
          </h3>
          <p className="text-xs text-store-ink-faint truncate mt-0.5">
            {server.publisher} · {server.transportType.toUpperCase()}
          </p>
        </div>
      </div>

      <McpServerStatusBadge status={server.status} />
    </div>
  );
};
