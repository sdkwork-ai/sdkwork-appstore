import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'
import { useInstall } from '../install'

interface HandheldGameCardProps {
  game: AppItem
}

/** Handheld-game catalog card with install/open action. */
export function HandheldGameCard({ game }: HandheldGameCardProps) {
  const { t } = useTranslation()
  const { installApp, openApp, isInstalled, isDownloading } = useInstall()
  const installed = isInstalled(game.id)
  const downloading = isDownloading(game.id)

  return (
    <Link
      to={`/app/${game.id}`}
      className="group relative rounded-store-card overflow-hidden bg-store-subtle/60 dark:bg-store-surface border border-store-line hover:border-store-brand/50 p-4 flex flex-col justify-between transition-all "
    >
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${game.iconColor} group-hover:scale-105 transition-transform`}>
          <DynamicIcon name={game.icon || 'Sparkles'} className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-store-ink truncate group-hover:text-store-brand transition-colors ">
            {game.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-store-ink-faint">
            <span className="flex items-center gap-0.5 text-store-warning font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />
              {game.rating}
            </span>
            <span>•</span>
            <span className="truncate">{game.developer}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line ">
        <span className="text-xs text-store-ink-faint font-medium">{game.size}</span>
        <button
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (installed) openApp(game)
            else installApp(game)
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            installed
              ? 'bg-store-brand/15 text-store-brand dark:bg-store-brand/20 '
              : downloading
                ? 'bg-store-warning/20 text-store-warning'
                : 'bg-store-brand text-white hover:bg-store-brand shadow-sm'
          }`}
        >
          {downloading ? t('common.actions.downloading') : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
        </button>
      </div>
    </Link>
  )
}
