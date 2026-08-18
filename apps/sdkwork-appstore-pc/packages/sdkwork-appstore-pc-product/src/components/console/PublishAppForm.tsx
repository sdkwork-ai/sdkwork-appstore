import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { FormInputField } from './FormInputField';
import { CategorySelectField } from './CategorySelectField';
import { DescriptionTextArea } from './DescriptionTextArea';

interface PublishAppFormProps {
  appName: string;
  category: string;
  version: string;
  description: string;
  onAppNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PublishAppForm: React.FC<PublishAppFormProps> = ({
  appName,
  category,
  version,
  description,
  onAppNameChange,
  onCategoryChange,
  onVersionChange,
  onDescriptionChange,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const categoriesList = [
    { value: '高效工作', label: t('console.categories.productivity', '高效工作') },
    { value: '实用程序与工具', label: t('console.categories.utilities', '实用程序与工具') },
    { value: '娱乐影音', label: t('console.categories.entertainment', '娱乐影音') },
    { value: 'AI 智能', label: t('console.categories.ai', 'AI 智能') },
    { value: '游戏', label: t('console.categories.games', '游戏') },
  ];

  return (
    <div className="bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-500" />
        {t('console.tabs.publish')}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInputField
            label={t('console.form.appName')}
            required
            value={appName}
            onChange={onAppNameChange}
            placeholder={t('console.form.appNamePlaceholder')}
          />

          <CategorySelectField
            label={t('console.form.category')}
            value={category}
            options={categoriesList}
            onChange={onCategoryChange}
          />

          <FormInputField
            label={t('console.form.version', '版本号')}
            value={version}
            onChange={onVersionChange}
            placeholder="1.0.0"
          />
        </div>

        <DescriptionTextArea
          label={t('console.form.description')}
          value={description}
          onChange={onDescriptionChange}
          placeholder={t('console.form.descriptionPlaceholder')}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {t('console.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

