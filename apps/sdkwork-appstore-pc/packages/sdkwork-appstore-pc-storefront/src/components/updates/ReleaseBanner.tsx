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
    <div className="bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card p-6 text-store-ink shadow-md ">
      <span className="px-2.5 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-xs font-medium uppercase tracking-wider">
        {version} Platform Release Notes
      </span>
      <h2 className="text-xl font-bold mt-2">{title}</h2>
      <p className="text-xs text-slate-300 mt-1 max-w-xl">{description}</p>
    </div>
  );
};
