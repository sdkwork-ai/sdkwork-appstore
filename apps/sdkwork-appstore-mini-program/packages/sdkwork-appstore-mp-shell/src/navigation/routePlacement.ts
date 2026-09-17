/**
 * Route placement: maps canonical route ids onto mini program pages.
 *
 * Route ids are the cross-client alignment contract; the WeChat page path is a
 * platform detail and may differ per architecture.
 */
export interface RoutePlacement {
  readonly routeId: string;
  readonly page: string;
  readonly subpackage?: string;
}

export const appstoreMpRoutePlacement: readonly RoutePlacement[] = [
  { routeId: "discover", page: "pages/home/index" },
  { routeId: "apps", page: "pages/shell/index", subpackage: "catalog" },
  { routeId: "search", page: "pages/shell/index", subpackage: "search" },
  { routeId: "app-detail", page: "pages/shell/index", subpackage: "listing" },
  { routeId: "library", page: "pages/shell/index", subpackage: "library" },
  { routeId: "user-store", page: "pages/shell/index", subpackage: "user-store" },
  { routeId: "publisher-overview", page: "pages/shell/index", subpackage: "publisher" },
] as const;

export function resolveRoutePlacement(
  routeId: string,
): RoutePlacement | undefined {
  return appstoreMpRoutePlacement.find((entry) => entry.routeId === routeId);
}
