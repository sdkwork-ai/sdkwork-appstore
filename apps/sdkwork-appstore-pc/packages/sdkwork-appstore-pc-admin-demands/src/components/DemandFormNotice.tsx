import type { ReactNode } from 'react';

interface DemandFormNoticeProps {
  message: string;
  tone: 'success' | 'info' | 'warning';
  children?: ReactNode;
}

const TONE_CLASSES: Record<DemandFormNoticeProps['tone'], string> = {
  success: 'border-store-success/40 bg-store-success-soft text-store-success',
  info: 'border-store-line bg-store-subtle text-store-ink-soft',
  warning: 'border-store-warning/40 bg-store-warning-soft text-store-warning',
};

/** Inline outcome notice shared by the demand console forms. */
export function DemandFormNotice({ children, message, tone }: DemandFormNoticeProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${TONE_CLASSES[tone]}`} role="status">
      <p className="font-medium">{message}</p>
      {children}
    </div>
  );
}
