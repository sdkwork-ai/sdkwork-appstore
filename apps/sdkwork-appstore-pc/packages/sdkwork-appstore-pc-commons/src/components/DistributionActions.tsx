import { useTranslation } from 'react-i18next'
import { Download, Globe, Puzzle, QrCode } from 'lucide-react'
import {
  detectDesktopOs,
  resolveDistributionActions,
  type AppItem,
  type DistributionAction,
} from '@sdkwork/appstore-pc-core'

interface DistributionActionsProps {
  app: AppItem
  /** Handle a web/H5 open action (new independent window). */
  onOpen: (action: DistributionAction) => void
  /** Handle a desktop install action for one OS code. */
  onInstall: (app: AppItem, platform: string) => void
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
 * One action per supported distribution of a listing: direct open for web
 * surfaces, an OS-tagged download button per desktop installer, and scan
 * entries for mobile, mini program, and browser-extension distributions.
 * Used on the listing detail header; catalog cards carry only the primary
 * action (see AppRow).
 */
export function DistributionActions({ app, onOpen, onInstall, onQr, className }: DistributionActionsProps) {
  const { t } = useTranslation()
  const detectedOs = detectDesktopOs()
  const actions = resolveDistributionActions(app, detectedOs)
  if (actions.length === 0) {
    return null
  }

  const buttonClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer '

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {actions.map((action) => {
        if (action.kind === 'open') {
          const label = action.group === 'h5Web'
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
        if (action.kind === 'install') {
          return action.platformCodes.map((code) => {
            const primary = code === detectedOs
            return (
              <button
                key={`${action.group}:${code}`}
                type="button"
                onClick={() => onInstall(app, code)}
                className={`${buttonClass} bg-store-brand/10 text-store-brand border-store-brand/20 hover:bg-store-brand/20 ${
                  primary ? 'ring-1 ring-store-brand/60' : ''
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                {t(`common.distribution.download.${code}`)}
              </button>
            )
          })
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
