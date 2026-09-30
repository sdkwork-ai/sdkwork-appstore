import { useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SdkworkIamH5AuthRoutes } from '@sdkwork/iam-h5-auth';
import {
  commitIamAuthSession,
  createAppstoreAuthController,
  fetchCurrentIamUser,
  isAuthenticated,
} from '@/bootstrap/iamRuntime';

/**
 * Login surface of the H5 root.
 *
 * The screens are the shared IAM components (`@sdkwork/iam-h5-auth`, mounted
 * through its routes entry so the bundled i18n catalog and locale apply);
 * this page only binds this root's auth controller, persists the produced
 * session through the bootstrap, and routes back to where the visitor came
 * from. No login form logic lives here (`IAM_LOGIN_INTEGRATION_SPEC.md`).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const controller = useMemo(() => createAppstoreAuthController(), []);

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="h-screen">
      <SdkworkIamH5AuthRoutes
        controller={controller}
        basePath="/login"
        locale="zh-CN"
        onAuthenticated={(session) => {
          commitIamAuthSession(session);
          void fetchCurrentIamUser().finally(() => {
            navigate(from, { replace: true });
          });
        }}
      />
    </div>
  );
}
