import { lazy } from 'react';
import { DeveloperMarketSurface } from './DeveloperMarketSurface';

const ApiMarketSurface = lazy(() =>
  import('@sdkwork/documents-pc-api-reference').then((module) => ({
    default: module.ApiMarketPage,
  })),
);

/** The API market: every API surface published across the SDKWork workspace. */
export function ApiMarketPage() {
  return <DeveloperMarketSurface Surface={ApiMarketSurface} />;
}
