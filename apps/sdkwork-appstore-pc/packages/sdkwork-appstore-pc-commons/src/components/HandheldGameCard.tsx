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
      className="group relative rounded-2xl overflow-hidden bg-gray-100/60 dark:bg-[#1a1c23] border border-gray-200/80 dark:border-[#22252e] hover:border-blue-500/50 p-4 flex flex-col justify-between transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${game.iconColor} group-hover:scale-105 transition-transform`}>
          <DynamicIcon name={game.icon || 'Sparkles'} className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-400 transition-colors">
            {game.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />
              {game.rating}
            </span>
            <span>•</span>
            <span className="truncate">{game.developer}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50 dark:border-[#262934]">
        <span className="text-xs text-gray-400 font-medium">{game.size}</span>
        <button
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (installed) openApp(game)
            else installApp(game)
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            installed
              ? 'bg-blue-600/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
              : downloading
                ? 'bg-amber-500/20 text-amber-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {downloading ? t('common.actions.downloading') : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
        </button>
      </div>
    </Link>
  )
}
