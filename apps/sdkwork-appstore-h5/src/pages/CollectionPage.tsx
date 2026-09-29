import { useParams } from 'react-router-dom';
import { useCatalogCollection } from '@/hooks/catalog';
import { ListingRow } from '@/components/common/ListingRow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * 编辑合集详情页（/collection/:id，对齐 PC CollectionPage：
 * 渐变头卡 + 按 listingId 精确解析并保序的应用列表）。
 */
export function CollectionPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, error } = useCatalogCollection(id);

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
            {error ? '合集加载失败，请稍后重试' : '合集不存在或已下架'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-fuchsia-600 to-indigo-700 p-6 text-white">
        <h1 className="text-xl font-bold tracking-tight">{data.name}</h1>
        {data.description && (
          <p className="mt-2 text-sm text-fuchsia-100">{data.description}</p>
        )}
      </div>

      <section className="px-4 py-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          精选应用 · {data.apps.length}
        </h2>
        <div className="mt-3 space-y-2">
          {data.apps.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">该合集暂无应用</p>
            </div>
          ) : (
            data.apps.map((app) => <ListingRow key={app.id} app={app} />)
          )}
        </div>
      </section>
    </div>
  );
}
