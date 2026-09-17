/** Domain models owned by the collection capability. */
export interface CollectionRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface CollectionPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
