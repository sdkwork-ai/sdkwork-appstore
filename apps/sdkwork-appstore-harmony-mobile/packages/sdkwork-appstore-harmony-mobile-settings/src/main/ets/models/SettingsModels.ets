/** Domain models owned by the settings capability. */
export interface SettingsRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface SettingsPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
