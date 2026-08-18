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
      <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-[#20232b] border border-gray-200 dark:border-[#2d313c] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
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
