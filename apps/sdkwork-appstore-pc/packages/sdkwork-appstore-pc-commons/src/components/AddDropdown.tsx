import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** One menu row of the add dropdown. */
export interface AddDropdownItem {
  /** Stable item id (rendered as the React key). */
  key: string;
  /** Leading glyph component (lucide icon); sized to 16px by the menu. */
  icon: React.ComponentType<{ className?: string }>;
  /** Item title — reuse the source surface's own button copy for consistency. */
  title: string;
  /** Optional one-line description under the title. */
  desc?: string;
  /** Invoked after the menu closes. */
  onSelect: () => void;
}

interface AddDropdownProps {
  /** Trigger label (e.g. "添加"). */
  label: string;
  /** Accessible name for trigger and menu. */
  ariaLabel?: string;
  /** Menu rows, top to bottom. */
  items: AddDropdownItem[];
  /**
   * Extra trigger classes for the page's accent (defaults to a flat blue so
   * the affordance reads native across the app store and AI Lab surfaces).
   */
  triggerClassName?: string;
  /** Anchor side of the floating menu relative to the trigger. */
  align?: 'left' | 'right';
}

/**
 * Generic "add" dropdown: a trigger button with a trailing caret that opens a
 * floating menu of icon+title+desc rows (the marketplace add-affordance
 * design). The menu closes on selection, outside pointerdown, and Escape;
 * the trigger keeps `aria-haspopup`/`aria-expanded` so tests and assistive
 * tech read the same open state. Reusable across the AI Lab and the
 * marketplace pages — pass each surface's own flows and copy as items.
 */
export const AddDropdown: React.FC<AddDropdownProps> = ({
  label,
  ariaLabel,
  items,
  triggerClassName = 'bg-blue-600 hover:bg-blue-500 text-white',
  align = 'right',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Outside pointerdown and Escape close the menu; the trigger's own click
  // toggles, so the outside listener must ignore events inside the root.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={rootRef} data-add-dropdown="">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel ?? label}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${triggerClassName}`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel ?? label}
          className={`absolute top-full mt-2 z-50 min-w-[248px] flex flex-col gap-0.5 p-1.5 rounded-2xl border border-gray-200 dark:border-[#282c38] bg-white dark:bg-[#1b1e26] shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                aria-label={item.title}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors hover:bg-gray-100 dark:hover:bg-[#222632] cursor-pointer"
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400 dark:text-gray-400" />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-4">
                    {item.title}
                  </span>
                  {item.desc && (
                    <span className="text-[11px] text-gray-400 leading-4">
                      {item.desc}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddDropdown;
