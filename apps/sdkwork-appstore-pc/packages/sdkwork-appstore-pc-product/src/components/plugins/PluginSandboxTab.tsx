import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';

interface PluginSandboxTabProps {
  capabilities: string[];
  testCapability: string;
  testParams: string;
  executing: boolean;
  execResult: { result: string; latencyMs: number } | null;
  onCapabilityChange: (capability: string) => void;
  onParamsChange: (params: string) => void;
  onRunTest: () => void;
}

export const PluginSandboxTab: React.FC<PluginSandboxTabProps> = ({
  capabilities,
  testCapability,
  testParams,
  executing,
  execResult,
  onCapabilityChange,
  onParamsChange,
  onRunTest,
}) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
            {t('plugins.modal.selectCapability')}
          </label>
          <select
            value={testCapability}
            onChange={(e) => onCapabilityChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
          >
            {capabilities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onRunTest}
            disabled={executing}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {executing ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{executing ? t('plugins.modal.executing') : t('plugins.modal.sendRequest')}</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
          {t('plugins.modal.payloadLabel')}
        </label>
        <textarea
          value={testParams}
          onChange={(e) => onParamsChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl border border-gray-800 outline-none resize-none"
        />
      </div>

      {execResult && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>{t('plugins.modal.responseResult')}</span>
            <span>
              {t('plugins.modal.latency')}: <strong>{execResult.latencyMs}ms</strong>
            </span>
          </div>
          <pre className="p-3 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-40 leading-tight border border-gray-800 select-text">
            {execResult.result}
          </pre>
        </div>
      )}
    </div>
  );
};
