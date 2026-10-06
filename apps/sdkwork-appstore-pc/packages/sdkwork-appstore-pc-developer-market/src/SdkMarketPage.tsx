import { lazy } from 'react';
import { DeveloperMarketSurface } from './DeveloperMarketSurface';

const SdkReferenceSurface = lazy(() =>
  import('@sdkwork/documents-pc-sdk-reference').then((module) => ({
    default: module.SdkReference,
  })),
);

/** The SDK market: generated SDK documentation, language packages, and archive downloads. */
export function SdkMarketPage() {
  return <DeveloperMarketSurface Surface={SdkReferenceSurface} />;
}
