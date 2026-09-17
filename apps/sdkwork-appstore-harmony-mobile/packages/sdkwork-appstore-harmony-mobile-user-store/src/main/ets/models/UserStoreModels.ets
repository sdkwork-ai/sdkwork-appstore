/** Domain models owned by the user-store capability. */
export interface UserStoreRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface UserStorePageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
