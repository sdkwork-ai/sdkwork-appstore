import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, InstallProvider } from '@sdkwork/appstore-pc-merchandise'
import { createAppstorePcRuntime } from '@sdkwork/appstore-pc-runtime'
import { AppstorePcRoutes } from '@sdkwork/appstore-pc-embed'
import '@sdkwork/appstore-pc-embed/styles.css'

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
