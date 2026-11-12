import React from 'react';
import { Download, Star, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PluginItem } from '@sdkwork/appstore-pc-core';
import type { PluginsHost } from '@sdkwork/appstore-pc-core';

interface PluginCardFooterProps {
  plugin: PluginItem;
  onToggleEnable: (id: string) => void;
  /** The embedding host's install port, when it provides one. */
  pluginsHost?: PluginsHost;
}

/** How far one card's install got, in this page's lifetime. */
type InstallPhase = 'idle' | 'installing' | 'installed' | 'failed';

export const PluginCardFooter: React.FC<PluginCardFooterProps> = ({ plugin, onToggleEnable, pluginsHost }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = React.useState<InstallPhase>('idle');
  // A catalog entry is installable only when both halves exist: the host's
  // install port and the entry's published source. Anything else keeps the
  // catalog's own enable state.
  const installable = pluginsHost !== undefined && plugin.source !== undefined;

  const install = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    if (pluginsHost === undefined) return;
    setPhase('installing');
    try {
      await pluginsHost.install(plugin);
      setPhase('installed');
    } catch {
      setPhase('failed');
    }
  };

  const installLabel = phase === 'installing'
    ? t('plugins.status.installing')
    : phase === 'installed'
      ? t('plugins.status.installed')
      : phase === 'failed'
        ? t('plugins.status.installFailed')
        : t('plugins.status.install');

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line-soft ">
      <div className="flex items-center gap-3 text-xs text-store-ink-faint">
        <span className="flex items-center gap-1 font-semibold text-store-warning">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          {plugin.rating}
        </span>
        <span className="flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          {(plugin.downloadsCount / 1000).toFixed(1)}k
        </span>
      </div>

      {installable ? (
        <button
          onClick={(event) => { void install(event) }}
          disabled={phase === 'installing'}
          aria-label={`${installLabel}: ${plugin.name}`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-store-control text-xs font-medium transition-all shadow-sm ${
            phase === 'installed'
              ? 'bg-store-success hover:bg-store-success text-white'
              : phase === 'failed'
                ? 'bg-store-subtle text-store-ink-soft '
                : 'bg-store-brand hover:bg-store-brand text-white '
          }`}
        >
          {phase === 'installed'
            ? <CheckCircle2 className="w-3.5 h-3.5" />
            : <Download className="w-3.5 h-3.5" />}
          <span>{installLabel}</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnable(plugin.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-store-control text-xs font-medium transition-all shadow-sm ${
            plugin.enabled
              ? 'bg-store-success hover:bg-store-success text-white'
              : 'bg-store-subtle hover:bg-store-raised text-store-ink-soft '
          }`}
        >
          {plugin.enabled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('plugins.status.enabled')}</span>
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" />
              <span>{t('plugins.status.disabled')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
