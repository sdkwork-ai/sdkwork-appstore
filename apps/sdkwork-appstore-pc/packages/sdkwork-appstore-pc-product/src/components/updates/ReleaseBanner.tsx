import React from 'react';

interface ReleaseBannerProps {
  version: string;
  title: string;
  description: string;
}

export const ReleaseBanner: React.FC<ReleaseBannerProps> = ({
  version,
  title,
  description,
}) => {
  return (
    <div className="bg-slate-900 dark:bg-[#12141c] border border-slate-800 rounded-2xl p-6 text-white shadow-md">
      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold uppercase tracking-wider">
        {version} Platform Release Notes
      </span>
      <h2 className="text-xl font-bold mt-2">{title}</h2>
      <p className="text-xs text-slate-300 mt-1 max-w-xl">{description}</p>
    </div>
  );
};
