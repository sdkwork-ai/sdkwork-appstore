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
      <div className="rounded-2xl border border-gray-200 dark:border-[#2a2d39] bg-slate-950 overflow-hidden shadow-lg">
        {/* Top Browser Toolbar */}
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[10px] font-mono text-slate-400 ml-2">
              {template.demoUrl || 'https://sandbox.template.local'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemo}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={t('templates.detail.resetDemo')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
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
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
              <span className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>{t('aihub.sandbox.generating')}</span>
            </div>
          )}
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSend} className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value)}
            placeholder={t('templates.detail.demoInputPlaceholder', { title: template.title })}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !demoInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('templates.detail.sendBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
