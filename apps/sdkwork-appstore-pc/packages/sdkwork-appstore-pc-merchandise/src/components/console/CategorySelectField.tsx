import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface CategorySelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export const CategorySelectField: React.FC<CategorySelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-store-ink-faint mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-store-field border border-store-line rounded-store-control px-3 text-sm text-store-ink outline-none focus:ring-2 focus:ring-store-brand/25 h-9 placeholder:text-store-ink-faint transition-colors focus:border-store-brand"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
