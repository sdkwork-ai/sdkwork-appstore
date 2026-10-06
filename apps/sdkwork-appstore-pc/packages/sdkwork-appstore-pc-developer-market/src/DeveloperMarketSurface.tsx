import { Suspense, type ComponentType } from 'react';
import { DocumentsReferenceRuntimeProvider } from '@sdkwork/documents-pc-commons';
import { readAppstorePcDeveloperMarketRuntime } from './runtime/developerMarketRuntime';
import {
  DeveloperMarketLoadingSurface,
  DeveloperMarketUnavailableSurface,
} from './DeveloperMarketSurfaces';

/**
 * Shared wiring for the developer-market routes: bind the configured
 * documents reference runtime, then mount the lazily imported documents
 * surface under it. The lazy boundary is load-bearing — the documents modules
 * read the module-level runtime singleton during render, and registration
 * happens in the provider's mount effect, so the import must resolve only
 * after the provider has mounted.
 */
export function DeveloperMarketSurface({ Surface }: { Surface: ComponentType }) {
  const runtime = readAppstorePcDeveloperMarketRuntime();
  if (!runtime) {
    return <DeveloperMarketUnavailableSurface />;
  }
  return (
    <div className="flex flex-1 min-h-0 w-full">
      <DocumentsReferenceRuntimeProvider value={runtime}>
        <Suspense fallback={<DeveloperMarketLoadingSurface />}>
          <Surface />
        </Suspense>
      </DocumentsReferenceRuntimeProvider>
    </div>
  );
}
