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
          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#222530] text-gray-600 dark:text-gray-400"
        >
          {cap}
        </span>
      ))}
      {capabilities.length > 3 && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#222530] text-gray-400">
          +{capabilities.length - 3}
        </span>
      )}
    </div>
  );
};
