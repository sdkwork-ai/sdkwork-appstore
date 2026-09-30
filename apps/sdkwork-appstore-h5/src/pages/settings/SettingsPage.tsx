import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Package,
  Palette,
  ChevronRight,
  ArrowLeft,
  Moon,
  Sun,
  Check,
  Library,
  RefreshCw,
  Heart,
  LogOut,
} from 'lucide-react';
import {
  fetchCurrentIamUser,
  getCurrentUser,
  isAuthenticated,
  signOut,
  type IamUser,
} from '@/bootstrap/iamRuntime';
import { LoadingSpinner } from '@sdkwork/appstore-h5-commons';
import { useTheme, type Theme } from '@/hooks/useTheme';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [iamUser, setIamUser] = useState<IamUser | null>(getCurrentUser());
  const [accountLoading, setAccountLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIamUser(null);
      return;
    }
    let cancelled = false;
    setAccountLoading(true);
    void fetchCurrentIamUser()
      .then((user) => {
        if (!cancelled) {
          setIamUser(user);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAccountLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayInitial =
    iamUser?.displayName?.trim()?.[0]?.toUpperCase() ||
    iamUser?.email?.trim()?.[0]?.toUpperCase() ||
    '?';

  const sections = [
    { label: '开发者中心', icon: Package, path: '/publisher' },
    { label: '通知', icon: Bell, path: '/notifications' },
    { label: '我的库', icon: Library, path: '/library' },
    { label: '更新', icon: RefreshCw, path: '/updates' },
    { label: '心愿单', icon: Heart, path: '/wishlist' },
  ];

  const themeOptions: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: '浅色', icon: Sun },
    { id: 'dark', label: '深色', icon: Moon },
  ];

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center"
            aria-label="返回"
          >
            <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">设置</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {isAuthenticated() ? (
          accountLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="card flex items-center gap-4 p-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
              >
                {displayInitial}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {iamUser?.displayName || 'SDKWork 用户'}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] truncate">
                  {iamUser?.email || iamUser?.userId || '已登录'}
                </p>
              </div>
            </div>
          )
        ) : (
          <Link to="/login" className="card flex items-center gap-4 p-4 card-press">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
            >
              <User className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--text-primary)]">登录账户</h3>
              <p className="text-sm text-[var(--text-tertiary)]">登录后同步库、收藏与开发者资料</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
          </Link>
        )}
      </div>

      <div className="px-4 py-2">
        <div className="mb-3 flex items-center gap-2 px-1">
          <Palette className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">外观</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className="card card-press flex flex-col items-center gap-2 p-4"
              style={
                theme === option.id
                  ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' }
                  : undefined
              }
            >
              <option.icon
                className="h-6 w-6"
                style={{ color: theme === option.id ? 'var(--accent)' : 'var(--text-tertiary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: theme === option.id ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                {option.label}
              </span>
              {theme === option.id ? <Check className="h-4 w-4 text-[var(--accent)]" /> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="card overflow-hidden">
          {sections.map((section) => (
            <button
              key={section.label}
              type="button"
              onClick={() => navigate(section.path)}
              className="flex w-full items-center gap-4 border-b px-4 py-4 text-left last:border-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <section.icon className="h-5 w-5 text-[var(--text-tertiary)]" />
              <span className="flex-1 font-medium text-[var(--text-primary)]">{section.label}</span>
              <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">SDKWork App Store</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            版本 1.0.0 · 应用 ID sdkwork-appstore-h5
          </p>
        </div>

        {isAuthenticated() ? (
          <button
            type="button"
            onClick={() => {
              signOut();
              setIamUser(null);
            }}
            className="card card-press mt-3 flex w-full items-center justify-center gap-2 p-4"
            style={{ color: 'var(--danger)' }}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
