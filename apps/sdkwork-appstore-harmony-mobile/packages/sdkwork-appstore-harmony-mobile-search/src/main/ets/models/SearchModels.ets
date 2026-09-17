/** Domain models owned by the search capability. */
export interface SearchRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface SearchPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
