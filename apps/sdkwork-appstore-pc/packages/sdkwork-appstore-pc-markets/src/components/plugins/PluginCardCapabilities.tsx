import React from 'react';

interface PluginCardCapabilitiesProps {
  capabilities: string[];
}

export const PluginCardCapabilities: React.FC<PluginCardCapabilitiesProps> = ({ capabilities }) => {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {capabilities.slice(0, 3).map((cap, idx) => (
        <span
          key={idx}
          className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft "
        >
          {cap}
        </span>
      ))}
      {capabilities.length > 3 && (
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-faint ">
          +{capabilities.length - 3}
        </span>
      )}
    </div>
  );
};
