import { useEffect, useMemo, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import {
  ExpertsPage,
  McpPage,
  PluginsPage,
  SkillsPage,
  initializeAppstorePcI18n,
  i18n,
  ThemeProvider,
} from '@sdkwork/appstore-pc-product';
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
 * One market page of the App Store storefront, embeddable without the full
 * product shell. Hosts that already own navigation chrome (headers, tabs,
 * window controls) render one of these per tab instead of mounting the whole
 * `AppstorePcHost` router, so the storefront's catalog pages stay reusable
 * across embedding applications.
 */
export type AppstoreMarketsPage = 'plugins' | 'experts' | 'skills' | 'mcp';

const MARKET_PAGE_COMPONENTS = {
  plugins: PluginsPage,
  experts: ExpertsPage,
  skills: SkillsPage,
  mcp: McpPage,
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
        }
      : {}),
    ...(locale ? { locale } : {}),
  })
}

/**
 * Render one App Store market page (plugins, experts, skills, or MCP) through
 * its own isolated runtime, i18n provider, and host-managed theme. The surface
 * owns no navigation chrome: the host renders its own header/tabs around it.
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
        <MarketPage />
      </ThemeProvider>
    </I18nextProvider>
  )
}
