import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { MiniGameCard } from './MiniGameCard'

interface MiniGamesCarouselProps {
  apps: AppItem[]
}

/** Horizontal mini-game scroller used by Discover and Games. */
export function MiniGamesCarousel({ apps }: MiniGamesCarouselProps) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <Link
          to="/search?category=miniGames"
          className="flex items-center gap-1.5 group text-sm font-bold text-store-ink hover:text-store-brand transition-colors "
        >
          <span>{t('discover.sections.miniGames')}</span>
          <ChevronRight className="w-4 h-4 text-store-ink-faint group-hover:text-store-brand transition-colors" />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={scrollLeft}
            className="p-1 rounded-full text-store-ink-faint hover:text-gray-200 hover:bg-store-raised transition-colors text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-1 rounded-full text-store-ink-faint hover:text-gray-200 hover:bg-store-raised transition-colors text-xs font-medium"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none custom-scrollbar"
      >
        {apps.map((game) => (
          <MiniGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
