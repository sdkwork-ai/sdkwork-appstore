import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ConsoleNotificationAlertProps {
  message: string;
}

export const ConsoleNotificationAlert: React.FC<ConsoleNotificationAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-3.5 bg-store-success/10 border border-store-success/30 text-store-success rounded-store-control text-xs font-semibold flex items-center gap-2 animate-fade-in">
      <CheckCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
