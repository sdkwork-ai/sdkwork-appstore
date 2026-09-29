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
        <label className="block text-store-ink-soft font-semibold mb-1 ">
          {t('skills.modal.testInput')}
        </label>
        <textarea
          value={testInput}
          onChange={(e) => onTestInputChange(e.target.value)}
          placeholder={t('skills.modal.testInputPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none resize-none font-mono text-sm placeholder:text-store-ink-faint transition-colors focus:border-store-brand focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <button
        onClick={onRunSandbox}
        disabled={running}
        className="w-full py-2 bg-store-warning hover:bg-store-warning text-white rounded-store-control font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors text-sm"
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
          <div className="flex justify-between text-[11px] text-store-ink-faint mb-1">
            <span>{t('skills.modal.outputResult')}</span>
            <span>
              Tokens: <strong>{output.tokensUsed}</strong>
            </span>
          </div>
          <pre className="p-3 rounded-store-control bg-gray-900 text-store-warning font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed border border-store-line whitespace-pre-wrap select-text">
            {output.output}
          </pre>
        </div>
      )}
    </div>
  );
};
