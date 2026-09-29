import { useParams } from 'react-router-dom';
import { useCatalogEvent } from '@/hooks/catalog';
import { ListingRow } from '@/components/common/ListingRow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return new Date(parsed).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function eventPhase(
  status: string,
  endsAt: string,
): { label: string; className: string } {
  const normalized = status.toLocaleLowerCase();
  if (normalized && normalized !== 'active') {
    return { label: '已结束', className: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]' };
  }
  const end = Date.parse(endsAt);
  if (Number.isFinite(end) && end - Date.now() < 48 * 60 * 60 * 1000) {
    return { label: '即将结束', className: 'bg-red-500/10 text-red-500' };
  }
  return { label: '进行中', className: 'bg-emerald-500/10 text-emerald-500' };
}

/**
 * 限时活动详情页（/events/:id，对齐 PC EventPage：
 * 渐变头卡 + 活动时间/状态徽章 + 参加活动应用保序列表）。
 */
export function EventPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, error } = useCatalogEvent(id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 py-4">
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {error ? '活动加载失败，请稍后重试' : '活动不存在或已结束'}
          </p>
        </div>
      </div>
    );
  }

  const phase = eventPhase(data.status, data.endsAt);

  return (
    <div className="animate-fade-in">
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 p-6 text-white">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${phase.className}`}>
            {phase.label}
          </span>
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight">{data.name}</h1>
        {data.description && <p className="mt-2 text-sm text-violet-100">{data.description}</p>}
        <p className="mt-3 text-xs text-violet-100/90">
          {data.startsAt && `开始 ${formatDateTime(data.startsAt)}`}
          {data.startsAt && data.endsAt && ' · '}
          {data.endsAt && `结束 ${formatDateTime(data.endsAt)}`}
        </p>
      </div>

      <section className="px-4 py-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          活动应用 · {data.apps.length}
        </h2>
        <div className="mt-3 space-y-2">
          {data.apps.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">该活动暂无参加应用</p>
            </div>
          ) : (
            data.apps.map((app) => <ListingRow key={app.id} app={app} />)
          )}
        </div>
      </section>
    </div>
  );
}
