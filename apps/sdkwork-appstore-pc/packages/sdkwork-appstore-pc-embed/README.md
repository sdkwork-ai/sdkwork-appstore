# @sdkwork/appstore-pc-embed

`@sdkwork/appstore-pc-embed` is the public React embed entry for the SDKWork App Store PC surface. It reuses the existing App Store layout, sidebar, header, providers, authentication gate, and route pages instead of maintaining a second storefront UI.

This package is a composition/embed layer, not a native host: it owns no Tauri, Electron, or Capacitor platform config. The native host package for this root is `sdkwork-appstore-pc-tauri` (`APP_PC_ARCHITECTURE_SPEC.md` section 3 / section 11).

## Usage

```tsx
import { AppstorePcHost } from '@sdkwork/appstore-pc-embed'
import '@sdkwork/appstore-pc-embed/styles.css'

<AppstorePcHost
  apiBaseUrl="https://example.invalid"
  accessToken={token}
  locale="zh-CN"
  initialPath="/"
  onPathChange={setPath}
/>
```

`AppstorePcHost` uses an isolated `MemoryRouter`, so embedded navigation does not mutate the parent browser URL. `AppstorePcRoutes` is exported for application roots that own their router. Runtime configuration, session credentials, locale, and API origins are explicit inputs; no module-level runtime singleton is required.

`AppstoreAdminSurface` and `AppstoreMarketsSurface` are the narrower embed surfaces for hosts that already own navigation chrome: the first mounts the `backend-admin` operator console, the second mounts a single storefront market page per tab.

The package does not add raw HTTP, browser-owned secrets, or fallback catalog data. Authenticated SDK clients and the existing App Store service ports remain the source of page data. The PC app root remains the composition root for standalone browser and desktop startup.

## Boundary

Consumers must import this package's public exports. They must not import `src/**` files from the PC app root or the private shell/feature facades directly.
