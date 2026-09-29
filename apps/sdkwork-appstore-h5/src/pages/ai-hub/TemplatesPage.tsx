import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, LayoutTemplate, Star, GitFork } from 'lucide-react';
import { useTemplates } from '@/hooks/catalog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * 应用模板页（/templates，AI Lab 独立页面）。
 * 模板清单来自目录 template 域（templateType=APP），
 * 布局与专家页一致：头部横幅 + 搜索 + 卡片列表 + 空态。
 */
export function TemplatesPage() {
  const [query, setQuery] = useState('');
  const { data: templates, loading, error } = useTemplates('APP', query);

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-indigo-600 to-sky-600 px-4 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">应用模板</h1>
        <p className="mt-1 text-sm text-indigo-100">从经过验证的模板快速启动你的应用</p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-indigo-100" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索模板"
            aria-label="搜索模板"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-indigo-200"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 px-4 py-4">
        {error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">模板加载失败，请稍后重试</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (templates ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <LayoutTemplate className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">没有匹配的模板</p>
          </div>
        ) : (
          (templates ?? []).map((template) => (
            <Link
              key={template.id}
              to={`/template/${template.id}`}
              className="card card-press p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {template.name}
                  </h3>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    {template.author}
                    {template.categoryCode && ` · ${template.categoryCode}`}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3" />
                    {template.stars}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <GitFork className="h-3 w-3" />
                    {template.forks}
                  </span>
                </div>
              </div>
              {template.description && (
                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {template.description}
                </p>
              )}
              {(template.framework || template.language) && (
                <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
                  {[template.framework, template.language].filter(Boolean).join(' · ')}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
