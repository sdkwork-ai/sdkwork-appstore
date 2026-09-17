import { Outlet, useLocation } from 'react-router-dom';
import { Compass, Grid3X3, Gamepad2, Search, Download } from 'lucide-react';

import { TabBar, type TabBarItem } from '../navigation/TabBar';

/**
 * H5 application layout.
 *
 * Moved verbatim from the application root: the shell package owns the app
 * surface shell, the navigation container, and tab ownership, while capability
 * packages own the screens it renders
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 4).
 *
 * Tab paths stay on the H5 root's own spelling: route identity, not route
 * spelling, is the cross-client contract (section 7).
 */
const tabs: readonly TabBarItem[] = [
  { path: '/', icon: Compass, label: '发现', end: true },
  { path: '/browse/apps', icon: Grid3X3, label: '应用' },
  { path: '/browse/games', icon: Gamepad2, label: '游戏' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/library', icon: Download, label: '库' },
];

const HIDE_TAB_PATHS = ['/app/', '/login', '/publisher'];

export function MobileLayout() {
  const { pathname } = useLocation();
  const hideTabBar = HIDE_TAB_PATHS.some((prefix) => pathname.startsWith(prefix));

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        paddingBottom: hideTabBar ? 0 : '4.5rem',
      }}
    >
      <main>
        <Outlet />
      </main>

      {!hideTabBar ? <TabBar items={tabs} /> : null}
    </div>
  );
}
