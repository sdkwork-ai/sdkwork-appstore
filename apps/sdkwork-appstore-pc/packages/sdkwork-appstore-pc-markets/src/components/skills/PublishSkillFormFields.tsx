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
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('skills.form.skillName')}</label>
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('skills.form.skillNamePlaceholder')}
          required
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-store-ink-soft font-semibold mb-1 ">{t('skills.form.category')}</label>
          <select
            value={newSkillCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
          >
            {filteredCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-store-ink-soft font-semibold mb-1 ">{t('skills.form.triggersLabel')}</label>
          <input
            type="text"
            value={newSkillTriggers}
            onChange={(e) => onTriggersChange(e.target.value)}
            placeholder={t('skills.form.triggersPlaceholder')}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
          />
        </div>
      </div>

      <div>
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('skills.form.systemPromptLabel')}</label>
        <textarea
          value={newSkillPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('skills.form.systemPromptPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand resize-none font-mono text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div>
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('skills.form.specLabel')}</label>
        <textarea
          value={newSkillMarkdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          placeholder={t('skills.form.specPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand resize-none font-mono text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-store-control bg-store-subtle text-store-ink-soft hover:bg-store-raised cursor-pointer font-medium text-sm"
        >
          {t('common.actions.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-store-control bg-store-warning hover:bg-store-warning text-white font-medium cursor-pointer text-sm"
        >
          {t('skills.form.submitBtn')}
        </button>
      </div>
    </form>
  );
};
