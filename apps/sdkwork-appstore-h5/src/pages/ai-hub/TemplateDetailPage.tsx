import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Check, Star, GitFork, LayoutTemplate } from 'lucide-react';
import { useTemplate, useTemplates } from '@/hooks/catalog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function fallbackCliCommand(templateCode: string): string {
  return `npx create-sdkwork-app my-app --template ${templateCode}`;
}

/**
 * 模板详情页（/template/:id 与别名 /templates/:id，对齐 PC TemplateDetailPage：
 * 面包屑 → 头卡 → 指标条 → 详情 → CLI 复制 → 推荐模板）。
 */
export function TemplateDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: template, loading, error } = useTemplate(id);
  const { data: siblings } = useTemplates('APP', '');
  const [copied, setCopied] = useState(false);
  const [cliError, setCliError] = useState<string | null>(null);

  const handleCopyCli = async () => {
    if (!template) {
      return;
    }
    const command = fallbackCliCommand(template.templateCode || template.id);
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCliError('复制失败，请手动复制命令');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="px-4 py-4">
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {error ? '模板加载失败，请稍后重试' : '模板不存在或已下架'}
          </p>
          <Link to="/templates" className="btn-primary mt-4 inline-flex text-sm">
            返回模板列表
          </Link>
        </div>
      </div>
    );
  }

  const related = (siblings ?? []).filter((item) => item.id !== template.id).slice(0, 4);

  return (
    <div className="animate-fade-in">
      <nav aria-label="面包屑" className="px-4 pt-4 text-xs text-[var(--text-tertiary)]">
        <Link to="/templates" className="hover:text-[var(--accent)]">
          应用模板
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--text-secondary)]">{template.name}</span>
      </nav>

      <div className="mx-4 mt-3 rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-600 p-6 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <LayoutTemplate className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight">{template.name}</h1>
        <p className="mt-1 text-xs text-indigo-100">
          {template.author}
          {template.categoryCode && ` · ${template.categoryCode}`}
        </p>
      </div>

      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        <div className="card flex flex-col items-center p-3">
          <span className="flex items-center gap-1 text-sm font-bold text-[var(--text-primary)]">
            <Star className="h-3.5 w-3.5" />
            {template.stars}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">Stars</span>
        </div>
        <div className="card flex flex-col items-center p-3">
          <span className="flex items-center gap-1 text-sm font-bold text-[var(--text-primary)]">
            <GitFork className="h-3.5 w-3.5" />
            {template.forks}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">Forks</span>
        </div>
        <button
          type="button"
          onClick={() => void handleCopyCli()}
          className="card card-press flex flex-col items-center p-3"
        >
          <span className="flex items-center gap-1 text-sm font-bold text-[var(--accent)]">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? '已复制' : 'CLI'}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">复制创建命令</span>
        </button>
      </div>
      {cliError && <p className="px-4 pt-2 text-xs text-[var(--danger)]">{cliError}</p>}

      <section className="px-4 py-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">模板介绍</h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {template.description || '该模板暂无详细介绍。'}
        </p>
        <dl className="mt-3 space-y-2 text-xs">
          {[
            ['模板代码', template.templateCode],
            ['框架', template.framework],
            ['语言', template.language],
            ['分类', template.categoryCode],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt className="w-16 shrink-0 text-[var(--text-tertiary)]">{label}</dt>
                <dd className="min-w-0 break-all text-[var(--text-primary)]">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      {related.length > 0 && (
        <section className="px-4 pb-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">推荐模板</h2>
          <div className="mt-3 space-y-2">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/template/${item.id}`}
                className="card card-press flex items-center gap-3 p-3"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <LayoutTemplate className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.name}
                  </h3>
                  <p className="truncate text-[11px] text-[var(--text-tertiary)]">
                    {item.author} · {item.stars} Stars
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
