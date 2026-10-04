import React from 'react';
import { Cpu, Server, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';

interface TemplateTechStackTabProps {
  template: TemplateItem;
}

export const TemplateTechStackTab: React.FC<TemplateTechStackTabProps> = ({ template }) => {
  const { t } = useTranslation();
  const stack = template.techStack || [
    'React 18',
    'TypeScript',
    'Vite 5',
    'Express v5',
    'Tailwind CSS',
    'Zustand',
    'Lucide React',
  ];

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Framework & Tech Badges */}
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line ">
        <h4 className="text-[11px] font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-store-brand" />
          {t('templates.detail.techStackTitle')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-store-control bg-store-surface border border-store-line font-semibold text-store-ink shadow-sm flex items-center gap-1.5 "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-store-brand" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line ">
        <h4 className="text-[11px] font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-store-info" />
          {t('templates.detail.archTitle')}
        </h4>
        <p className="text-store-ink-soft leading-relaxed font-normal ">
          {template.architecture}
        </p>
      </div>

      {/* Environment Config Example */}
      <div className="p-4 rounded-store-card bg-slate-900 text-store-brand border border-store-line">
        <h4 className="text-[11px] font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-store-warning" />
          {t('templates.detail.envExampleTitle')}
        </h4>
        <pre className="font-mono text-[11px] text-store-success bg-store-overlay p-3 rounded-store-control overflow-x-auto leading-relaxed border border-store-line select-text">
{`# Server-Side API Secrets
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_project_id
STRIPE_SECRET_KEY=sk_test_...

# Client Public Config
VITE_APP_TITLE="${template.title}"
VITE_ENABLE_ANALYTICS=true`}
        </pre>
      </div>
    </div>
  );
};
