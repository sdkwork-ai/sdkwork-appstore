/** Domain models owned by the games capability. */
export interface GamesRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface GamesPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
