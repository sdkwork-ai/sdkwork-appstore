import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, Trophy, Bell, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileNav, TabItem } from './layout/MobileNav';
import { DesktopSidebar } from './layout/DesktopSidebar';
import { DesktopHeader } from './layout/DesktopHeader';
import { ErrorBoundary } from './common/ErrorBoundary';

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();

  const mobileTabs: TabItem[] = [
    { name: t('nav.menu.discover'), path: '/', icon: Home },
    { name: t('nav.menu.charts'), path: '/charts', icon: Trophy },
    { name: t('nav.menu.search'), path: '/search', icon: Search },
    { name: t('nav.menu.library'), path: '/library', icon: FolderHeart },
    { name: t('updates.tabs.updates'), path: '/updates', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#121316] text-gray-900 dark:text-gray-100 flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-200">
      {/* Mobile Navigation */}
      <MobileNav tabs={mobileTabs} />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen bg-[#f8f9fa] dark:bg-[#181a20] overflow-hidden relative">
        {/* Desktop Header */}
        <DesktopHeader />

        <div id="main-scroll-area" className="flex-1 overflow-y-auto pb-16 md:pb-0 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="min-h-full h-full flex flex-col"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

