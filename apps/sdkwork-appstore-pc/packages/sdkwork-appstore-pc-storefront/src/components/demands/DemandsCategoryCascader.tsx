import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DemandCategory } from '@sdkwork/appstore-pc-core';

interface DemandsCategoryCascaderProps {
  /** Category tree roots served for the cascading menu. */
  nodes: readonly DemandCategory[];
  /** Currently selected leaf category id. */
  value?: string;
  /** Disables the trigger while the surrounding form submits. */
  disabled?: boolean;
  /** Receives the picked leaf, or undefined when the selection is cleared. */
  onSelect: (node: DemandCategory | undefined) => void;
}

/** One rendered menu column: a level's sibling nodes plus the chosen node. */
interface CascadeColumn {
  nodes: readonly DemandCategory[];
  activeId?: string;
}

function findNode(nodes: readonly DemandCategory[], id: string | undefined): DemandCategory | undefined {
  if (id === undefined) {
    return undefined;
  }
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNode(node.children, id);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}

/**
 * Resolve the ancestor chain (root first, leaf last) for one category id.
 * @param nodes - category tree roots.
 * @param id - target category id.
 * @returns the chain, or an empty array when the id is not in the tree.
 */
export function resolveDemandCategoryPath(
  nodes: readonly DemandCategory[],
  id: string | undefined,
): DemandCategory[] {
  if (id === undefined) {
    return [];
  }
  for (const node of nodes) {
    if (node.id === id) {
      return [node];
    }
    const rest = resolveDemandCategoryPath(node.children, id);
    if (rest.length > 0) {
      return [node, ...rest];
    }
  }
  return [];
}

function buildColumns(
  nodes: readonly DemandCategory[],
  activePath: readonly string[],
): CascadeColumn[] {
  const columns: CascadeColumn[] = [{ nodes, ...(activePath[0] === undefined ? {} : { activeId: activePath[0] }) }];
  let level: readonly DemandCategory[] = nodes;
  for (const id of activePath) {
    const node = level.find((candidate) => candidate.id === id);
    if (node === undefined || node.children.length === 0) {
      break;
    }
    level = node.children;
    const nextIndex = columns.length;
    columns.push({
      nodes: level,
      ...(activePath[nextIndex] === undefined ? {} : { activeId: activePath[nextIndex] }),
    });
  }
  return columns;
}

/**
 * Cascading category menu for the publish-demand form: one column per tree
 * level, branches drill into the next column, and only a leaf is selectable so
 * a demand is always filed under a concrete category.
 *
 * @param props - tree roots, the selected leaf, and the selection callback.
 * @returns the trigger plus its drill-down popover.
 */
export function DemandsCategoryCascader({
  nodes,
  value,
  disabled = false,
  onSelect,
}: DemandsCategoryCascaderProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [drilledPath, setDrilledPath] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedPath = useMemo(() => resolveDemandCategoryPath(nodes, value), [nodes, value]);
  // The menu opens on the selected path; an explicit drill-down replaces it.
  const activePath = drilledPath.length === 0 ? selectedPath.map((node) => node.id) : drilledPath;

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent): void => {
      if (wrapperRef.current !== null && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const columns = buildColumns(nodes, activePath);
  const triggerLabel =
    selectedPath.length === 0
      ? t('demands.publish.categoryPlaceholder')
      : selectedPath.map((node) => node.displayName).join(' / ');

  const pick = (node: DemandCategory): void => {
    if (node.children.length > 0) {
      const depth = activePath.indexOf(node.id);
      setDrilledPath(depth >= 0 ? activePath.slice(0, depth + 1) : [...activePath, node.id]);
      return;
    }
    onSelect(node);
    setOpen(false);
  };

  const toggle = (): void => {
    // Opening always restarts from the selected path; the gesture, not an
    // effect, decides which column the menu resumes on.
    if (!open) setDrilledPath([]);
    setOpen(!open);
  };

  const isDisabled = disabled || nodes.length === 0

  return (
    <div className="relative" ref={wrapperRef} data-demands-category-cascader>
      {/* The clear control sits beside the trigger, never inside it: a nested
          interactive element inside a button is invalid and steals its label. */}
      <div
        className={`w-full bg-store-field border border-store-line rounded-store-control text-sm px-3 py-2 h-9 transition-colors flex items-center gap-1 ${
          isDisabled
            ? 'text-store-ink-faint'
            : 'text-store-ink hover:border-store-brand/60 focus-within:border-store-brand'
        }`}
      >
        <button
          type="button"
          onClick={toggle}
          disabled={isDisabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex-1 min-w-0 h-full flex items-center justify-between gap-2 bg-transparent border-0 p-0 text-left ${
            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <span className={`truncate ${selectedPath.length === 0 ? 'text-store-ink-faint' : ''}`}>
            {triggerLabel}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-store-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {value !== undefined && !disabled ? (
          <button
            type="button"
            aria-label={t('demands.category.clear')}
            onClick={() => onSelect(undefined)}
            className="shrink-0 text-store-ink-faint hover:text-store-ink cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="absolute z-30 mt-1 left-0 flex max-w-[90vw] bg-store-surface border border-store-line rounded-store-card shadow-2xl overflow-x-auto overflow-y-hidden overscroll-contain"
          data-demands-category-menu
        >
          {columns.map((column, level) => (
            <ul key={level} className="min-w-40 max-h-64 overflow-y-auto py-1 custom-scrollbar">
              {column.nodes.map((node) => {
                const isActive = column.activeId === node.id;
                const isLeaf = node.children.length === 0;
                const isSelected = value === node.id;
                return (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => pick(node)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-store-brand/10 text-store-brand'
                          : isSelected
                            ? 'text-store-brand'
                            : 'text-store-ink-soft hover:bg-store-subtle hover:text-store-ink'
                      }`}
                    >
                      <span className="truncate">{node.displayName}</span>
                      {isLeaf ? null : <ChevronRight className="w-3 h-3 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default DemandsCategoryCascader;
