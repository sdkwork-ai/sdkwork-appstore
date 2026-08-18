import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface SkillSandboxTabProps {
  testInput: string;
  running: boolean;
  output: { output: string; tokensUsed: number } | null;
  onTestInputChange: (value: string) => void;
  onRunSandbox: () => void;
}

export const SkillSandboxTab: React.FC<SkillSandboxTabProps> = ({
  testInput,
  running,
  output,
  onTestInputChange,
  onRunSandbox,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 text-xs">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
          {t('skills.modal.testInput')}
        </label>
        <textarea
          value={testInput}
          onChange={(e) => onTestInputChange(e.target.value)}
          placeholder={t('skills.modal.testInputPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none resize-none font-mono text-xs"
        />
      </div>

      <button
        onClick={onRunSandbox}
        disabled={running}
        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
      >
        {running ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span>{running ? t('skills.modal.simulating') : t('skills.modal.simulateRun')}</span>
      </button>

      {output && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span>{t('skills.modal.outputResult')}</span>
            <span>
              Tokens: <strong>{output.tokensUsed}</strong>
            </span>
          </div>
          <pre className="p-3 rounded-xl bg-gray-900 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed border border-gray-800 whitespace-pre-wrap select-text">
            {output.output}
          </pre>
        </div>
      )}
    </div>
  );
};
