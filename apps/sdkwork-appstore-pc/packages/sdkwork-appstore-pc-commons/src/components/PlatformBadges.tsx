import { useTranslation } from 'react-i18next'
import {
  APP_PLATFORM_GROUPS,
  platformGroupsForCodes,
  type AppPlatformGroupKey,
} from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'

const GROUP_BY_KEY = new Map<AppPlatformGroupKey, (typeof APP_PLATFORM_GROUPS)[number]>(
  APP_PLATFORM_GROUPS.map((group) => [group.key, group]),
)

interface PlatformBadgesProps {
  /** Raw platform codes from the listing (e.g. android, windows, miniprogram-wechat). */
  platforms?: readonly string[] | null
  /** Max badges before collapsing into an overflow chip (default 3). */
  max?: number
  className?: string
}

/** Platform display-group badges for catalog cards (安卓 / PC网页 / H5网页 / PC桌面 / ...). */
export function PlatformBadges({ platforms, max = 3, className }: PlatformBadgesProps) {
  const { t } = useTranslation()
  const groups = platformGroupsForCodes(platforms)
  if (groups.length === 0) {
    return null
  }
  const shown = groups.slice(0, max)
  const overflow = groups.length - shown.length

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className ?? ''}`}>
      {shown.map((key) => {
        const meta = GROUP_BY_KEY.get(key)
        if (!meta) {
          return null
        }
        return (
          <span
            key={key}
            title={t(`common.platformGroups.${meta.i18nKey}`)}
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-semibold leading-tight ${meta.badgeClass}`}
          >
            <DynamicIcon name={meta.icon} className="h-2.5 w-2.5" />
            {t(`common.platformGroups.${meta.i18nKey}`)}
          </span>
        )
      })}
      {overflow > 0 && (
        <span className="rounded-full border border-gray-300/60 bg-gray-100 px-1.5 py-px text-[10px] font-semibold leading-tight text-gray-500 dark:border-gray-700 dark:bg-[#252832] dark:text-gray-400">
          +{overflow}
        </span>
      )}
    </span>
  )
}
