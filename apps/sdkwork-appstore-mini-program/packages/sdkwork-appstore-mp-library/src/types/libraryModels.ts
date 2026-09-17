/** Domain models owned by the library capability. */
export interface LibraryRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface LibraryPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
