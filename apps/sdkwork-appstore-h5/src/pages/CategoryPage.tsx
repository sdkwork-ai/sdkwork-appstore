import { useParams } from 'react-router-dom';
import { useCatalogCategory } from '@/hooks/catalog';
import { ListingRow } from '@/components/common/ListingRow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * 分类详情页（/category/:id，对齐 PC CategoryPage：渐变头卡 + 应用列表）。
 */
export function CategoryPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, error } = useCatalogCategory(id);

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
            {error ? '分类加载失败，请稍后重试' : '分类不存在或已下架'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
        <h1 className="text-xl font-bold tracking-tight">{data.name}</h1>
        <p className="mt-2 text-sm text-indigo-100">
          {data.description || `浏览「${data.name}」分类下的精选应用`}
        </p>
      </div>

      <section className="px-4 py-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          全部应用 · {data.apps.length}
        </h2>
        <div className="mt-3 space-y-2">
          {data.apps.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">该分类下暂无应用</p>
            </div>
          ) : (
            data.apps.map((app) => <ListingRow key={app.id} app={app} />)
          )}
        </div>
      </section>
    </div>
  );
}
