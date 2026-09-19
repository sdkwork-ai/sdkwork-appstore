import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ConsoleNotificationAlertProps {
  message: string;
}

export const ConsoleNotificationAlert: React.FC<ConsoleNotificationAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
      <CheckCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
