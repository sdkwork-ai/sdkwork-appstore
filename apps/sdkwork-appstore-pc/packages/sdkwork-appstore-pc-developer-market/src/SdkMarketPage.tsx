import { lazy } from 'react';
import { DeveloperMarketSurface } from './DeveloperMarketSurface';

const SdkMarketSurface = lazy(() =>
  import('@sdkwork/documents-pc-api-reference').then((module) => ({
    default: module.SdkMarketPage,
  })),
);

/** The SDK market: multi-language SDK families generated from every API surface. */
export function SdkMarketPage() {
  return <DeveloperMarketSurface Surface={SdkMarketSurface} />;
}
