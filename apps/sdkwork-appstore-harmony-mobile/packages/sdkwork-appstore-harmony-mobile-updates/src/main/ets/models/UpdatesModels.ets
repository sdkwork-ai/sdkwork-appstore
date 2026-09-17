/** Domain models owned by the updates capability. */
export interface UpdatesRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface UpdatesPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
