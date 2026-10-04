import React, { useState } from 'react';
import { Key, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiCredential } from '../../services/api';
import { ApiCredentialRow } from './ApiCredentialRow';

interface ApiCredentialsCardProps {
  credentials: ApiCredential[];
  onGenerateKey: (name: string) => void;
  onRevokeKey: (id: string) => void;
}

export const ApiCredentialsCard: React.FC<ApiCredentialsCardProps> = ({
  credentials,
  onGenerateKey,
  onRevokeKey,
}) => {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCopy = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    onGenerateKey(newKeyName);
    setNewKeyName('');
    setIsCreating(false);
  };

  return (
    <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm space-y-3 ">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-store-ink flex items-center gap-2 ">
          <Key className="w-4 h-4 text-store-warning" />
          <span>{t('console.apiKeys.cardTitle', 'API 密钥与 SDK 凭证')}</span>
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs text-store-warning hover:underline font-bold flex items-center gap-1 cursor-pointer "
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('console.apiKeys.createBtn', '新建 Key')}</span>
        </button>
      </div>

      <p className="text-xs text-store-ink-faint">
        {t('console.apiKeys.subtitle', '用于 Node.js / Python 后端集成 SDKWork API 接口的专属 Client Secret 凭证:')}
      </p>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-3 bg-store-surface rounded-store-control border border-store-warning/30 space-y-2 ">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder={t('console.apiKeys.namePlaceholder', '密钥标识 (例如: Production Server Key)')}
            required
            className="w-full px-3 bg-store-field border border-store-line rounded-store-control text-sm outline-none text-store-ink h-9 placeholder:text-store-ink-faint transition-colors focus:border-store-brand focus:ring-2 focus:ring-store-brand/25"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 rounded-store-control text-xs text-store-ink-faint hover:bg-store-subtle cursor-pointer font-medium"
            >
              {t('common.actions.cancel', '取消')}
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-store-control text-xs bg-store-warning hover:bg-store-warning text-white font-medium cursor-pointer"
            >
              {t('console.apiKeys.submitBtn', '生成 API Secret')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {credentials.map((cred) => (
          <ApiCredentialRow
            key={cred.id}
            cred={cred}
            copiedId={copiedId}
            onCopy={handleCopy}
            onRevokeKey={onRevokeKey}
          />
        ))}
      </div>
    </div>
  );
};

