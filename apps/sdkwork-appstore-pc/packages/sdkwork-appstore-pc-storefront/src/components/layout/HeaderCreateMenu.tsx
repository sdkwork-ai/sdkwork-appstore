import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppWindow, Globe, Megaphone, Plus } from 'lucide-react';

/** Creation entries surfaced by the navbar plus button. Each preset maps to a
 *  store application type (`appstore_app.app_type`) carried through the
 *  publisher bootstrap as the `type` query parameter. */
const CREATE_TARGETS = [
  { type: 'app', icon: AppWindow },
  { type: 'website', icon: Globe },
  { type: 'promo', icon: Megaphone },
] as const;

/** Navbar creation hub: the plus button opens a dropdown with the store's
 *  creation entries (new app / new website / new promo app). */
export function HeaderCreateMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t('publisher.createMenu.label')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-store-brand text-white transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t('publisher.createMenu.label')}
          className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-store-line bg-store-surface shadow-xl"
        >
          {CREATE_TARGETS.map(({ type, icon: Icon }) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate(`/publisher/apps/new?type=${type}`);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-store-canvas"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-store-brand/10 text-store-brand">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-store-ink">
                  {t(`publisher.createMenu.${type}`)}
                </span>
                <span className="block truncate text-xs text-store-ink-faint">
                  {t(`publisher.createMenu.${type}Desc`)}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
