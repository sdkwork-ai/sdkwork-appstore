import React from 'react';
import { ExternalLink, CheckCircle2, Circle, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import type { PluginsHost } from '@sdkwork/appstore-pc-core';

interface PluginModalFooterProps {
  plugin: PluginItem;
  onClose: () => void;
  onToggleEnable: (id: string) => void;
  /** The embedding host's install port, when it provides one. */
  pluginsHost?: PluginsHost;
}

export const PluginModalFooter: React.FC<PluginModalFooterProps> = ({
  plugin,
  onClose,
  onToggleEnable,
  pluginsHost,
}) => {
  const { t } = useTranslation();
  const [installing, setInstalling] = React.useState(false);
  const installable = pluginsHost !== undefined && plugin.source !== undefined;

  const install = async (): Promise<void> => {
    if (pluginsHost === undefined) return;
    setInstalling(true);
    try {
      await pluginsHost.install(plugin);
      onClose();
    } catch {
      // The host owns the failure report; the card keeps the catalog usable.
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-store-line-soft flex items-center justify-between ">
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-1 text-xs text-store-brand hover:underline font-medium"
      >
        <span>{t('plugins.modal.viewOpenApi', '查看 OpenAPI 接口文档')}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-store-control text-xs font-medium text-store-ink-soft hover:bg-store-subtle cursor-pointer transition-colors "
        >
          {t('common.actions.close')}
        </button>
        {installable ? (
          <button
            onClick={() => { void install() }}
            disabled={installing}
            className="flex items-center gap-2 px-5 py-2 rounded-store-control text-xs font-medium text-white shadow-md transition-all cursor-pointer bg-store-brand hover:bg-store-brand "
          >
            <Download className="w-4 h-4" />
            <span>{installing ? t('plugins.status.installing') : t('plugins.status.install')}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onToggleEnable(plugin.id);
              onClose();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-store-control text-xs font-medium text-white shadow-md transition-all cursor-pointer ${
              plugin.enabled
                ? 'bg-store-danger hover:bg-store-danger-hover'
                : 'bg-store-success hover:bg-store-success-hover'
            }`}
          >
            {plugin.enabled ? (
              <>
                <Circle className="w-4 h-4" />
                <span>{t('plugins.modal.disablePlugin', '禁用插件')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('plugins.modal.enablePlugin', '启用插件')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
