import React from 'react';
import { useTranslation } from 'react-i18next';

interface McpServerFormFieldsProps {
  newName: string;
  newTransport: 'stdio' | 'sse' | 'http';
  newCommand: string;
  newPublisher: string;
  newTools: string;
  newDesc: string;
  onNameChange: (val: string) => void;
  onTransportChange: (val: 'stdio' | 'sse' | 'http') => void;
  onCommandChange: (val: string) => void;
  onPublisherChange: (val: string) => void;
  onToolsChange: (val: string) => void;
  onDescChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const McpServerFormFields: React.FC<McpServerFormFieldsProps> = ({
  newName,
  newTransport,
  newCommand,
  newPublisher,
  newTools,
  newDesc,
  onNameChange,
  onTransportChange,
  onCommandChange,
  onPublisherChange,
  onToolsChange,
  onDescChange,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4 text-xs">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.nameLabel')}</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('mcp.form.namePlaceholder')}
          required
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.transportLabel')}</label>
          <select
            value={newTransport}
            onChange={(e) => onTransportChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500"
          >
            <option value="stdio">stdio (CLI)</option>
            <option value="sse">sse (Server-Sent Events)</option>
            <option value="http">http (REST Remote)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.publisherLabel')}</label>
          <input
            type="text"
            value={newPublisher}
            onChange={(e) => onPublisherChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.commandLabel')}</label>
        <input
          type="text"
          value={newCommand}
          onChange={(e) => onCommandChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500 font-mono text-[11px]"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.toolsLabel')}</label>
        <input
          type="text"
          value={newTools}
          onChange={(e) => onToolsChange(e.target.value)}
          placeholder={t('mcp.form.toolsPlaceholder')}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">{t('mcp.form.descLabel')}</label>
        <textarea
          value={newDesc}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder={t('mcp.form.descPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#20232d] border border-gray-200 dark:border-[#2a2d39] rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-cyan-500 resize-none"
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
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer"
        >
          {t('mcp.form.submitBtn')}
        </button>
      </div>
    </form>
  );
};
