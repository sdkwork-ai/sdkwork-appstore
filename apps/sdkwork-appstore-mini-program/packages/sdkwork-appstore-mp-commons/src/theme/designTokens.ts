/** Domain-neutral design tokens shared by App Store mini program screens. */
export const appstoreMpDesignTokens = {
  color: {
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    accent: "#0f766e",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16, pill: 999 },
  typography: { title: 20, body: 14, caption: 12 },
} as const;
