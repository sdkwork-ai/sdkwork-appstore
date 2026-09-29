import React from 'react';
import { Code2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SkillPromptPreviewProps {
  promptTemplate: string;
  skillMarkdown: string;
}

export const SkillPromptPreview: React.FC<SkillPromptPreviewProps> = ({
  promptTemplate,
  skillMarkdown,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-store-brand" />
          {t('skills.modal.promptTitle', '核心 Prompt 指令预览')}
        </h4>
        <pre className="p-3.5 rounded-store-card bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-store-line">
          {promptTemplate}
        </pre>
      </div>

      <div>
        <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-store-success" />
          {t('skills.modal.specTitle', 'SKILL.md 标准结构规范')}
        </h4>
        <pre className="p-3.5 rounded-store-card bg-store-subtle text-store-ink text-xs font-mono whitespace-pre-wrap leading-relaxed border border-store-line/60 dark:border-store-line ">
          {skillMarkdown}
        </pre>
      </div>
    </>
  );
};
