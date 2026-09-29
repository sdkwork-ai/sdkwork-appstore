import { Tabs } from './ui/Tabs'

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

/**
 * Compact exclusive option control used by storefront filters.
 *
 * Thin adapter over the shared `Tabs` primitive (`variant="segmented"`). The app
 * used to style exclusive "choose one of N" controls independently per page,
 * which is how the same affordance ended up with different radii and fills.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <Tabs
      variant="segmented"
      className={`max-w-xs w-64 ${className}`}
      items={options.map(option => ({ value: option.value, label: option.label }))}
      value={value}
      onChange={onChange}
    />
  )
}
