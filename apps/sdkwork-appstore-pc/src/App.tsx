import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, InstallProvider } from '@sdkwork/appstore-pc-product'
import { createAppstorePcRuntime } from '@sdkwork/appstore-pc-runtime'
import { AppstorePcRoutes } from '@sdkwork/appstore-pc-host'
import '@sdkwork/appstore-pc-host/styles.css'

const runtime = createAppstorePcRuntime()

/** Standalone SDKWork App Store PC application root. */
export default function App() {
  return (
    <ThemeProvider>
      <InstallProvider>
        <BrowserRouter>
          <AppstorePcRoutes runtime={runtime} />
        </BrowserRouter>
      </InstallProvider>
    </ThemeProvider>
  )
}
