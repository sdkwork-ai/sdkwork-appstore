/** Domain models owned by the discover capability. */
export interface DiscoverRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface DiscoverPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
