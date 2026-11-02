import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DemandClaimStatus } from '@sdkwork/appstore-pc-core';
import { demandClaimStatusClass } from './demandClaimFormat';

interface DemandClaimStatusBadgeProps {
  status: DemandClaimStatus;
  className?: string;
}

/**
 * One claim status pill. The label comes from the shared dictionary and the
 * tone from the status group, so a claim looks the same on the list, the
 * detail page, and the timeline.
 */
export const DemandClaimStatusBadge: React.FC<DemandClaimStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${demandClaimStatusClass(status)} ${className}`}
      data-claim-status={status}
    >
      {t(`demands.myClaims.status.${status}`)}
    </span>
  );
};
