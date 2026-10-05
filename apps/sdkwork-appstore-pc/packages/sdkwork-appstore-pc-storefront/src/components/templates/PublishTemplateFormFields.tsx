import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEMPLATE_PLATFORMS } from '@sdkwork/appstore-pc-core';

interface PublishTemplateFormFieldsProps {
  appSource: string;
  title: string;
  category: string;
  platform: string;
  framework: string;
  description: string;
  tags: string;
  onAppSourceChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPlatformChange: (v: string) => void;
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
  platform,
  framework,
  description,
  tags,
  onAppSourceChange,
  onTitleChange,
  onCategoryChange,
  onPlatformChange,
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
        <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
          {t('templates.form.selectApp')}
        </label>
        <select
          value={appSource}
          onChange={(e) => onAppSourceChange(e.target.value)}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        >
          <option value="app-qwen">Qwen AI Desktop (Python/TS)</option>
          <option value="app-douyin">Cloud Streaming Platform (React/Vite)</option>
          <option value="app-baidunetdisk">Cloud Storage & File Transfer Helper</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
            {t('templates.form.tmplTitle')}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('templates.form.tmplTitlePlaceholder')}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
            {t('templates.form.category')}
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
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
        <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
          {t('templates.publishModal.platformLabel')}
        </label>
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        >
          {TEMPLATE_PLATFORMS.map((code) => (
            <option key={code} value={code}>
              {t(`templates.platforms.${code.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
          {t('templates.form.framework')}
        </label>
        <input
          type="text"
          value={framework}
          onChange={(e) => onFrameworkChange(e.target.value)}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
          {t('templates.form.descLabel')}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t('templates.form.descPlaceholder')}
          className="w-full px-3 py-2 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-store-ink-faint uppercase mb-1">
          {t('templates.form.tagsLabel')}
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder={t('templates.form.tagsPlaceholder')}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm text-store-ink focus:outline-none focus:border-store-brand h-9 placeholder:text-store-ink-faint outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="pt-3 border-t border-store-line-soft flex justify-end gap-3 ">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-store-control text-xs font-medium text-store-ink-faint hover:bg-store-subtle cursor-pointer "
        >
          {t('common.actions.cancel')}
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-store-control bg-store-brand hover:bg-store-brand text-white text-xs font-medium shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('templates.form.submitBtn')}</span>
        </button>
      </div>
    </form>
  );
};

