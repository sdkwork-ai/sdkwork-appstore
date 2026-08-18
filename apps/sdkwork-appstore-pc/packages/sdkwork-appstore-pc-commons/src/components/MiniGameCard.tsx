import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'
import { useInstall } from '../install'

interface MiniGameCardProps {
  game: AppItem
}

/** Compact mini-game card with install/open action. */
export function MiniGameCard({ game }: MiniGameCardProps) {
  const { t } = useTranslation()
  const { installApp, openApp, isInstalled, isDownloading } = useInstall()
  const installed = isInstalled(game.id)
  const downloading = isDownloading(game.id)

  return (
    <Link
      to={`/app/${game.id}`}
      className="flex-none w-36 group bg-gray-100/60 dark:bg-[#1f222b] hover:bg-gray-200/80 dark:hover:bg-[#282c38] border border-gray-200/60 dark:border-[#2a2e3a] p-3 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer"
    >
      <div className="relative mb-2">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md ${game.iconColor} overflow-hidden group-hover:scale-105 transition-transform`}>
          <DynamicIcon name={game.icon} className="text-white w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold p-1 rounded-full border-2 border-white dark:border-[#1f222b]">
          <Flame className="w-2.5 h-2.5" />
        </div>
      </div>

      <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate w-full group-hover:text-blue-400 transition-colors">
        {game.name}
      </h4>
      <span className="text-[10px] text-gray-400 mt-0.5 mb-2 truncate w-full">
        {game.category}
      </span>

      <button
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (installed) openApp(game)
          else installApp(game)
        }}
        className={`w-full py-1 rounded-full text-[10px] font-bold transition-all ${
          installed
            ? 'bg-blue-600/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            : downloading
              ? 'bg-amber-500/20 text-amber-500'
              : 'bg-gray-200 dark:bg-[#2e3240] text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#383d4e]'
        }`}
      >
        {downloading ? t('common.actions.downloading') : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
      </button>
    </Link>
  )
}
