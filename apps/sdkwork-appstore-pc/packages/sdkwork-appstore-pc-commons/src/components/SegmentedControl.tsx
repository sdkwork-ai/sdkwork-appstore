interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Compact exclusive option control used by storefront filters. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex p-1 bg-gray-100 dark:bg-[#2C2C2E] rounded-lg max-w-xs w-64 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            value === option.value
              ? 'bg-white dark:bg-[#3C3C3E] shadow-sm text-gray-900 dark:text-[#F5F5F5]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
