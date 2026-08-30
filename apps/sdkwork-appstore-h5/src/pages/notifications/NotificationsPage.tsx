import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNotifications, formatApiError } from '@/hooks/useApi';
import { getNotificationService } from '@/bootstrap/sdkClients';
import { isAuthenticated } from '@/bootstrap/iamRuntime';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { AppstoreNotificationItem } from '@sdkwork/appstore-notification-core';

export function NotificationsPage() {
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const { data, loading, error, execute } = useNotifications(authed);
  const [ackBusy, setAckBusy] = useState(false);

  const notifications = data?.items ?? [];
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read && !item.archived).length,
    [notifications],
  );

  async function handleAcknowledgeOne(notificationId: string) {
    setAckBusy(true);
    try {
      await getNotificationService().acknowledge(notificationId);
      await execute();
    } finally {
      setAckBusy(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="返回"
            >
              <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
            </button>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">消息通知</h1>
            {unreadCount > 0 ? (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-[var(--accent)]" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {!authed ? (
        <div className="px-4 py-16 text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-4">登录后查看审核、上架与账户动态。</p>
          <Link to="/login" className="btn-primary inline-flex">
            前往登录
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-sm text-[var(--accent)]">
          {formatApiError(error)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 px-4">
          <Bell className="w-16 h-16 text-[var(--border-strong)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">暂无通知</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm mx-auto">
            开发者审核、上架动态与安装事件将显示于此。
          </p>
        </div>
      ) : (
        <div className="space-y-3 px-4 pb-8">
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              busy={ackBusy}
              onAcknowledge={() => void handleAcknowledgeOne(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  item,
  busy,
  onAcknowledge,
}: {
  item: AppstoreNotificationItem;
  busy: boolean;
  onAcknowledge: () => void;
}) {
  const isUnread = !item.read && !item.archived;

  return (
    <article
      className="card p-4"
      style={isUnread ? { backgroundColor: 'var(--accent-subtle)' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
          {item.desc ? (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.desc}</p>
          ) : null}
          {item.content ? (
            <p className="mt-2 text-sm text-[var(--text-tertiary)] whitespace-pre-line">{item.content}</p>
          ) : null}
          <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">
            {formatNotificationTime(item.time)}
          </p>
          {item.actionUrl ? (
            <a href={item.actionUrl} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
              查看详情
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
        {isUnread ? (
          <button
            type="button"
            disabled={busy}
            onClick={onAcknowledge}
            className="shrink-0 text-xs font-medium text-[var(--accent)] disabled:opacity-50"
          >
            已读
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
