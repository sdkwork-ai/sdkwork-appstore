import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { FormInputField } from './FormInputField';
import { CategorySelectField } from './CategorySelectField';
import { DescriptionTextArea } from './DescriptionTextArea';

interface PublishAppFormProps {
  appName: string;
  /** Live catalog category id selected by the publisher. */
  categoryId: string;
  version: string;
  description: string;
  /** Options resolved from `appstore.catalog.categories.list`. */
  categoryOptions: readonly { value: string; label: string }[];
  onAppNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PublishAppForm: React.FC<PublishAppFormProps> = ({
  appName,
  categoryId,
  version,
  description,
  categoryOptions,
  onAppNameChange,
  onCategoryChange,
  onVersionChange,
  onDescriptionChange,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm ">
      <h2 className="text-sm font-bold text-store-ink mb-4 flex items-center gap-2 ">
        <Plus className="w-4 h-4 text-store-brand" />
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
            value={categoryId}
            options={
              categoryOptions.length > 0
                ? [...categoryOptions]
                : [{ value: '', label: t('console.form.categoryUnavailable', '类目加载不可用') }]
            }
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
            className="px-5 py-2 bg-store-brand hover:bg-store-brand text-white rounded-store-control text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            {t('console.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
