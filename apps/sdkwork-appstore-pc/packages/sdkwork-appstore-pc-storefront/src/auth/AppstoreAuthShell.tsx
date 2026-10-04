import { useEffect, useState, type ReactNode } from 'react';

type AuthThemeMode = 'dark' | 'light';

export function AppstoreAuthShell({ children }: { children: ReactNode }) {
  const [themeMode] = useState<AuthThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    // Host-managed mode root wins (THEME_DARKMODE_SPEC §7.2); OS preference is the standalone fallback.
    const hostColorMode = document.documentElement.getAttribute('data-sdk-color-mode');
    if (hostColorMode === 'light' || hostColorMode === 'dark') return hostColorMode;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const isLightMode = themeMode === 'light';

  useEffect(() => {
    const hostManagedMode = document.documentElement.getAttribute('data-sdk-color-mode') !== null;
    document.documentElement.classList.add('sdkwork-appstore-auth-active');
    document.body.classList.add('sdkwork-appstore-auth-active');
    if (!hostManagedMode) {
      document.documentElement.classList.toggle('light-mode', isLightMode);
      document.documentElement.style.colorScheme = themeMode;
    }
    return () => {
      if (!hostManagedMode) {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.style.removeProperty('color-scheme');
      }
      document.documentElement.classList.remove('sdkwork-appstore-auth-active');
      document.body.classList.remove('sdkwork-appstore-auth-active');
    };
  }, [themeMode, isLightMode]);

  return (
    <div className="sdkwork-appstore-auth-shell">
      <main className="sdkwork-appstore-auth-main">{children}</main>
    </div>
  );
}
