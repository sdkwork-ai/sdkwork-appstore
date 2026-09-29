import { describe, expect, it } from 'vitest';
import { listAppstoreRouteIdentities } from '@sdkwork/appstore-h5-core';
import {
  EXPLICIT_ROUTE_IDS,
  OVERRIDDEN_ROUTE_IDS,
  pendingRouteContributions,
} from '../src/routes/pendingRoutes';

/**
 * Cross-architecture route alignment guard
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7 and section 11):
 * every canonical route id must render a dedicated H5 screen, and route
 * metadata must stay presentation-only.
 */
describe('H5 canonical route alignment', () => {
  const routes = listAppstoreRouteIdentities();

  it('exposes the canonical route table', () => {
    expect(routes.length).toBeGreaterThanOrEqual(26);
  });

  it('mounts every canonical route explicitly or through an override', () => {
    const mounted = new Set<string>([...EXPLICIT_ROUTE_IDS, ...OVERRIDDEN_ROUTE_IDS]);
    const missing = routes.map((route) => route.id).filter((id) => !mounted.has(id));
    expect(missing).toEqual([]);
  });

  it('declares no unknown route ids', () => {
    const known = new Set(routes.map((route) => route.id));
    const unknown = [...EXPLICIT_ROUTE_IDS, ...OVERRIDDEN_ROUTE_IDS].filter(
      (id) => !known.has(id),
    );
    expect(unknown).toEqual([]);
  });

  it('renders no placeholder for any canonical route', () => {
    const placeholderIds = pendingRouteContributions
      .map((route) => route.id)
      .filter((id) => !OVERRIDDEN_ROUTE_IDS.includes(id));
    expect(placeholderIds).toEqual([]);
  });

  it('formats route ids as <surface>.<domain>.<capability>.<screen>', () => {
    for (const route of routes) {
      expect(route.id).toMatch(/^(app|console|admin)\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/u);
    }
  });

  it('keeps route metadata free of transport details', () => {
    for (const route of routes) {
      expect(route.path).toMatch(/^\//u);
      expect(route.path).not.toMatch(/v3\/api|http/u);
      expect(route.titleKey).toMatch(/^appstore\.[a-z0-9.-]+\.title$/u);
    }
  });

  it('declares path parameters for parameterized routes', () => {
    for (const route of routes) {
      const declared = (route.params ?? []).map((param) => param.name);
      const used = Array.from(route.path?.matchAll(/:([A-Za-z0-9]+)/gu) ?? [], (m) => m[1]);
      expect(declared).toEqual(used);
    }
  });
});
