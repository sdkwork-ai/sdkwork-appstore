import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Grid, 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  Search,
  Plug,
  Zap,
  Network,
  Boxes,
  Sliders, 
  Activity, 
  Download, 
  FolderHeart,
  Heart,
  Store,
  Sparkle
} from 'lucide-react';
import { SidebarBrand } from './SidebarBrand';
import { SidebarNavGroup, SidebarNavItem } from './SidebarNavGroup';

export function DesktopSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const mainTabs: SidebarNavItem[] = [
    { name: t('nav.menu.discover'), path: '/', icon: Home },
    { name: t('nav.menu.apps'), path: '/apps', icon: Grid },
    { name: t('nav.menu.games'), path: '/games', icon: Gamepad2 },
    { name: t('nav.menu.aiHub'), path: '/ai-hub', icon: Sparkles },
    { name: t('nav.menu.charts'), path: '/charts', icon: Trophy },
    { name: t('nav.menu.search'), path: '/search', icon: Search },
  ];

  const libraryTabs: SidebarNavItem[] = [
    { name: t('nav.menu.library'), path: '/library', icon: FolderHeart },
    { name: t('nav.menu.wishlist'), path: '/wishlist', icon: Heart },
  ];

  const aiTabs: SidebarNavItem[] = [
    { name: t('nav.menu.plugins'), path: '/plugins', icon: Plug },
    { name: t('nav.menu.skills'), path: '/skills', icon: Zap },
    { name: t('nav.menu.mcp'), path: '/mcp', icon: Network },
    { name: t('nav.menu.templates'), path: '/templates', icon: Boxes },
  ];

  const adminTabs: SidebarNavItem[] = [
    { name: t('nav.menu.publisher'), path: '/publisher', icon: Store },
    { name: t('nav.menu.console'), path: '/console/settings', icon: Sliders },
    { name: t('nav.menu.admin'), path: '/admin/monitor', icon: Activity },
  ];

  const bottomTabs: SidebarNavItem[] = [
    { name: t('updates.tabs.notes'), path: '/updates?tab=new', icon: Sparkle },
    { name: t('updates.tabs.queue'), path: '/updates?tab=downloads', icon: Download },
    { name: t('updates.tabs.library'), path: '/updates?tab=library', icon: FolderHeart },
  ];

  const isTabActive = (targetPath: string) => {
    const currentPath = location.pathname;
    const currentCategory = searchParams.get('category');
    const currentTab = searchParams.get('tab');

    // 1. Home
    if (targetPath === '/') {
      return currentPath === '/';
    }

    // 2. Search categories
    if (targetPath.startsWith('/search')) {
      if (currentPath !== '/search') return false;
      const targetCategory = new URLSearchParams(targetPath.split('?')[1] || '').get('category');
      if (!targetCategory && !currentCategory) return true;
      return targetCategory === currentCategory;
    }

    // 3. Updates tabs
    if (targetPath.startsWith('/updates')) {
      if (currentPath !== '/updates') return false;
      const targetTab = new URLSearchParams(targetPath.split('?')[1] || '').get('tab');
      const activeTab = currentTab || 'downloads';
      return targetTab === activeTab;
    }

    // 4. Exact or subpath match
    return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
  };

  return (
    <aside className="hidden md:flex flex-col w-56 bg-[#f7f8fa] dark:bg-[#131418] border-r border-gray-200 dark:border-[#20232b] py-4 px-3 sticky top-0 h-screen shrink-0 transition-colors duration-200 select-none">
      {/* Sub-component: Brand Header */}
      <SidebarBrand />

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        {/* Sub-component: Store Navigation Section */}
        <SidebarNavGroup
          title={t('nav.menu.discover')}
          items={mainTabs}
          isTabActive={isTabActive}
        />

        {/* Sub-component: Library Navigation Section */}
        <SidebarNavGroup
          title={t('nav.menu.library')}
          items={libraryTabs}
          isTabActive={isTabActive}
        />

        {/* Sub-component: AI Ecosystem Section */}
        <SidebarNavGroup
          title={t('nav.menu.aiHub')}
          items={aiTabs}
          isTabActive={isTabActive}
        />

        {/* Sub-component: Admin Navigation Section */}
        <SidebarNavGroup
          title={t('nav.menu.console')}
          items={adminTabs}
          isTabActive={isTabActive}
        />
      </div>

      {/* Sub-component: Bottom Tools */}
      <div className="pt-3 border-t border-gray-200 dark:border-[#20232b]">
        <SidebarNavGroup
          items={bottomTabs}
          isTabActive={isTabActive}
          variant="bottom"
        />
      </div>
    </aside>
  );
}

