/** Domain models owned by the category capability. */
export interface CategoryRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface CategoryPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
