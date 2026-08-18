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
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39]">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-indigo-500" />
          {t('templates.detail.techStackTitle')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181a21] border border-gray-200 dark:border-[#2f3240] font-semibold text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39]">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-cyan-500" />
          {t('templates.detail.archTitle')}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
          {template.architecture}
        </p>
      </div>

      {/* Environment Config Example */}
      <div className="p-4 rounded-2xl bg-slate-900 text-indigo-200 border border-slate-800">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          {t('templates.detail.envExampleTitle')}
        </h4>
        <pre className="font-mono text-[11px] text-green-400 bg-black/40 p-3 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 select-text">
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
