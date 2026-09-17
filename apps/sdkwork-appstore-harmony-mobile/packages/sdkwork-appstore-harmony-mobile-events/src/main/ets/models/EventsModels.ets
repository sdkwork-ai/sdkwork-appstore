/** Domain models owned by the events capability. */
export interface EventsRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface EventsPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
