import React from 'react';

interface DescriptionTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const DescriptionTextArea: React.FC<DescriptionTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-store-ink-faint mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-store-field border border-store-line rounded-store-control px-3 py-2 text-sm text-store-ink outline-none focus:ring-2 focus:ring-store-brand/25 placeholder:text-store-ink-faint transition-colors focus:border-store-brand"
      />
    </div>
  );
};
