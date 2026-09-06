import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';

interface McpSandboxTabProps {
  toolsProvided?: string[];
  selectedTool: string;
  testPayload: string;
  executing: boolean;
  execResult: { result: string; latencyMs: number } | null;
  onToolChange: (tool: string) => void;
  onPayloadChange: (payload: string) => void;
  onRunTool: () => void;
}

export const McpSandboxTab: React.FC<McpSandboxTabProps> = ({
  toolsProvided = [],
  selectedTool,
  testPayload,
  executing,
  execResult,
  onToolChange,
  onPayloadChange,
  onRunTool,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
            {t('mcp.modal.selectTool')}
          </label>
          <select
            value={selectedTool}
            onChange={(e) => onToolChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
          >
            {toolsProvided.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onRunTool}
            disabled={executing}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {executing ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{executing ? t('mcp.modal.executingTool') : t('mcp.modal.triggerTool')}</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
          {t('mcp.modal.argsJson')}
        </label>
        <textarea
          value={testPayload}
          onChange={(e) => onPayloadChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl border border-gray-800 outline-none resize-none"
        />
      </div>

      {execResult && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>{t('mcp.modal.responseHeader')}</span>
            <span>
              {t('mcp.modal.latency')}: <strong>{execResult.latencyMs}ms</strong>
            </span>
          </div>
          <pre className="p-3 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed border border-gray-800 whitespace-pre-wrap select-text">
            {execResult.result}
          </pre>
        </div>
      )}
    </div>
  );
};
