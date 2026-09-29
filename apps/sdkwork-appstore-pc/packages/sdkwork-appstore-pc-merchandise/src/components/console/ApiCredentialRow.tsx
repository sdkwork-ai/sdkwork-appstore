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
      className={`p-3 rounded-store-control border transition-all ${
        cred.status === 'revoked'
          ? 'bg-store-subtle/30 dark:bg-store-surface border-store-line opacity-60 '
          : 'bg-store-surface border border-store-line '
      }`}
    >
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-bold text-store-ink ">{cred.name}</span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            cred.status === 'active'
              ? 'bg-store-success/10 text-store-success'
              : 'bg-store-danger/10 text-store-danger'
          }`}
        >
          {cred.status === 'active' ? t('console.apiKeys.active', '已生效') : t('console.apiKeys.revoked', '已作废')}
        </span>
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] text-store-ink-soft ">
        <span className="truncate max-w-[200px]">{secretText.substring(0, 22)}...</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onCopy(cred.id, secretText)}
            className="p-1 hover:text-store-warning text-store-ink-faint cursor-pointer text-xs font-medium"
            title={t('console.apiKeys.copyKey', '复制 Key')}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-store-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {cred.status === 'active' && (
            <button
              onClick={() => onRevokeKey(cred.id)}
              className="p-1 hover:text-store-danger text-store-ink-faint cursor-pointer text-xs font-medium"
              title={t('console.apiKeys.revoke', '作废密钥')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {isCopied && (
        <p className="text-[10px] text-store-success font-bold mt-1">{t('common.actions.copied', '已复制')}</p>
      )}
    </div>
  );
};
