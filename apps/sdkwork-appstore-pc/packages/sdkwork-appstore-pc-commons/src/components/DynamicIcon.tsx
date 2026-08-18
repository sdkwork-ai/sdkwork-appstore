import type { LucideProps } from 'lucide-react'
import * as Icons from 'lucide-react'

interface DynamicIconProps extends Omit<LucideProps, 'className'> {
  name: string
  className?: string
}

const ICON_MAP = Icons as Record<string, typeof Icons.HelpCircle>

/**
 * Render a Lucide icon by catalog name, falling back to HelpCircle.
 * @param name - Lucide export name stored on the catalog item.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] ?? Icons.HelpCircle
  return <IconComponent {...props} />
}
