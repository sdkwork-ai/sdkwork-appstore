import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import { ModerationQueueItem } from '../../services/api';

interface ModerationQueueSectionProps {
  items: ModerationQueueItem[];
  unavailable: boolean;
  decidingId: string | null;
  onDecide: (reviewId: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', reason?: string) => void;
}

function mapStatusKey(status: string): string {
  switch (status.toLocaleUpperCase()) {
    case 'IN_REVIEW':
      return 'admin.moderation.statusInReview';
    case 'DECIDED':
    case 'APPROVED':
    case 'REJECTED':
      return 'admin.moderation.statusDecided';
    default:
      return 'admin.moderation.statusPending';
  }
}

export const ModerationQueueSection: React.FC<ModerationQueueSectionProps> = ({
  items,
  unavailable,
  decidingId,
  onDecide,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>('');
  const [decided, setDecided] = useState(false);

  const handleDecide = (item: ModerationQueueItem, decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    onDecide(item.id, decision, reason.trim() || undefined);
    setDecided(true);
    setReason('');
  };

  return (
    <section className="rounded-3xl p-5 bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-blue-500" />
        {t('admin.moderation.title')}
      </h3>

      {decided && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          {t('admin.moderation.decided')}
        </div>
      )}

      {unavailable ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
          {t('admin.moderation.unavailable')}
        </p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
          {t('admin.moderation.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#20222a] border border-gray-200 dark:border-gray-800 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {item.listingName}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('admin.moderation.submissionType')}: {item.submissionType} ·{' '}
                    {t('admin.moderation.submittedAt')}: {item.submittedAt || '—'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold shrink-0">
                  {t(mapStatusKey(item.status))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t('admin.moderation.reasonPlaceholder')}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 text-[11px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => handleDecide(item, 'APPROVE')}
                  disabled={decidingId === item.id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {t('admin.moderation.approve')}
                </button>
                <button
                  onClick={() => handleDecide(item, 'REQUEST_CHANGES')}
                  disabled={decidingId === item.id}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  {t('admin.moderation.requestChanges')}
                </button>
                <button
                  onClick={() => handleDecide(item, 'REJECT')}
                  disabled={decidingId === item.id}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3 h-3" />
                  {t('admin.moderation.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
