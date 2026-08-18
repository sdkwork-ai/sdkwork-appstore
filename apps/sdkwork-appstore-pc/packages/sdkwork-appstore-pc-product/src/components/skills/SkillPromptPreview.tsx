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
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-blue-500" />
          {t('skills.modal.promptTitle', '核心 Prompt 指令预览')}
        </h4>
        <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
          {promptTemplate}
        </pre>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          {t('skills.modal.specTitle', 'SKILL.md 标准结构规范')}
        </h4>
        <pre className="p-3.5 rounded-2xl bg-gray-100 dark:bg-[#20232d] text-gray-800 dark:text-gray-200 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-gray-200/60 dark:border-[#2a2d39]">
          {skillMarkdown}
        </pre>
      </div>
    </>
  );
};
