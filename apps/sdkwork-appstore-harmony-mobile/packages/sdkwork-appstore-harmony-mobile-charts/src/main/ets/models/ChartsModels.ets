/** Domain models owned by the charts capability. */
export interface ChartsRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface ChartsPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
