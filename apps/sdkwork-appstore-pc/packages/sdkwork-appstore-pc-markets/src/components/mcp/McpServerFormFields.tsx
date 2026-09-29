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
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.nameLabel')}</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('mcp.form.namePlaceholder')}
          required
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.transportLabel')}</label>
          <select
            value={newTransport}
            onChange={(e) => onTransportChange(e.target.value as any)}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
          >
            <option value="stdio">stdio (CLI)</option>
            <option value="sse">sse (Server-Sent Events)</option>
            <option value="http">http (REST Remote)</option>
          </select>
        </div>

        <div>
          <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.publisherLabel')}</label>
          <input
            type="text"
            value={newPublisher}
            onChange={(e) => onPublisherChange(e.target.value)}
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
          />
        </div>
      </div>

      <div>
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.commandLabel')}</label>
        <input
          type="text"
          value={newCommand}
          onChange={(e) => onCommandChange(e.target.value)}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand font-mono text-sm h-9 placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div>
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.toolsLabel')}</label>
        <input
          type="text"
          value={newTools}
          onChange={(e) => onToolsChange(e.target.value)}
          placeholder={t('mcp.form.toolsPlaceholder')}
          className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand h-9 text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
        />
      </div>

      <div>
        <label className="block text-store-ink-soft font-semibold mb-1 ">{t('mcp.form.descLabel')}</label>
        <textarea
          value={newDesc}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder={t('mcp.form.descPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 bg-store-field border border-store-line rounded-store-control text-store-ink outline-none focus:border-store-brand resize-none text-sm placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
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
          className="px-4 py-2 rounded-store-control bg-store-info hover:bg-store-info-hover text-white font-medium cursor-pointer text-sm"
        >
          {t('mcp.form.submitBtn')}
        </button>
      </div>
    </form>
  );
};
