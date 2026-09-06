import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  APP_PLATFORM_GROUPS,
  getPlatformGroupMeta,
  platformGroupsForCodes,
  type AppPlatformGroupKey,
} from '@/platforms';

interface PlatformBadgesProps {
  /** 原始平台代码列表（android / windows / miniprogram-wechat / h5 等）。 */
  platforms?: readonly string[] | null
  /** 超出数量折叠为 +N（默认 2）。 */
  max?: number;
  className?: string;
}

/** 卡片上的平台标识徽标（安卓 / PC网页 / H5网页 / PC桌面 / ...）。 */
export function PlatformBadges({ platforms, max = 2, className }: PlatformBadgesProps) {
  const groups = platformGroupsForCodes(platforms);
  if (groups.length === 0) {
    return null;
  }
  const shown = groups.slice(0, max);
  const overflow = groups.length - shown.length;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className ?? ''}`}>
      {shown.map((key) => {
        const meta = getPlatformGroupMeta(key);
        if (!meta) {
          return null;
        }
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-semibold leading-tight ${meta.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="rounded-full border border-gray-300/60 bg-gray-100 px-1.5 py-px text-[10px] font-semibold leading-tight text-gray-500">
          +{overflow}
        </span>
      )}
    </span>
  );
}

export type PlatformFilterValue = 'all' | AppPlatformGroupKey;

interface PlatformFilterBarProps {
  activeFilter: PlatformFilterValue;
  onSelectFilter: (filter: PlatformFilterValue) => void;
}

/** 平台过滤条（全部 / 安卓 / iOS / 鸿蒙 / PC桌面 / PC网页 / H5网页 / 小程序 / 浏览器扩展）。 */
export function PlatformFilterBar({ activeFilter, onSelectFilter }: PlatformFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleGroups = expanded ? APP_PLATFORM_GROUPS : APP_PLATFORM_GROUPS.slice(0, 5);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onSelectFilter('all')}
        className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          activeFilter === 'all'
            ? 'text-white'
            : 'card text-[var(--text-secondary)]'
        }`}
        style={activeFilter === 'all' ? { backgroundColor: 'var(--accent)' } : undefined}
      >
        全部平台
      </button>
      {visibleGroups.map((group) => (
        <button
          key={group.key}
          onClick={() => onSelectFilter(group.key)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === group.key
              ? 'text-white'
              : 'card text-[var(--text-secondary)]'
          }`}
          style={activeFilter === group.key ? { backgroundColor: 'var(--accent)' } : undefined}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${group.dotClass}`} />
          {group.label}
        </button>
      ))}
      <button
        type="button"
        aria-label={expanded ? '收起平台' : '展开平台'}
        onClick={() => setExpanded((prev) => !prev)}
        className="card flex-shrink-0 rounded-full px-2.5 py-1.5 text-[var(--text-tertiary)]"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
