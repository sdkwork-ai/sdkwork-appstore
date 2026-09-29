import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AISandboxFormProps {
  demoPrompt: string;
  isGenerating: boolean;
  onPromptChange: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AISandboxForm: React.FC<AISandboxFormProps> = ({
  demoPrompt,
  isGenerating,
  onPromptChange,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-store-ink-faint" />
        <input
          type="text"
          value={demoPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('aihub.sandbox.inputPlaceholder')}
          className="w-full bg-store-field border border-store-line rounded-store-control pl-10 pr-3.5 text-sm text-store-ink outline-none focus:ring-2 focus:ring-store-brand/25 font-medium h-9 placeholder:text-store-ink-faint transition-colors focus:border-store-brand"
        />
      </div>
      <button
        type="submit"
        disabled={isGenerating}
        className="px-4 py-2 bg-store-info hover:bg-store-info-hover text-white rounded-store-control text-xs font-medium transition-all shadow-sm shrink-0 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
      >
        {isGenerating ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{t('aihub.sandbox.generating')}</span>
          </>
        ) : (
          <span>{t('aihub.sandbox.send')}</span>
        )}
      </button>
    </form>
  );
};
