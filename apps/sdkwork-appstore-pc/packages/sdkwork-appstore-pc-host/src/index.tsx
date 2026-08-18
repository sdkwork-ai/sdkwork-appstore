import { useEffect, useMemo, useRef } from 'react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SdkworkSessionAuthBrowserRoot } from '@sdkwork/auth-pc-react'
import {
  AdminPermissionGate,
  AdminMonitorPage,
  AppDetailPage,
  AppstoreAuthShell,
  AppsPage,
  AIHubPage,
  AuthGate,
  CategoryPage,
  ChartsPage,
  CollectionPage,
  ConsoleSettingsPage,
  DiscoverPage,
  EventPage,
  GamesPage,
  InstallProvider,
  Layout,
  LibraryPage,
  McpPage,
  PluginsPage,
  PublisherAppManagePage,
  PublisherCreateAppPage,
  PublisherOverviewPage,
  SearchPage,
  SkillsPage,
  TemplateDetailPage,
  TemplatesPage,
  ThemeProvider,
  UpdatesPage,
  WishlistPage,
  initializeAppstorePcI18n,
  i18n,
} from '@sdkwork/appstore-pc-product'
import {
  buildAppstorePcHostSessionCandidate,
  createAppstorePcHostSessionSyncState,
  fingerprintAppstorePcHostSessionInput,
  onAppstorePcRuntimeSessionChanged,
  shouldApplyAppstorePcHostSession,
  createAppstorePcRuntime,
  resolveAppstorePcAuthRuntimeConfig,
  resolveAppstorePcRuntimeConfig,
  type AppstorePcRuntime,
  type AppstorePcRuntimeConfig,
} from '@sdkwork/appstore-pc-runtime'
import './styles.css'

/** Session data accepted from an embedding application. */
export type AppstorePcHostSession = Parameters<AppstorePcRuntime['session']['setSession']>[0]

/** Runtime and navigation inputs for the embeddable App Store surface. */
export interface AppstorePcHostProps {
  apiBaseUrl?: string
  accessToken?: string
  locale?: string
  initialPath?: string
  session?: AppstorePcHostSession | null
  runtime?: AppstorePcRuntime
  onPathChange?: (path: string) => void
}

/** Public route composition used by the PC app and embedded hosts. */
export function AppstorePcRoutes({ runtime }: { runtime: AppstorePcRuntime }) {
  return (
    <SdkworkSessionAuthBrowserRoot>
      <AuthGate runtime={runtime}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DiscoverPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="ai-hub" element={<AIHubPage />} />
            <Route path="plugins" element={<PluginsPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="mcp" element={<McpPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="template/:id" element={<TemplateDetailPage />} />
            <Route path="templates/:id" element={<TemplateDetailPage />} />
            <Route path="charts" element={<ChartsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="collection/:id" element={<CollectionPage />} />
            <Route path="events/:id" element={<EventPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="app/:id" element={<AppDetailPage />} />
            <Route path="console/settings" element={<ConsoleSettingsPage />} />
            <Route path="console" element={<Navigate to="/console/settings" replace />} />
            <Route path="publisher" element={<PublisherOverviewPage />} />
            <Route path="publisher/apps/new" element={<PublisherCreateAppPage />} />
            <Route path="publisher/apps/:id" element={<PublisherAppManagePage />} />
            <Route
              path="admin/monitor"
              element={
                <AdminPermissionGate runtime={runtime}>
                  <AdminMonitorPage />
                </AdminPermissionGate>
              }
            />
            <Route path="admin" element={<Navigate to="/admin/monitor" replace />} />
          </Route>
        </Routes>
      </AuthGate>
    </SdkworkSessionAuthBrowserRoot>
  )
}

function PathObserver({ onPathChange }: { onPathChange?: (path: string) => void }) {
  const location = useLocation()
  useEffect(() => {
    onPathChange?.(`${location.pathname}${location.search}${location.hash}`)
  }, [location, onPathChange])
  return null
}

function resolveHostConfig(props: AppstorePcHostProps): AppstorePcRuntimeConfig {
  const base = props.apiBaseUrl?.trim()
  const locale = props.locale?.trim()
  return resolveAppstorePcRuntimeConfig({
    ...(base
      ? {
          agentsAppApiBaseUrl: base,
          appApiBaseUrl: base,
          backendApiBaseUrl: base,
          commentsAppApiBaseUrl: base,
          iamAppApiBaseUrl: base,
          mcpAppApiBaseUrl: base,
          skillsAppApiBaseUrl: base,
        }
      : {}),
    ...(locale ? { locale } : {}),
  })
}

function useHostSessionSync(
  runtime: AppstorePcRuntime,
  props: AppstorePcHostProps,
): void {
  const syncStateRef = useRef(createAppstorePcHostSessionSyncState());

  useEffect(() => {
    return runtime.session.subscribe(() => {
      const hostFingerprint = fingerprintAppstorePcHostSessionInput(
        props.session,
        props.accessToken,
      );
      syncStateRef.current = onAppstorePcRuntimeSessionChanged(
        syncStateRef.current,
        runtime.session.getSnapshot(),
        hostFingerprint,
      );
    });
  }, [
    props.accessToken,
    props.session,
    props.session?.accessToken,
    props.session?.authToken,
    props.session?.refreshToken,
    props.session?.sessionId,
    runtime.session,
  ]);

  useEffect(() => {
    const hostFingerprint = fingerprintAppstorePcHostSessionInput(
      props.session,
      props.accessToken,
    );
    const nextSession = buildAppstorePcHostSessionCandidate(
      props.session,
      props.accessToken,
    );
    if (!nextSession) {
      return;
    }

    const storeSnapshot = runtime.session.getSnapshot();
    if (
      !shouldApplyAppstorePcHostSession(
        syncStateRef.current,
        storeSnapshot,
        hostFingerprint,
        nextSession,
      )
    ) {
      if (hostFingerprint) {
        syncStateRef.current = {
          ...syncStateRef.current,
          lastAppliedHostFingerprint: hostFingerprint,
        };
      }
      return;
    }

    syncStateRef.current = {
      ...syncStateRef.current,
      lastAppliedHostFingerprint: hostFingerprint,
      suppressedHostFingerprint: null,
    };
    runtime.session.setSession(nextSession);
  }, [
    props.accessToken,
    props.session?.accessToken,
    props.session?.authToken,
    props.session?.refreshToken,
    props.session?.sessionId,
    props.session === null,
    props.session === undefined,
    runtime,
  ]);
}

/**
 * Render the complete SDKWork App Store product inside an isolated host router.
 * @param props - explicit runtime credentials, locale, and navigation inputs.
 * @returns the App Store product shell and route tree.
 */
export function AppstorePcHost(props: AppstorePcHostProps = {}) {
  const config = useMemo(
    () => resolveHostConfig(props),
    [props.apiBaseUrl, props.locale],
  )
  const runtimeRef = useRef<AppstorePcRuntime | undefined>(undefined)
  const runtime = props.runtime ?? runtimeRef.current ?? (runtimeRef.current = createAppstorePcRuntime(config))
  const locale = props.locale?.trim() || config.locale

  initializeAppstorePcI18n(locale)

  useHostSessionSync(runtime, props)

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <InstallProvider>
          <MemoryRouter initialEntries={[props.initialPath ?? '/']}>
            <PathObserver onPathChange={props.onPathChange} />
            <AppstorePcRoutes runtime={runtime} />
          </MemoryRouter>
        </InstallProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}

export { AppstoreAuthShell, resolveAppstorePcAuthRuntimeConfig }
export type { AppstorePcRuntime, AppstorePcRuntimeConfig }
