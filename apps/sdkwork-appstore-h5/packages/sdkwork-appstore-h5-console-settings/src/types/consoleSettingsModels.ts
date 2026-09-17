/** Domain models owned by the console-settings capability. */
export interface ConsoleSettingsRouteParams {
  readonly routeId: string;
  readonly path: string;
}

export interface ConsoleSettingsPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
