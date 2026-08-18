import React from 'react';
import { SystemAuditEntry } from '../../services/api';

interface AuditLogEntryProps {
  log: SystemAuditEntry;
}

export const AuditLogEntry: React.FC<AuditLogEntryProps> = ({ log }) => {
  const levelColor =
    log.level === 'INFO'
      ? 'text-cyan-500'
      : log.level === 'WARN'
      ? 'text-amber-500'
      : 'text-rose-500';

  return (
    <div className="p-2 bg-white dark:bg-[#20232b] rounded-lg flex items-center justify-between border border-gray-200/60 dark:border-[#282c38]">
      <span className="truncate max-w-[80%]">
        <span className="text-gray-500">[{log.timestamp}]</span>{' '}
        <span className={`font-bold ${levelColor}`}>{log.level}</span> ({log.service}): {log.event}
      </span>
      <span className="font-bold text-emerald-500">{log.traceId}</span>
    </div>
  );
};


