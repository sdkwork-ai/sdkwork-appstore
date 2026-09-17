/** Domain models owned by the ai-hub capability. */
export interface AiHubRouteParams {
  readonly routeId: string;
  readonly path: string;
}

export interface AiHubPageResult<TItem> {
  readonly items: TItem[];
  readonly nextCursor?: string;
}
