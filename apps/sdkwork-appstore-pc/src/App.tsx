import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import {
  ThemeProvider,
  InstallProvider,
  initializeAppstorePcI18n,
  i18n,
} from '@sdkwork/appstore-pc-storefront'
import { createAppstorePcRuntime } from '@sdkwork/appstore-pc-runtime'
import { AppstorePcRoutes } from '@sdkwork/appstore-pc-embed'
import '@sdkwork/appstore-pc-embed/styles.css'

const runtime = createAppstorePcRuntime()

/** Standalone SDKWork App Store PC application root. */
export default function App() {
  // The storefront i18n module owns a dedicated instance (not the i18next
  // module singleton), so every entry surface provides it explicitly —
  // components using useTranslation read the instance from context.
  initializeAppstorePcI18n()
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <InstallProvider>
          <BrowserRouter>
            <AppstorePcRoutes runtime={runtime} />
          </BrowserRouter>
        </InstallProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}
