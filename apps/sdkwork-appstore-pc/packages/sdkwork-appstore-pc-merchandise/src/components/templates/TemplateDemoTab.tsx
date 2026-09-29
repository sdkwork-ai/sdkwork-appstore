import React, { useState } from 'react';
import { RotateCcw, Send, Sparkles, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';

interface TemplateDemoTabProps {
  template: TemplateItem;
}

export const TemplateDemoTab: React.FC<TemplateDemoTabProps> = ({ template }) => {
  const { t } = useTranslation();
  const [demoInput, setDemoInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Welcome to ${template.title}!`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!demoInput.trim() || loading) return;

    const userText = demoInput.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setDemoInput('');
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `[${template.title} Engine]: Received command "${userText}". Execution completed with ${template.framework} architecture.`,
        },
      ]);
      setLoading(false);
    }, 600);
  };

  const resetDemo = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Reset complete. Active template: ${template.title}`,
      },
    ]);
  };

  return (
    <div className="space-y-3 animate-fade-in text-xs">
      {/* Simulation Window Frame */}
      <div className="rounded-store-card border border-store-line bg-slate-950 overflow-hidden shadow-lg ">
        {/* Top Browser Toolbar */}
        <div className="px-3 py-2 bg-slate-900 border-b border-store-line flex items-center justify-between text-store-ink-faint">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-store-danger inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-store-warning inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-store-success inline-block" />
            <span className="text-[10px] font-mono text-store-ink-faint ml-2">
              {template.demoUrl || 'https://sandbox.template.local'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemo}
              className="p-1 hover:bg-slate-800 rounded-store-control text-store-ink-faint hover:text-white transition-colors cursor-pointer text-xs font-medium"
              title={t('templates.detail.resetDemo')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-store-success/20 text-store-success text-xs font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {t('templates.detail.running')}
            </span>
          </div>
        </div>

        {/* Live Chat / Interaction Panel */}
        <div className="p-4 h-60 overflow-y-auto space-y-3 custom-scrollbar bg-slate-950 text-slate-100">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 ${template.iconColor}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-store-card text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-store-brand text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-store-line rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-store-brand text-xs font-medium">
              <span className="w-3 h-3 border-2 border-store-brand/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>{t('aihub.sandbox.generating')}</span>
            </div>
          )}
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSend} className="p-2 bg-slate-900 border-t border-store-line flex gap-2">
          <input
            type="text"
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value)}
            placeholder={t('templates.detail.demoInputPlaceholder', { title: template.title })}
            className="flex-1 bg-store-field border border-store-line rounded-store-control px-3 text-sm text-store-ink outline-none focus:border-store-brand font-medium h-9 placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
          />
          <button
            type="submit"
            disabled={loading || !demoInput.trim()}
            className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-store-control font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors text-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('templates.detail.sendBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
