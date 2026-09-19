import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  resolveHostColorScheme?: () => Theme;
  subscribeHostColorScheme?: (listener: (scheme: Theme) => void) => () => void;
}

export function ThemeProvider({
  children,
  resolveHostColorScheme,
  subscribeHostColorScheme,
}: ThemeProviderProps) {
  const hostManaged = resolveHostColorScheme !== undefined;
  const [theme, setTheme] = useState<Theme>(() => {
    if (hostManaged) {
      return resolveHostColorScheme();
    }
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (!subscribeHostColorScheme) {
      return undefined;
    }
    return subscribeHostColorScheme((nextScheme) => {
      setTheme(nextScheme);
    });
  }, [subscribeHostColorScheme]);

  useEffect(() => {
    if (hostManaged) {
      return undefined;
    }
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    return undefined;
  }, [hostManaged, theme]);

  useLayoutEffect(() => {
    if (!hostManaged) {
      return undefined;
    }
    const root = document.documentElement;
    const previousDark = root.classList.contains('dark');
    const previousLightMode = root.classList.contains('light-mode');
    const previousSdkColorMode = root.getAttribute('data-sdk-color-mode');
    const previousColorScheme = root.style.colorScheme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light-mode', theme === 'light');
    root.setAttribute('data-sdk-color-mode', theme);
    root.style.colorScheme = theme;
    return () => {
      root.classList.toggle('dark', previousDark);
      root.classList.toggle('light-mode', previousLightMode);
      root.style.colorScheme = previousColorScheme;
      if (previousSdkColorMode === null) root.removeAttribute('data-sdk-color-mode');
      else root.setAttribute('data-sdk-color-mode', previousSdkColorMode);
    };
  }, [hostManaged, theme]);

  const value = {
    theme,
    toggleTheme: () => {
      if (hostManaged) {
        return;
      }
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    },
  };

  const content = (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );

  if (!hostManaged) {
    return content;
  }

  return (
    <div className={`flex h-full min-h-0 w-full min-w-0 flex-col${theme === 'dark' ? ' dark' : ''}`} data-sdk-color-mode={theme}>
      {content}
    </div>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
