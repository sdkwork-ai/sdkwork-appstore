import React from 'react';
import { useTranslation } from 'react-i18next';

interface PublishSkillFormFieldsProps {
  newSkillName: string;
  newSkillCategory: string;
  newSkillTriggers: string;
  newSkillPrompt: string;
  newSkillMarkdown: string;
  filteredCategories: string[];
  onNameChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onTriggersChange: (val: string) => void;
  onPromptChange: (val: string) => void;
  onMarkdownChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PublishSkillFormFields: React.FC<PublishSkillFormFieldsProps> = ({
  newSkillName,
  newSkillCategory,
  newSkillTriggers,
  newSkillPrompt,
  newSkillMarkdown,
  filteredCategories,
  onNameChange,
  onCategoryChange,
  onTriggersChange,
  onPromptChange,
  onMarkdownChange,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4 text-xs">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('skills.form.skillName')}</label>
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('skills.form.skillNamePlaceholder')}
          required
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('skills.form.category')}</label>
          <select
            value={newSkillCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
          >
            {filteredCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('skills.form.triggersLabel')}</label>
          <input
            type="text"
            value={newSkillTriggers}
            onChange={(e) => onTriggersChange(e.target.value)}
            placeholder={t('skills.form.triggersPlaceholder')}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('skills.form.systemPromptLabel')}</label>
        <textarea
          value={newSkillPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('skills.form.systemPromptPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500 resize-none font-mono text-[11px]"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('skills.form.specLabel')}</label>
        <textarea
          value={newSkillMarkdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          placeholder={t('skills.form.specPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500 resize-none font-mono text-[11px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#22252e] text-gray-600 dark:text-gray-300 hover:bg-gray-200 cursor-pointer font-medium"
        >
          {t('common.actions.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
        >
          {t('skills.form.submitBtn')}
        </button>
      </div>
    </form>
  );
};
