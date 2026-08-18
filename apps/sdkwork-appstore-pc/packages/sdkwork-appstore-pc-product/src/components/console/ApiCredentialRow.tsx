import React from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiCredential } from '../../services/api';

interface ApiCredentialRowProps {
  cred: ApiCredential;
  copiedId: string | null;
  onCopy: (id: string, secret: string) => void;
  onRevokeKey: (id: string) => void;
}

export const ApiCredentialRow: React.FC<ApiCredentialRowProps> = ({
  cred,
  copiedId,
  onCopy,
  onRevokeKey,
}) => {
  const { t } = useTranslation();
  const isCopied = copiedId === cred.id;
  const secretText = cred.fullKey || cred.keyPrefix;

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        cred.status === 'revoked'
          ? 'bg-gray-100/30 dark:bg-[#1c1e26] border-gray-200 dark:border-[#282c38] opacity-60'
          : 'bg-white dark:bg-[#20232b] border border-gray-200 dark:border-[#2d313c]'
      }`}
    >
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-bold text-gray-800 dark:text-gray-200">{cred.name}</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            cred.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-rose-500/10 text-rose-500'
          }`}
        >
          {cred.status === 'active' ? t('console.apiKeys.active', '已生效') : t('console.apiKeys.revoked', '已作废')}
        </span>
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] text-gray-600 dark:text-gray-300">
        <span className="truncate max-w-[200px]">{secretText.substring(0, 22)}...</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onCopy(cred.id, secretText)}
            className="p-1 hover:text-amber-500 text-gray-400 cursor-pointer"
            title={t('console.apiKeys.copyKey', '复制 Key')}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {cred.status === 'active' && (
            <button
              onClick={() => onRevokeKey(cred.id)}
              className="p-1 hover:text-rose-500 text-gray-400 cursor-pointer"
              title={t('console.apiKeys.revoke', '作废密钥')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {isCopied && (
        <p className="text-[10px] text-emerald-500 font-bold mt-1">{t('common.actions.copied', '已复制')}</p>
      )}
    </div>
  );
};
