import { useState } from 'react';
import { useTopCharts } from '@/hooks/catalog';
import { ListingRow } from '@/components/common/ListingRow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type ChartTab = 'free' | 'paid';

const TABS: ReadonlyArray<{ key: ChartTab; label: string }> = [
  { key: 'free', label: '免费榜' },
  { key: 'paid', label: '付费榜' },
];

/**
 * 排行榜页（/charts，对齐 PC ChartsPage 双榜结构）。
 * 榜单快照给出 listingId 序列，精确解析后按榜序重排。
 */
export function ChartsPage() {
  const [activeTab, setActiveTab] = useState<ChartTab>('free');
  const { data: apps, loading, error } = useTopCharts(activeTab);

  return (
    <div className="animate-fade-in">
      <header className="page-header px-4 py-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">排行榜</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">看看大家都在用什么</p>
      </header>

      <div className="px-4">
        <div
          className="flex rounded-full bg-[var(--bg-secondary)] p-1"
          role="tablist"
          aria-label="榜单切换"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-4 py-4">
        {error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--danger)]">榜单加载失败，请稍后重试</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (apps ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">榜单暂无内容</p>
          </div>
        ) : (
          (apps ?? []).map((app) => (
            <ListingRow key={app.id} app={app} rank={app.chartRank} />
          ))
        )}
      </div>
    </div>
  );
}
