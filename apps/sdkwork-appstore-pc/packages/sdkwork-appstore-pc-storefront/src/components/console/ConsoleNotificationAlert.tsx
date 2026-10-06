import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ConsoleNotificationAlertProps {
  message: string;
  /** Visual/semantic tone; defaults to the success banner. */
  tone?: 'success' | 'error';
}

export const ConsoleNotificationAlert: React.FC<ConsoleNotificationAlertProps> = ({
  message,
  tone = 'success',
}) => {
  if (!message) return null;

  const isError = tone === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`p-3.5 border rounded-store-control text-xs font-semibold flex items-center gap-2 animate-fade-in ${
        isError
          ? 'bg-store-danger/10 border-store-danger/30 text-store-danger'
          : 'bg-store-success/10 border border-store-success/30 text-store-success'
      }`}
    >
      {isError ? (
        <AlertTriangle className="w-4 h-4 shrink-0" />
      ) : (
        <CheckCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
