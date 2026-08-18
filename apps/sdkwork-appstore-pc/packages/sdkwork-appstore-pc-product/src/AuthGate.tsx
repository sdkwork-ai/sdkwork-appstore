import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SdkworkIamAuthRoutes } from '@sdkwork/auth-pc-react';

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
}

export function AuthGate({ children, runtime }: AuthGateProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hydrating, setHydrating] = useState(true);
  const [snapshot, setSnapshot] = useState(() => runtime.session.getSnapshot());

  useEffect(() => runtime.session.subscribe(setSnapshot), [runtime.session]);

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
          setSnapshot(runtime.session.refreshSession());
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
        hasSession: hasAuthenticatedAppstorePcSession(snapshot),
        location,
      }),
    [location, snapshot],
  );

  useEffect(() => {
    if (!hydrating && decision.kind === 'redirect') {
      navigate(decision.to, { replace: true });
    }
  }, [decision, hydrating, navigate]);

  if (hydrating || decision.kind === 'redirect') {
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

  return <>{children}</>;
}
