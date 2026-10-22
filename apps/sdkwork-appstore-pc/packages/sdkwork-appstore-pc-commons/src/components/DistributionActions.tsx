import { useTranslation } from 'react-i18next'
import { Globe, Puzzle, QrCode } from 'lucide-react'
import {
  resolveDistributionActions,
  type AppItem,
  type DistributionAction,
} from '@sdkwork/appstore-pc-core'

interface DistributionActionsProps {
  app: AppItem
  /** Handle a web/H5 open action (new independent window). */
  onOpen: (action: DistributionAction) => void
  /** Handle a scan-to-continue action (mobile, mini program, extension). */
  onQr: (app: AppItem, action: DistributionAction) => void
  className?: string
}

const GROUP_QR_KEY: Partial<Record<DistributionAction['group'], string>> = {
  android: 'qrAndroid',
  ios: 'qrIos',
  harmonyos: 'qrHarmonyos',
  miniprogram: 'qrMiniprogram',
  browserExtension: 'qrBrowserExtension',
}

/**
 * The distribution channels that are not desktop installers: direct open for
 * web surfaces and scan entries for mobile, mini program, and browser-extension
 * distributions.
 *
 * Desktop builds do not appear here. On a listing detail page they belong to
 * the install call to action, which resolves the host OS and CPU architecture
 * and lists every build in its own menu; rendering one button per OS here as
 * well would offer the same choice twice with different rules.
 */
export function DistributionActions({ app, onOpen, onQr, className }: DistributionActionsProps) {
  const { t } = useTranslation()
  const actions = resolveDistributionActions(app, null).filter(
    (action) => action.kind !== 'install',
  )
  if (actions.length === 0) {
    return null
  }

  const buttonClass =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer '

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {actions.map((action) => {
        if (action.kind === 'open') {
          const label =
            action.group === 'h5Web'
              ? t('common.distribution.openH5Web')
              : t('common.distribution.openPcWeb')
          return (
            <button
              key={action.group}
              type="button"
              title={action.url ?? t('common.distribution.missingUrl')}
              onClick={() => onOpen(action)}
              className={`${buttonClass} bg-store-info/10 text-store-info border-store-info/20 hover:bg-store-info/20`}
            >
              <Globe className="w-3.5 h-3.5" />
              {label}
            </button>
          )
        }
        return (
          <button
            key={action.group}
            type="button"
            onClick={() => onQr(app, action)}
            className={`${buttonClass} bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20`}
          >
            {action.group === 'browserExtension' ? (
              <Puzzle className="w-3.5 h-3.5" />
            ) : (
              <QrCode className="w-3.5 h-3.5" />
            )}
            {t(`common.distribution.${GROUP_QR_KEY[action.group] ?? 'qrGeneric'}`)}
          </button>
        )
      })}
    </div>
  )
}
