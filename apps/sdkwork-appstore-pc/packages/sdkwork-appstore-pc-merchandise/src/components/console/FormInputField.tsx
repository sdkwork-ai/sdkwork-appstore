import React from 'react';

interface FormInputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormInputField: React.FC<FormInputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-store-ink-faint mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-store-field border border-store-line rounded-store-control px-3 text-sm text-store-ink outline-none focus:ring-2 focus:ring-store-brand/25 h-9 placeholder:text-store-ink-faint transition-colors focus:border-store-brand"
      />
    </div>
  );
};
