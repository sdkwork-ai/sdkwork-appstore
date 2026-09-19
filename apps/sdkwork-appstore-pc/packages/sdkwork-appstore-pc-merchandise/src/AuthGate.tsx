import { Fragment, type ReactNode, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SdkworkIamAuthRoutes, SdkworkSessionAuthLoginModal } from '@sdkwork/auth-pc-react';

import {
  hasAuthenticatedAppstorePcSession,
} from './bootstrap/sessionStore';
import { resolveAppstorePcAuthRuntimeConfig } from './bootstrap/authConfig';
import { prepareAppstorePcCredentialEntryTokens } from './bootstrap/credentialEntry';
import type { AppstorePcRuntime } from './bootstrap/runtime';
import { resolveAppstorePcAuthGateDecision } from './authGateLogic';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AppstoreAuthShell } from './auth/AppstoreAuthShell';
import { resolveAppstoreAuthAppearance } from './auth/appstoreAuthAppearance';

interface AuthGateProps {
  children: ReactNode;
  runtime: AppstorePcRuntime;
  /**
   * Sign-in UX when an unauthenticated visitor opens a protected route
   * (library, wishlist, updates, console, publisher): "modal" renders the
   * sign-in dialog over the requested page so the surrounding application
   * state survives; "auth-route" navigates to the full auth route (the
   * standalone application). Direct visits to /auth/* always render the auth
   * route.
   */
  protectedRouteSignIn?: 'modal' | 'auth-route';
}

export function AuthGate({
  children,
  protectedRouteSignIn = 'auth-route',
  runtime,
}: AuthGateProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hydrating, setHydrating] = useState(true);
  const snapshot = useSyncExternalStore(
    (listener) => runtime.session.subscribe(listener),
    () => runtime.session.getSnapshot(),
    () => runtime.session.getSnapshot(),
  );
  const authenticated = hasAuthenticatedAppstorePcSession(snapshot);

  useEffect(() => {
    let active = true;

    const validateStoredSession = async () => {
      try {
        prepareAppstorePcCredentialEntryTokens(runtime.iamRuntime.tokenManager, runtime.session);
        await runtime.iamRuntime.hydrateTokenManager();
        if (hasAuthenticatedAppstorePcSession(runtime.session.getSnapshot())) {
          await runtime.iamRuntime.service.auth.sessions.current.retrieve();
        }
      } catch {
        await runtime.iamRuntime.clearSession();
      } finally {
        if (active) {
          runtime.session.refreshSession();
          setHydrating(false);
        }
      }
    };

    void validateStoredSession();
    return () => {
      active = false;
    };
  }, [runtime.iamRuntime, runtime.session]);

  const decision = useMemo(
    () =>
      resolveAppstorePcAuthGateDecision({
        hasSession: authenticated,
        location,
      }),
    [authenticated, location],
  );

  useEffect(() => {
    if (hydrating || decision.kind !== 'redirect') {
      return;
    }
    // Modal mode keeps unauthenticated visitors mounted on the requested
    // route behind the sign-in dialog; only the authenticated auth-route
    // cleanup (a signed-in visit to /auth/*) navigates away.
    if (protectedRouteSignIn === 'modal' && !authenticated) {
      return;
    }
    navigate(decision.to, { replace: true });
  }, [authenticated, decision, hydrating, navigate, protectedRouteSignIn]);

  const gatedChildren = (
    <Fragment key={authenticated ? 'appstore-auth-gate-authenticated' : 'appstore-auth-gate-anonymous'}>
      {children}
    </Fragment>
  );

  if (hydrating || decision.kind === 'redirect') {
    if (decision.kind === 'redirect' && protectedRouteSignIn === 'modal' && !authenticated) {
      // The requested page stays mounted behind the dialog; the keyed children
      // remount once sign-in commits so its data loads run with the session.
      return (
        <>
          {gatedChildren}
          <SdkworkSessionAuthLoginModal
            appearance={resolveAppstoreAuthAppearance()}
            getRuntime={() => runtime.iamRuntime}
            locale={runtime.config.locale}
            onAuthComplete={() => {
              runtime.session.refreshSession();
            }}
            onDismiss={() => {
              navigate(-1);
            }}
            returnPath={`${location.pathname}${location.search ?? ''}${location.hash ?? ''}`}
            runtimeConfig={resolveAppstorePcAuthRuntimeConfig()}
          />
        </>
      );
    }
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (decision.kind === 'auth-route') {
    return (
      <AppstoreAuthShell>
        <SdkworkIamAuthRoutes
          appearance={resolveAppstoreAuthAppearance()}
          basePath="/auth"
          className="!bg-transparent"
          getRuntime={() => runtime.iamRuntime}
          homePath="/"
          locale={runtime.config.locale}
          runtimeConfig={resolveAppstorePcAuthRuntimeConfig()}
          viewportMode="flow"
        />
      </AppstoreAuthShell>
    );
  }

  return gatedChildren;
}
