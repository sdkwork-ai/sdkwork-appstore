import React from 'react';

interface AISandboxResponseBadgeProps {
  response: string;
}

export const AISandboxResponseBadge: React.FC<AISandboxResponseBadgeProps> = ({ response }) => {
  if (!response) return null;

  return (
    <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs rounded-store-control font-medium animate-fadeIn">
      {response}
    </div>
  );
};
