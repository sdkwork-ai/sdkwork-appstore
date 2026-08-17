import { useEffect, useState, type ReactNode } from 'react';

type AuthThemeMode = 'dark' | 'light';

export function AppstoreAuthShell({ children }: { children: ReactNode }) {
  const [themeMode] = useState<AuthThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const isLightMode = themeMode === 'light';

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLightMode);
    document.documentElement.style.colorScheme = themeMode;
    document.documentElement.classList.add('sdkwork-appstore-auth-active');
    document.body.classList.add('sdkwork-appstore-auth-active');
    return () => {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.remove('sdkwork-appstore-auth-active');
      document.documentElement.style.removeProperty('color-scheme');
      document.body.classList.remove('sdkwork-appstore-auth-active');
    };
  }, [themeMode, isLightMode]);

  return (
    <div className="sdkwork-appstore-auth-shell">
      <main className="sdkwork-appstore-auth-main">{children}</main>
    </div>
  );
}
