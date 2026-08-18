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
      <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-[#20232b] border border-gray-200 dark:border-[#2d313c] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
