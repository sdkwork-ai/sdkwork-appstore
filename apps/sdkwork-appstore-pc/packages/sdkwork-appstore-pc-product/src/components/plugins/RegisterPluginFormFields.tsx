import React from 'react';
import { useTranslation } from 'react-i18next';

interface RegisterPluginFormFieldsProps {
  newPlugName: string;
  newPlugCategory: string;
  newPlugSchemaType: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST';
  newPlugDesc: string;
  newPlugCapabilities: string;
  filteredCategories: string[];
  onNameChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onSchemaTypeChange: (val: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST') => void;
  onDescChange: (val: string) => void;
  onCapabilitiesChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const RegisterPluginFormFields: React.FC<RegisterPluginFormFieldsProps> = ({
  newPlugName,
  newPlugCategory,
  newPlugSchemaType,
  newPlugDesc,
  newPlugCapabilities,
  filteredCategories,
  onNameChange,
  onCategoryChange,
  onSchemaTypeChange,
  onDescChange,
  onCapabilitiesChange,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4 text-xs">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('plugins.form.nameLabel')}</label>
        <input
          type="text"
          value={newPlugName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('plugins.form.namePlaceholder')}
          required
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('plugins.form.categoryLabel')}</label>
          <select
            value={newPlugCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500"
          >
            {filteredCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('plugins.form.schemaTypeLabel')}</label>
          <select
            value={newPlugSchemaType}
            onChange={(e) => onSchemaTypeChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500"
          >
            <option value="OpenAPI">OpenAPI 3.0</option>
            <option value="GraphQL">GraphQL</option>
            <option value="gRPC">gRPC Proto</option>
            <option value="REST">REST API</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('plugins.form.capabilitiesLabel')}</label>
        <input
          type="text"
          value={newPlugCapabilities}
          onChange={(e) => onCapabilitiesChange(e.target.value)}
          placeholder={t('plugins.form.capabilitiesPlaceholder')}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('plugins.form.descLabel')}</label>
        <textarea
          value={newPlugDesc}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder={t('plugins.form.descPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 resize-none"
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
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
        >
          {t('plugins.form.submitBtn')}
        </button>
      </div>
    </form>
  );
};
