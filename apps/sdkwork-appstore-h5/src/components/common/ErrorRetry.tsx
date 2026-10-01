import { RefreshCw } from 'lucide-react';

/**
 * Standard error banner with retry button.
 *
 * Every data-loading page uses this pattern: when a request fails the user
 * sees a clear message and a one-tap retry button instead of a dead end.
 */
export function ErrorRetry({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ backgroundColor: 'var(--danger-subtle, #fef2f2)' }}
      role="alert"
    >
      <span className="flex-1 text-sm" style={{ color: 'var(--danger, #ef4444)' }}>
        {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: 'var(--accent-subtle, #e0e7ff)', color: 'var(--accent, #4f46e5)' }}
      >
        <RefreshCw className="h-3 w-3" />
        重试
      </button>
    </div>
  );
}
