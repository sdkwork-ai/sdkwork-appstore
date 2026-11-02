import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, GitFork, Layers, Sparkles, Star, type LucideIcon } from 'lucide-react';
import { resolveTemplateAppType } from '@sdkwork/appstore-pc-core';
import type { TemplateItem } from '../../types';

/** Which discovery rail a template list belongs to. */
export type TemplateSuggestionKind = 'latest' | 'related' | 'recommended';

interface TemplateSuggestionRailProps {
  kind: TemplateSuggestionKind;
  templates: TemplateItem[];
  /** True while the suggestions request is still in flight. */
  loading?: boolean;
}

const RAIL_ICONS: Record<TemplateSuggestionKind, LucideIcon> = {
  latest: Clock,
  related: Layers,
  recommended: Sparkles,
};

/**
 * One right-column discovery rail on the template detail page. Each item links
 * to that template's own detail page, so the rails keep the reader inside the
 * library instead of opening another overlay.
 */
export const TemplateSuggestionRail: React.FC<TemplateSuggestionRailProps> = ({
  kind,
  templates,
  loading = false,
}) => {
  const { t } = useTranslation();
  const Icon = RAIL_ICONS[kind];

  return (
    <section
      className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-4 shadow-sm"
      data-template-suggestion-rail={kind}
    >
      <header className="flex items-center gap-2 pb-2 border-b border-store-line/60">
        <Icon className="w-4 h-4 text-store-brand" />
        <h3 className="text-sm font-bold text-store-ink">
          {t(`templates.detail.sections.${kind}`)}
        </h3>
      </header>

      {loading ? (
        <p className="py-4 text-center text-[11px] text-store-ink-faint">
          {t('templates.detail.sections.loading')}
        </p>
      ) : templates.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-store-ink-faint">
          {t('templates.detail.sections.empty')}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-store-line/50">
          {templates.map((template) => {
            const appType = resolveTemplateAppType(template.platform);
            return (
              <li key={template.id}>
                <Link
                  to={`/templates/${template.id}`}
                  className="group flex flex-col gap-1 py-2.5 first:pt-1 last:pb-1"
                  data-template-suggestion-item={template.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-[10px] font-medium truncate">
                      {template.category}
                    </span>
                    {template.platform ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-store-field border border-store-line text-[10px] font-medium text-store-ink-faint">
                        {appType ? t(`templates.platforms.${appType.labelKey}`) : template.platform}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold text-store-ink leading-snug line-clamp-2 group-hover:text-store-brand transition-colors">
                    {template.title}
                  </h4>
                  <div className="flex items-center justify-between gap-2 text-[10px] text-store-ink-faint">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3" />
                        {template.stars}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <GitFork className="w-3 h-3" />
                        {template.forks}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 min-w-0 max-w-[58%]">
                      <span className="truncate">{template.framework}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
