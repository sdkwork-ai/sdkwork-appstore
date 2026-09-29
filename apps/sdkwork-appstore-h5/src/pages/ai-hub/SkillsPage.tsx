import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, LogIn } from 'lucide-react';
import { useSkills, installSkill } from '@/hooks/aiLab';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { isAuthenticated } from '@/AuthGate';

/**
 * 技能中心页（/skills，AI Lab 独立页面）。
 * 技能清单来自 skills 域 marketplace；安装走已发布工件
 * （卸载未由 Skills app SDK 暴露，与 PC 端一致显式报错）。
 */
export function SkillsPage() {
  const [query, setQuery] = useState('');
  const { data: skills, loading, error, execute } = useSkills(query);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const authed = isAuthenticated();

  const handleInstall = async (skill: { id: string; packageId: string; version: string }) => {
    setInstallingId(skill.id);
    setActionError(null);
    try {
      await installSkill(skill);
      await execute();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '安装失败，请稍后重试');
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">技能中心</h1>
        <p className="mt-1 text-sm text-amber-100">为智能体安装可复用的领域技能</p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-amber-100" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索技能"
            aria-label="搜索技能"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-amber-200"
          />
        </div>
      </header>

      {!authed && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <LogIn className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />
          <p className="flex-1 text-xs text-[var(--text-secondary)]">
            登录后可浏览完整技能市场并安装技能
          </p>
          <Link to="/login" className="text-xs font-medium text-[var(--accent)]">
            去登录
          </Link>
        </div>
      )}

      <div className="space-y-3 px-4 py-4">
        {actionError && <p className="text-xs text-[var(--danger)]">{actionError}</p>}
        {error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              技能市场加载失败，登录后重试可查看完整清单
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (skills ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <Zap className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">没有匹配的技能</p>
          </div>
        ) : (
          (skills ?? []).map((skill) => (
            <article key={skill.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {skill.name}
                  </h3>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    v{skill.version} · {skill.category} · {skill.installs} 次安装
                  </p>
                </div>
                {skill.installed ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600">
                    已安装
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!authed || installingId === skill.id}
                    onClick={() =>
                      void handleInstall({
                        id: skill.id,
                        packageId: skill.id,
                        version: skill.version,
                      })
                    }
                    className="shrink-0 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {installingId === skill.id ? '安装中…' : '安装'}
                  </button>
                )}
              </div>
              {skill.description && (
                <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {skill.description}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
