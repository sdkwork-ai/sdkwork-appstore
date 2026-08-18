import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { AuditLogEntry } from './AuditLogEntry';
import { AuditLogFilterBar } from './AuditLogFilterBar';
import { SystemAuditEntry } from '../../services/api';

interface SystemAuditLogProps {
  logs: SystemAuditEntry[];
}

export const SystemAuditLog: React.FC<SystemAuditLogProps> = ({ logs }) => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

  const filteredLogs = selectedLevel === 'ALL'
    ? logs
    : logs.filter((log) => log.level === selectedLevel);

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Level', 'Service', 'Event', 'TraceID'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.level,
      `"${l.service}"`,
      `"${l.event.replace(/"/g, '""')}"`,
      l.traceId,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          {t('admin.audit.title')}
        </h2>

        {/* Subcomponent: Audit Log Filter and Export Bar */}
        <AuditLogFilterBar
          levels={levels}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onExportCsv={handleExportCsv}
        />
      </div>

      <div className="space-y-2 font-mono text-[11px] text-gray-400">
        {filteredLogs.map((log) => (
          <AuditLogEntry key={log.id} log={log} />
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
            {t('admin.audit.noLogs', { level: selectedLevel, defaultValue: `暂无 ${selectedLevel} 级别的日志记录` })}
          </div>
        )}
      </div>
    </div>
  );
};



