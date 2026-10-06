import { lazy } from 'react';
import { DeveloperMarketSurface } from './DeveloperMarketSurface';

const ApiReferenceSurface = lazy(() =>
  import('@sdkwork/documents-pc-api-reference').then((module) => ({
    default: module.ApiReference,
  })),
);

/** The API market: the SDKWork gateway's API reference browser and playground. */
export function ApiMarketPage() {
  return <DeveloperMarketSurface Surface={ApiReferenceSurface} />;
}
