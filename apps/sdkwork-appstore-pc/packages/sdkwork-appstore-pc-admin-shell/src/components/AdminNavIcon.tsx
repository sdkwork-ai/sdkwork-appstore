import {
  Activity,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  Circle,
  FileClock,
  Layers,
  LayoutGrid,
  ListChecks,
  Package,
  Radio,
  Share2,
  ShieldCheck,
  Store,
  Tags,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon vocabulary available to capability packages.
 *
 * Route descriptors carry icon *names* (not components) so the registry stays
 * serializable; this map is the shell's single resolution point, and an unknown
 * name degrades to a neutral glyph instead of crashing the console.
 */
const ADMIN_NAV_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  'badge-check': BadgeCheck,
  'bar-chart-3': BarChart3,
  boxes: Boxes,
  building: Building2,
  'file-clock': FileClock,
  layers: Layers,
  'layout-grid': LayoutGrid,
  'list-checks': ListChecks,
  package: Package,
  radio: Radio,
  share: Share2,
  shield: ShieldCheck,
  store: Store,
  tags: Tags,
};

export interface AdminNavIconProps {
  /** Icon name declared by the route descriptor's nav metadata. */
  name?: string;
  className?: string;
}

/** Resolve a descriptor icon name to its rendered glyph. */
export function AdminNavIcon({ className, name }: AdminNavIconProps) {
  const Icon = name ? ADMIN_NAV_ICONS[name] : undefined;
  // JSX treats a lowercase tag as an intrinsic element, so the fallback has to
  // keep a capitalized identifier to render the component it holds.
  const Resolved = Icon ?? Circle;
  return <Resolved className={className} />;
}

/** Icon names the shell can render; surfaced for capability package authors. */
export function listAdminNavIconNames(): readonly string[] {
  return Object.keys(ADMIN_NAV_ICONS);
}
