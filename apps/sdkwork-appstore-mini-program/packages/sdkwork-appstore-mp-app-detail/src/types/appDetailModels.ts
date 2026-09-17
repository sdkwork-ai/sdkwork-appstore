/** Domain models owned by the app-detail capability. */
export interface AppDetailRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface AppDetailPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
