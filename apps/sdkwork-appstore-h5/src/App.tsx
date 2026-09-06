import { Routes, Route } from 'react-router-dom';
import { AuthGate } from './AuthGate';
import { MobileLayout } from './components/layout/MobileLayout';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const UpdatesPage = lazy(() => import('./pages/updates/UpdatesPage').then(m => ({ default: m.UpdatesPage })));
const PublisherRoutes = lazy(() =>
  import('@sdkwork/appstore-h5-console-publisher').then((m) => ({ default: m.PublisherRoutes })),
);
const AppsBrowsePage = lazy(() => import('./pages/BrowsePage').then(m => ({ default: m.AppsBrowsePage })));
const GamesBrowsePage = lazy(() => import('./pages/BrowsePage').then(m => ({ default: m.GamesBrowsePage })));
const UserStorePage = lazy(() =>
  import('./pages/user-store/UserStorePage').then(m => ({ default: m.UserStorePage })),
);
const PublicUserStorePage = lazy(() =>
  import('./pages/user-store/PublicUserStorePage').then(m => ({ default: m.PublicUserStorePage })),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MobileLayout />}>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/apps" element={<AppsBrowsePage />} />
          <Route path="/browse/games" element={<GamesBrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/app/:listingSlug" element={<ListingDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Authenticated routes */}
          <Route
            path="/library"
            element={
              <AuthGate>
                <LibraryPage />
              </AuthGate>
            }
          />
          <Route
            path="/wishlist"
            element={
              <AuthGate>
                <LibraryPage />
              </AuthGate>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthGate>
                <NotificationsPage />
              </AuthGate>
            }
          />
          <Route
            path="/updates"
            element={
              <AuthGate>
                <UpdatesPage />
              </AuthGate>
            }
          />
          <Route
            path="/user-store"
            element={
              <AuthGate>
                <UserStorePage />
              </AuthGate>
            }
          />
          {/* 匿名公开分享视图：访客无需登录即可浏览个人 Appstore */}
          <Route path="/store/:shareToken" element={<PublicUserStorePage />} />
          <Route
            path="/publisher/*"
            element={
              <AuthGate>
                <PublisherRoutes />
              </AuthGate>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-96 px-4">
      <h1 className="text-6xl font-bold" style={{ color: 'var(--border-strong)' }}>
        404
      </h1>
      <p className="text-xl mt-4 text-[var(--text-secondary)]">页面未找到</p>
      <a
        href="/"
        className="mt-6 px-6 py-2.5 bg-[var(--accent)] text-white rounded-full text-sm font-medium"
      >
        返回首页
      </a>
    </div>
  );
}
