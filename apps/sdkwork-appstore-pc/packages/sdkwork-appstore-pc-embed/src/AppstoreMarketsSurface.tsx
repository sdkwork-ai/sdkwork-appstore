import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { MemoryRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import {
  AppDetailPage,
  DemandClaimDetailPage,
  DemandClaimsPage,
  DemandDetailPage,
  DemandsPage,
  ExpertsPage,
  InstallProvider,
  McpPage,
  PluginsPage,
  SkillsPage,
  TemplateDetailPage,
  TemplatesPage,
  initializeAppstorePcI18n,
  i18n,
  ThemeProvider,
} from '@sdkwork/appstore-pc-storefront';
import type { DemandHallItem } from '@sdkwork/appstore-pc-core';
import {
  createAppstorePcRuntime,
  resolveAppstorePcRuntimeConfig,
  type AppstorePcRuntime,
  type AppstorePcRuntimeConfig,
  type AuthTokenManager,
} from '@sdkwork/appstore-pc-runtime';
import {
  buildAppstorePcHostSessionCandidate,
  fingerprintAppstorePcHostSessionInput,
  onAppstorePcRuntimeSessionChanged,
  shouldApplyAppstorePcHostSession,
  createAppstorePcHostSessionSyncState,
} from '@sdkwork/appstore-pc-runtime';

/**
 * One catalog page of the App Store storefront, embeddable without the full
 * product shell. Hosts that already own navigation chrome (headers, tabs,
 * window controls) render one of these per tab instead of mounting the whole
 * `AppstorePcHost` router, so the storefront's catalog pages stay reusable
 * across embedding applications.
 */
export type AppstoreMarketsPage = 'plugins' | 'experts' | 'skills' | 'mcp' | 'templates' | 'demands';

const MARKET_PAGE_COMPONENTS = {
  plugins: PluginsPage,
  experts: ExpertsPage,
  skills: SkillsPage,
  mcp: McpPage,
  templates: TemplatesPage,
  demands: DemandsPage,
} as const satisfies Record<AppstoreMarketsPage, unknown>;

/** Session data accepted from the embedding application. */
export type AppstoreMarketsSurfaceSession = Parameters<
  AppstorePcRuntime['session']['setSession']
>[0];

/** Props for the single-page markets embed. */
export interface AppstoreMarketsSurfaceProps {
  /** Which market page the host renders in this surface instance. */
  page: AppstoreMarketsPage
  /** The storefront SDK base URL (all app SDKs share the platform gateway). */
  apiBaseUrl?: string
  /** Static access token for non-interactive deployments; ignored when a session carries its own tokens. */
  accessToken?: string
  /** BCP 47 locale tag; `zh*` resolves `zh-CN`, anything else `en-US`. */
  locale?: string
  /** The host's mounted IAM session, or null when signed out. */
  session?: AppstoreMarketsSurfaceSession | null
  /**
   * Token manager shared with the embedding application. Pass the host's
   * single instance so every SDK client binds one TokenManager
   * (APP_SDK_INTEGRATION_SPEC closure rule).
   */
  tokenManager?: AuthTokenManager
  /** Host color-scheme bridge: the surface follows the host theme instead of owning one. */
  resolveHostColorScheme?: () => 'light' | 'dark'
  subscribeHostColorScheme?: (listener: (scheme: 'light' | 'dark') => void) => () => void
  /**
   * Host action for the demands page: create and initialize a project from a
   * selected demand. The embedding host supplies it (BirdCoder's demand hall
   * does); without it the demand detail renders no start-project affordance.
   */
  onStartProject?: (demand: DemandHallItem) => void
  /**
   * Controlled catalog text filter forwarded to the market page. Embedding
   * hosts that own a search field (BirdCoder's Markets page header) pass
   * their live query; the page then renders no local search input — the
   * host's field is the one search. Omitted, the demands page renders its
   * own search-and-publish row and the other pages filter by the empty
   * string.
   */
  searchQuery?: string
  /**
   * CSS selector of the host-provided container that receives the templates
   * page's publish button (a portal target in the host's toolbar row). When
   * set, the button portals there instead of riding the platform-filter row.
   */
  templatesPublishSlotSelector?: string
  /**
   * Bump this value when the host reopens the page from its global navigation.
   * The embedded router remounts at the page root, so clicking the sidebar's
   * "Demand Hall" / "Template Library" entry returns to the hall/list even
   * when the host already has that page open on a detail route.
   */
  navigationResetKey?: number
}

function resolveMarketsConfig(props: AppstoreMarketsSurfaceProps): AppstorePcRuntimeConfig {
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
          companyAppApiBaseUrl: base,
        }
      : {}),
    ...(locale ? { locale } : {}),
  })
}

/**
 * Render one App Store market page (plugins, experts, skills, MCP, templates,
 * or demands) through its own isolated runtime, i18n provider, and
 * host-managed theme. The surface owns no navigation chrome: the host renders
 * its own header/tabs around it.
 *
 * Templates and demands are two-route surfaces inside this embed (catalog at
 * the router root, one entity at `/templates/:id` or `/demands/:id`): selecting
 * a card is a page navigation with a working back stack, not a dialog.
 *
 * The runtime seeds its session before the first render (market pages load
 * data in mount effects ahead of any post-render session apply), the
 * session-auth boundary never redirects the outer window, and host session
 * changes propagate through the same fingerprinted sync the full embed uses.
 * @param props - market page id plus explicit runtime credentials and host bridges.
 * @returns the market page element tree.
 */
export function AppstoreMarketsSurface(props: AppstoreMarketsSurfaceProps) {
  const config = useMemo(
    () => resolveMarketsConfig(props),
    [props.apiBaseUrl, props.locale],
  )
  const runtimeRef = useRef<AppstorePcRuntime | undefined>(undefined)
  if (runtimeRef.current === undefined) {
    const initialRuntime = createAppstorePcRuntime(config, {
      ...(props.tokenManager === undefined ? {} : { tokenManager: props.tokenManager }),
      sessionAuth: {
        readEnv: () => undefined,
        shouldRedirectOnUnauthorized: () => false,
      },
    })
    const initialSession = buildAppstorePcHostSessionCandidate(props.session, props.accessToken)
    if (initialSession) {
      initialRuntime.session.setSession(initialSession)
    }
    runtimeRef.current = initialRuntime
  }
  const runtime = runtimeRef.current
  const locale = props.locale?.trim() || config.locale

  initializeAppstorePcI18n(locale)

  const syncStateRef = useRef(createAppstorePcHostSessionSyncState())
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
    const nextSession = buildAppstorePcHostSessionCandidate(props.session, props.accessToken);
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

  const MarketPage = MARKET_PAGE_COMPONENTS[props.page]
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        resolveHostColorScheme={props.resolveHostColorScheme}
        subscribeHostColorScheme={props.subscribeHostColorScheme}
      >
        {/* Market pages render router-aware widgets (ExpertCard and the
            experts cards navigate), so the surface owns a MemoryRouter
            just like the full AppstorePcHost embed: hosts without a React
            Router context must still be able to mount one page. */}
        <MemoryRouter
          key={props.navigationResetKey ?? 0}
          initialEntries={['/']}
        >
          {props.page === 'demands' ? (
            // The demand hall is a two-route surface inside the embed: the
            // list lives at the router root and each demand reads at
            // /demands/:demandId, so selecting a card is a page navigation
            // (with a working back stack) rather than a dialog.
            <Routes>
              <Route
                path="/"
                element={
                  <DemandsPage
                    {...(props.searchQuery === undefined ? {} : { searchQuery: props.searchQuery })}
                  />
                }
              />
              <Route path="/demands" element={<Navigate to="/" replace />} />
              <Route path="/demands/my-claims" element={<DemandClaimsPage />} />
              <Route path="/demands/my-claims/:claimId" element={<DemandClaimDetailPage />} />
              <Route
                path="/demands/:demandId"
                element={
                  <DemandDetailPage
                    {...(props.onStartProject === undefined
                      ? {}
                      : { onStartProject: props.onStartProject })}
                  />
                }
              />
            </Routes>
          ) : props.page === 'templates' ? (
            // The template library is the same two-route shape: the catalog
            // lives at the router root and each template reads at
            // /templates/:templateId, so selecting a card is a page navigation
            // (with a working back stack) rather than a dialog.
            <Routes>
              <Route
                path="/"
                element={
                  <TemplatesPage
                    {...(props.searchQuery === undefined ? {} : { searchQuery: props.searchQuery })}
                    {...(props.templatesPublishSlotSelector === undefined
                      ? {}
                      : { publishSlotSelector: props.templatesPublishSlotSelector })}
                  />
                }
              />
              <Route path="/templates" element={<Navigate to="/" replace />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              {/* Historical detail links from older catalog cards. */}
              <Route path="/template/:id" element={<LegacyTemplateRedirect />} />
              {/* A template detail page links to the app built from it. That
                  surface needs the install provider, mounted on this route only
                  so the rest of the library stays install-free; the app's own
                  back button then returns to the template page. */}
              <Route
                path="/app/:id"
                element={
                  <InstallProvider>
                    <ScrollToTop>
                      <AppDetailPage />
                    </ScrollToTop>
                  </InstallProvider>
                }
              />
              {/* An unknown navigation must not unmount the routed surface:
                  fall back to the catalog instead of a blank column. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <MarketPage
              {...(props.searchQuery === undefined ? {} : { searchQuery: props.searchQuery })}
            />
          )}
        </MemoryRouter>
      </ThemeProvider>
    </I18nextProvider>
  )
}

/** Resolve a historical `/template/:id` link onto the routed detail path. */
function LegacyTemplateRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/templates/${id ?? ''}`} replace />
}

/**
 * Open a routed page at its top. The host owns the scroll container (BirdCoder's
 * template library scrolls its own column), so the nearest scrollable ancestor
 * of this wrapper is the one to reset; a page without one falls back to the
 * window.
 */
function ScrollToTop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let node: HTMLElement | null = ref.current?.parentElement ?? null
    while (node !== null) {
      const { overflowY } = window.getComputedStyle(node)
      if (overflowY === 'auto' || overflowY === 'scroll') {
        node.scrollTo({ top: 0 })
        return
      }
      node = node.parentElement
    }
    window.scrollTo({ top: 0 })
  }, [])
  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
