import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Users, MessageSquare, Send } from 'lucide-react';
import { useAiHubApps, useAiModels, generateAiCompletion, AI_PROMPT_PRESETS } from '@/hooks/aiLab';
import { useExperts } from '@/hooks/catalog';
import { getAiPreviewAgentId } from '@/services/aiLabClients';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type AiHubTab = 'experts' | 'apps' | 'sandbox';

const TABS: ReadonlyArray<{ key: AiHubTab; label: string; icon: typeof Users }> = [
  { key: 'experts', label: '专家', icon: Users },
  { key: 'apps', label: 'AI 应用', icon: Sparkles },
  { key: 'sandbox', label: 'AI 沙盒', icon: MessageSquare },
];

/**
 * AI 中心页（/ai-hub，对齐 PC AIHubPage 三 tab 结构：
 * experts 专家清单 / apps AI 应用网格 / sandbox agents 预览对话）。
 */
export function AIHubPage() {
  const [activeTab, setActiveTab] = useState<AiHubTab>('experts');
  const [expertQuery, setExpertQuery] = useState('');

  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-br from-violet-600 to-indigo-700 px-4 pb-5 pt-6 text-white">
        <h1 className="text-xl font-bold">AI 中心</h1>
        <p className="mt-1 text-sm text-violet-100">专家、AI 应用与沙盒，一站式 AI Lab 入口</p>
      </header>

      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]">
        <div className="flex" role="tablist" aria-label="AI 中心分区">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'experts' && <ExpertsTab query={expertQuery} onQueryChange={setExpertQuery} />}
      {activeTab === 'apps' && <AiAppsTab />}
      {activeTab === 'sandbox' && <SandboxTab />}

      <div className="grid grid-cols-2 gap-3 px-4 pb-6 pt-2">
        <Link to="/experts" className="card card-press flex items-center gap-2 p-3.5 text-sm font-medium text-[var(--text-primary)]">
          <Users className="h-4 w-4 text-violet-500" />
          专家
        </Link>
        <Link to="/plugins" className="card card-press flex items-center gap-2 p-3.5 text-sm font-medium text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          扩展插件
        </Link>
        <Link to="/skills" className="card card-press flex items-center gap-2 p-3.5 text-sm font-medium text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-amber-500" />
          技能中心
        </Link>
        <Link to="/mcp" className="card card-press flex items-center gap-2 p-3.5 text-sm font-medium text-[var(--text-primary)]">
          <ServerIcon />
          MCP 服务
        </Link>
        <Link to="/templates" className="card card-press col-span-2 flex items-center gap-2 p-3.5 text-sm font-medium text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          应用模板
        </Link>
      </div>
    </div>
  );
}

function ServerIcon() {
  return <span aria-hidden className="text-sky-500">⬡</span>;
}

function ExpertsTab({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const { data, loading, error } = useExperts(query);
  const experts = (data?.experts ?? []).slice(0, 6);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5">
        <Search className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索专家"
          aria-label="搜索专家"
          className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>
      {error ? (
        <div className="card mt-3 p-6 text-center" role="alert">
          <p className="text-sm text-[var(--text-secondary)]">专家目录加载失败，请稍后重试</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {experts.map((expert) => (
            <Link
              key={expert.id}
              to="/experts"
              className="card card-press flex items-center gap-3 p-3"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #7c3aed)' }}
              >
                {expert.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {expert.name}
                </h3>
                <p className="truncate text-xs text-[var(--text-tertiary)]">{expert.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-500">
                {expert.category}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link
        to="/experts"
        className="mt-3 block text-center text-xs font-medium text-[var(--accent)]"
      >
        查看全部专家 →
      </Link>
    </div>
  );
}

function AiAppsTab() {
  const { data: apps, loading, error } = useAiHubApps();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="card mx-4 my-4 p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)]">AI 应用加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-4">
      {(apps ?? []).length === 0 ? (
        <p className="col-span-3 py-8 text-center text-sm text-[var(--text-secondary)]">
          暂无 AI 应用
        </p>
      ) : (
        (apps ?? []).map((app) => (
          <Link
            key={app.id}
            to={`/app/${app.id}`}
            className="card card-press flex flex-col items-center gap-2 p-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-lg">
              ✨
            </div>
            <span className="line-clamp-2 text-center text-[11px] font-medium text-[var(--text-primary)]">
              {app.name}
            </span>
            {app.rating > 0 && (
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {app.rating.toFixed(1)}★
              </span>
            )}
          </Link>
        ))
      )}
    </div>
  );
}

function SandboxTab() {
  const { data: models, loading: modelsLoading } = useAiModels();
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agentId = getAiPreviewAgentId();
  const effectiveModel = selectedModel || models?.[0]?.id || '';

  const handleSend = async () => {
    const content = prompt.trim();
    if (!content || sending) {
      return;
    }
    if (!agentId) {
      setError('AI 预览智能体未配置，请先设置 VITE_AI_PREVIEW_AGENT_ID。');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const result = await generateAiCompletion(content, effectiveModel, agentId);
      setReply(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="card p-4">
        <label htmlFor="ai-model" className="text-xs font-medium text-[var(--text-secondary)]">
          模型
        </label>
        <select
          id="ai-model"
          value={effectiveModel}
          onChange={(event) => setSelectedModel(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
        >
          {modelsLoading && <option value="">加载模型中…</option>}
          {!modelsLoading && (models ?? []).length === 0 && <option value="">暂无可用模型</option>}
          {(models ?? []).map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
              {model.isPopular ? '（默认）' : ''}
            </option>
          ))}
        </select>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {AI_PROMPT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPrompt(preset)}
              className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)]"
            >
              {preset}
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="输入你想询问 AI 的问题…"
          aria-label="AI 对话输入"
          className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
        <button
          type="button"
          disabled={sending || !prompt.trim()}
          onClick={() => void handleSend()}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? '生成中…' : '发送'}
        </button>
        {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
      </div>

      {reply && (
        <div className="card mt-3 p-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)]">AI 回复</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
            {reply}
          </p>
        </div>
      )}
    </div>
  );
}
