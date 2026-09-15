/**
 * Shared operator UI kit owned by `pc-admin-shell`.
 *
 * Capability packages (`pc-admin-*`) depend on the shell, so these primitives
 * live here rather than in each capability package: one definition of table
 * chrome, KPI tiles, form fields, dialogs, and loading/empty/failure states
 * keeps the console visually and behaviorally consistent.
 */
export { AdminPageHeader, type AdminPageHeaderProps } from './AdminPageHeader';
export {
  AdminStatePlaceholder,
  type AdminStateKind,
  type AdminStatePlaceholderProps,
} from './AdminStatePlaceholder';
export { AdminKpiCard, type AdminKpiCardProps } from './AdminKpiCard';
export { AdminStatusBadge, type AdminStatusBadgeProps, type AdminStatusTone } from './AdminStatusBadge';
export {
  AdminDataTable,
  type AdminDataTableProps,
  type AdminTableColumn,
} from './AdminDataTable';
export { AdminToolbar, type AdminToolbarProps } from './AdminToolbar';
export { AdminPaginationBar, type AdminPaginationBarProps } from './AdminPaginationBar';
export { AdminActionButton, type AdminActionButtonProps } from './AdminActionButton';
export { AdminDetailList, type AdminDetailEntry, type AdminDetailListProps } from './AdminDetailList';
export { AdminSection, type AdminSectionProps } from './AdminSection';
export {
  AdminFormField,
  ADMIN_INPUT_CLASS,
  type AdminFormFieldProps,
} from './AdminFormField';
export { AdminDialog, type AdminDialogProps } from './AdminDialog';
export { AdminCommandError, type AdminCommandErrorProps } from './AdminCommandError';
