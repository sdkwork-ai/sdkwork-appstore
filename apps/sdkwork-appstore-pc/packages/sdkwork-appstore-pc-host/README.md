# @sdkwork/appstore-pc-host

`@sdkwork/appstore-pc-host` is the public React composition entry for the SDKWork App Store PC product. It reuses the existing App Store layout, sidebar, header, providers, authentication gate, and route pages instead of maintaining a second storefront UI.

## Usage

```tsx
import { AppstorePcHost } from '@sdkwork/appstore-pc-host'
import '@sdkwork/appstore-pc-host/styles.css'

<AppstorePcHost
  apiBaseUrl="https://example.invalid"
  accessToken={token}
  locale="zh-CN"
  initialPath="/"
  onPathChange={setPath}
/>
```

The host uses an isolated `MemoryRouter`, so embedded navigation does not mutate the parent browser URL. `AppstorePcRoutes` is exported for application roots that own their router. Runtime configuration, session credentials, locale, and API origins are explicit inputs; no module-level runtime singleton is required.

The package does not add raw HTTP, browser-owned secrets, or fallback catalog data. Authenticated SDK clients and the existing App Store service ports remain the source of page data. The PC app root remains the composition root for standalone browser and desktop startup.

## Boundary

Consumers must import this package's public exports. They must not import `src/**` files from the PC app root or the private shell/feature facades directly.
