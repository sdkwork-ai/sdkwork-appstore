import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

/**
 * Security policy card.
 *
 * The App Store app API exposes no security-policy surface for publishers,
 * so this renders an explicit static state instead of an interactive toggle
 * whose calls could never succeed (`BACKEND_UI_SPEC.md`: the console never
 * fabricates capabilities).
 */
export const SecurityPolicyCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm space-y-2 ">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-store-ink-faint" />
        <h2 className="text-sm font-bold text-store-ink ">
          {t('console.security.title')}
        </h2>
      </div>
      <p className="text-xs text-store-ink-faint ">
        {t('console.security.unavailable', '安全策略能力暂未由 App Store 后端提供，当前保持安全默认配置。')}
      </p>
    </div>
  );
};
