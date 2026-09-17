/** Domain models owned by the publisher capability. */
export interface PublisherRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface PublisherPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
