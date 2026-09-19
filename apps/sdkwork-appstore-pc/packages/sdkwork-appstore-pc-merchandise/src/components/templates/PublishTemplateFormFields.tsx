import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PublishTemplateFormFieldsProps {
  appSource: string;
  title: string;
  category: string;
  framework: string;
  description: string;
  tags: string;
  onAppSourceChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onFrameworkChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PublishTemplateFormFields: React.FC<PublishTemplateFormFieldsProps> = ({
  appSource,
  title,
  category,
  framework,
  description,
  tags,
  onAppSourceChange,
  onTitleChange,
  onCategoryChange,
  onFrameworkChange,
  onDescriptionChange,
  onTagsChange,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
          {t('templates.form.selectApp')}
        </label>
        <select
          value={appSource}
          onChange={(e) => onAppSourceChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="app-qwen">Qwen AI Desktop (Python/TS)</option>
          <option value="app-douyin">Cloud Streaming Platform (React/Vite)</option>
          <option value="app-baidunetdisk">Cloud Storage & File Transfer Helper</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            {t('templates.form.tmplTitle')}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('templates.form.tmplTitlePlaceholder')}
            className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            {t('templates.form.category')}
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="SaaS 全栈">{t('templates.categories.saasFullstack')}</option>
            <option value="知识库系统">{t('templates.categories.knowledgeBase')}</option>
            <option value="Agent 协同">{t('templates.categories.agentCollab')}</option>
            <option value="开发者工具">{t('templates.categories.devTools')}</option>
            <option value="电商应用">{t('templates.categories.ecommerce')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
          {t('templates.form.framework')}
        </label>
        <input
          type="text"
          value={framework}
          onChange={(e) => onFrameworkChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
          {t('templates.form.descLabel')}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t('templates.form.descPlaceholder')}
          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
          {t('templates.form.tagsLabel')}
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder={t('templates.form.tagsPlaceholder')}
          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-[#262933] flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#222530] cursor-pointer"
        >
          {t('common.actions.cancel')}
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('templates.form.submitBtn')}</span>
        </button>
      </div>
    </form>
  );
};

