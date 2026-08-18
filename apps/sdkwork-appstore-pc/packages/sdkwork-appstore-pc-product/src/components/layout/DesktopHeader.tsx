import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderSearchBar } from './HeaderSearchBar';
import { HeaderUserBadge } from './HeaderUserBadge';
import { HeaderWindowControls } from './HeaderWindowControls';
import { HeaderUpdateNav } from './HeaderUpdateNav';
import { HeaderThemeToggle } from './HeaderThemeToggle';
import { HeaderLanguageToggle } from './HeaderLanguageToggle';
import { AppStoreService } from '../../services/api';

interface DesktopHeaderProps {
  pendingUpdatesCount?: number;
}

export function DesktopHeader({ pendingUpdatesCount: initialCount = 0 }: DesktopHeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(initialCount);

  // Hydrate the real pending-updates count when the library endpoint responds;
  // anonymous sessions keep the initial value without erroring.
  useEffect(() => {
    let cancelled = false;
    AppStoreService.getPendingUpdates()
      .then((apps) => {
        if (!cancelled) {
          setPendingUpdatesCount(apps.length);
        }
      })
      .catch(() => {
        // keep the initial count when the library endpoint is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="hidden md:flex h-14 items-center justify-between gap-3 px-3 xl:px-6 border-b border-gray-200 dark:border-[#22252c] bg-white/95 dark:bg-[#181a20]/95 backdrop-blur-md shrink-0 transition-colors duration-200 z-20">
      {/* Brand / Title or Left Indicator */}
      <div className="hidden xl:flex items-center gap-3 shrink-0">
        <span className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Sdkwork Store
        </span>
      </div>

      {/* Sub-component: Centered Search Bar */}
      <HeaderSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
      />

      {/* Right User & Window Actions */}
      <div className="flex items-center gap-1 xl:gap-3 shrink-0">
        {/* Sub-component: Language Switcher */}
        <HeaderLanguageToggle />

        {/* Sub-component: Updates Link */}
        <HeaderUpdateNav pendingUpdatesCount={pendingUpdatesCount} />

        {/* Sub-component: Theme Toggle */}
        <HeaderThemeToggle />

        {/* Sub-component: User Account Avatar */}
        <HeaderUserBadge initials="CL" />

        {/* Sub-component: Desktop Window Controls (_ [] X) */}
        <div className="hidden xl:block">
          <HeaderWindowControls />
        </div>
      </div>
    </header>
  );
}

