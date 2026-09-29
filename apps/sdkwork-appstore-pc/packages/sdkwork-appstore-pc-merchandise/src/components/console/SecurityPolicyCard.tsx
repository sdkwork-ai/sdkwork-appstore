import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConsoleService, SecurityPolicy } from '../../services/api';

export const SecurityPolicyCard: React.FC = () => {
  const { t } = useTranslation();
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    ConsoleService.getSecurityPolicy()
      .then((p) => setPolicy(p))
      .catch(() => setUnavailable(true));
  }, []);

  const handleToggle = async (key: keyof SecurityPolicy) => {
    if (!policy) return;
    setUpdating(true);
    try {
      const updated = await ConsoleService.updateSecurityPolicy({
        [key]: !policy[key],
      });
      setPolicy(updated);
    } catch {
      setUnavailable(true);
    } finally {
      setUpdating(false);
    }
  };

  if (unavailable) {
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
  }

  if (!policy) return null;

  return (
    <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm space-y-3 ">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-store-ink flex items-center gap-2 ">
          <ShieldCheck className="w-4 h-4 text-store-success" />
          <span>{t('console.security.title')}</span>
        </h2>
        {updating && <RefreshCw className="w-3.5 h-3.5 text-store-success animate-spin" />}
      </div>

      <p className="text-xs text-store-ink-faint">
        {t('console.security.crossOrigin')}:
      </p>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-2.5 bg-store-surface rounded-store-control border border-store-line ">
          <div>
            <div className="font-bold text-store-ink ">{t('console.security.mfa')}</div>
            <div className="text-[10px] text-store-ink-faint">{t('console.security.mfaSubtitle')}</div>
          </div>
          <button
            onClick={() => handleToggle('mfaRequired')}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all cursor-pointer text-xs font-medium${
              policy.mfaRequired ? 'bg-store-success justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-store-surface shadow-sm" />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-store-surface rounded-store-control border border-store-line ">
          <div>
            <div className="font-bold text-store-ink ">{t('console.security.ipWhitelist')}</div>
            <div className="text-[10px] text-store-ink-faint">{t('console.security.ipSubtitle')}</div>
          </div>
          <button
            onClick={() => handleToggle('ipWhitelistEnabled')}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all cursor-pointer text-xs font-medium${
              policy.ipWhitelistEnabled ? 'bg-store-success justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-store-surface shadow-sm" />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-store-surface rounded-store-control border border-store-line ">
          <div>
            <div className="font-bold text-store-ink ">{t('console.security.crossOrigin')}</div>
            <div className="text-[10px] text-store-ink-faint">{policy.dataIsolationMode} ({policy.rateLimitPerMin} QPM)</div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-store-success/10 text-store-success text-xs font-medium">
            {t('console.apiKeys.active')}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-store-success font-semibold flex items-center gap-1 pt-1">
        <Lock className="w-3 h-3" />
        <span>{t('console.security.complianceBadge')}</span>
      </div>
    </div>
  );
};

