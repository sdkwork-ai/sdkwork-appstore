/** Domain models owned by the apps capability. */
export interface AppsRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface AppsPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
