import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  AI_EXPERT_CATALOG,
  AI_EXPERT_SCENARIOS,
  AI_EXPERT_TAGS,
} from '@/data/expertsCatalog';

/**
 * 专家页（/experts，AI Lab 独立页面，布局镜像应用模板页：
 * 头部横幅 + 搜索 + 分类筛选 + 卡片列表 + 空态，
 * `specs/AGENTS_DEPENDENCY_BOUNDARY_SPEC.md` section 4）。
 */
export function ExpertsPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('全部');

  const experts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return AI_EXPERT_CATALOG.filter((expert) => {
      const matchesTag = activeTag === '全部' || expert.category === activeTag;
      const matchesQuery =
        normalized === '' ||
        expert.name.toLocaleLowerCase().includes(normalized) ||
        expert.description.toLocaleLowerCase().includes(normalized) ||
        expert.tags.some((tag) => tag.toLocaleLowerCase().includes(normalized));
      return matchesTag && matchesQuery;
    });
  }, [query, activeTag]);

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">专家</h1>
        <p className="mt-1 text-sm text-indigo-100">精选领域专家，即选即用的 AI 顾问团</p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-indigo-100" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索专家或能力关键词"
            aria-label="搜索专家"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-indigo-200"
          />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-4">
        {['全部', ...AI_EXPERT_TAGS].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeTag === tag
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-1 pt-3">
        {AI_EXPERT_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2"
          >
            <p className="text-xs font-semibold text-[var(--text-primary)]">{scenario.title}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {scenario.expertCount} 位专家
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 px-4 py-4">
        {experts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">没有匹配的专家，换个关键词试试</p>
          </div>
        ) : (
          experts.map((expert) => (
            <article key={expert.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #7c3aed)' }}
                >
                  {expert.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {expert.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-500">
                      {expert.category}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">{expert.title}</p>
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                {expert.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {expert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {expert.scenarios.length > 0 && (
                <p className="mt-2.5 text-[11px] text-[var(--text-tertiary)]">
                  适用：{expert.scenarios.join(' / ')}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
