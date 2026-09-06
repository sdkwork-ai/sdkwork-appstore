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
  ExpertsPage,
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
  UserStorePage,
  PublicUserStorePage,
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
  SDKWORK_SESSION_AUTH_UNAUTHORIZED_MODE_ENV_KEY,
  type AppstorePcRuntime,
  type AppstorePcRuntimeConfig,
  type AuthTokenManager,
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
  /**
   * Token manager shared with the embedding application. Passed to the created
   * runtime so every SDK client binds the host's single TokenManager instance
   * (APP_SDK_INTEGRATION_SPEC closure rule); ignored when `runtime` is given.
   */
  tokenManager?: AuthTokenManager
  onPathChange?: (path: string) => void
  /**
   * Whether the embedded product renders its own header action icons
   * (language switcher, updates link, theme toggle, user badge, window
   * controls). Embedding applications that already provide these affordances
   * pass false to avoid duplicated chrome; the standalone default is true.
   */
  showHeaderActions?: boolean
  resolveHostColorScheme?: () => 'light' | 'dark'
  subscribeHostColorScheme?: (listener: (scheme: 'light' | 'dark') => void) => () => void
}

/** Public route composition used by the PC app and embedded hosts. */
export function AppstorePcRoutes({
  protectedRouteSignIn = 'auth-route',
  showHeaderActions = true,
  runtime,
}: {
  runtime: AppstorePcRuntime;
  /**
   * Sign-in UX for protected routes: "modal" (embedded hosts) opens the
   * sign-in dialog over the requested page; "auth-route" (standalone app)
   * navigates to the full auth route.
   */
  protectedRouteSignIn?: 'modal' | 'auth-route';
  /**
   * Whether the layout renders the header action icon cluster. Embedding
   * hosts that already own these affordances pass false.
   */
  showHeaderActions?: boolean;
}) {
  return (
    <SdkworkSessionAuthBrowserRoot
      getRuntime={() => runtime.iamRuntime}
      locale={runtime.config.locale}
      runtimeConfig={resolveAppstorePcAuthRuntimeConfig()}
    >
      <AuthGate protectedRouteSignIn={protectedRouteSignIn} runtime={runtime}>
        <Routes>
          <Route path="/" element={<Layout showHeaderActions={showHeaderActions} />}>
            <Route index element={<DiscoverPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="ai-hub" element={<AIHubPage />} />
            <Route path="experts" element={<ExpertsPage />} />
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
            <Route path="user-store" element={<UserStorePage />} />
            {/* Anonymous public share view: /store/:shareToken must stay
              outside the protected-path prefixes (authGateLogic) so visitors
              without a session can browse a shared personal Appstore. */}
            <Route path="store/:shareToken" element={<PublicUserStorePage />} />
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
  if (runtimeRef.current === undefined && props.runtime === undefined) {
    // Seed the session store before the first render: page data loaders run in
    // child effects ahead of useHostSessionSync's post-render apply, and the
    // generated SDK clients refuse to dispatch without credentials, so a late
    // session would silently empty every first-mount page.
    //
    // The session-auth boundary never redirects or hijacks the outer window:
    // an unauthorized response inside an embedded surface must not navigate
    // the hosting application away (a desktop carrier 404s on /auth/login and
    // the whole window goes blank), and the modal dispatch would still steer
    // the embedded router to the sign-in route on background catalog calls.
    // Both knobs are pinned: the mode resolves to "redirect" (no dispatch)
    // and the redirect itself is suppressed. Anonymous catalog browsing keeps
    // rendering, the embedded AuthGate owns the sign-in flow at the route
    // level, and account-bound calls degrade through their own catch handlers.
    const initialRuntime = createAppstorePcRuntime(config, {
      ...(props.tokenManager === undefined ? {} : { tokenManager: props.tokenManager }),
      sessionAuth: {
        readEnv: (name) =>
          name === SDKWORK_SESSION_AUTH_UNAUTHORIZED_MODE_ENV_KEY ? 'redirect' : undefined,
        shouldRedirectOnUnauthorized: () => false,
      },
    })
    const initialSession = buildAppstorePcHostSessionCandidate(props.session, props.accessToken)
    if (initialSession) {
      initialRuntime.session.setSession(initialSession)
    }
    runtimeRef.current = initialRuntime
  }
  const runtime = props.runtime ?? runtimeRef.current
  const locale = props.locale?.trim() || config.locale

  initializeAppstorePcI18n(locale)

  useHostSessionSync(runtime, props)

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        resolveHostColorScheme={props.resolveHostColorScheme}
        subscribeHostColorScheme={props.subscribeHostColorScheme}
      >
        <InstallProvider>
          <MemoryRouter initialEntries={[props.initialPath ?? '/']}>
            <PathObserver onPathChange={props.onPathChange} />
            <AppstorePcRoutes
              protectedRouteSignIn="modal"
              showHeaderActions={props.showHeaderActions}
              runtime={runtime}
            />
          </MemoryRouter>
        </InstallProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}

export { AppstoreAuthShell, resolveAppstorePcAuthRuntimeConfig }
export type { AppstorePcRuntime, AppstorePcRuntimeConfig }
