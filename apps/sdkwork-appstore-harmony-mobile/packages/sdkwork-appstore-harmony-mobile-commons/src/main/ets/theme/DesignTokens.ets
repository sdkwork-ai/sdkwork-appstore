/** Domain-neutral design tokens shared by App Store Harmony screens.
 *  Values follow UI_DESIGN_SPEC §2.1 (--bg-canvas #F5F5F7, --accent #0071E3)
 *  so every client renders the same brand palette. */
export class AppstoreDesignTokens {
  static readonly background: string = '#F5F5F7';
  static readonly surface: string = '#FFFFFF';
  static readonly border: string = '#E2E8F0';
  static readonly textPrimary: string = '#1D1D1F';
  static readonly textSecondary: string = '#6E6E73';
  static readonly textTertiary: string = '#8E8E93';
  static readonly accent: string = '#0071E3';

  static readonly spaceSm: number = 8;
  static readonly spaceMd: number = 16;
  static readonly spaceLg: number = 24;
}
