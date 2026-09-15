import type { AppstoreAdminOperatorSession } from '../session';

/**
 * Host environment the operator console requires.
 *
 * `pc-admin-shell` is a surface package: it renders inside the host product's
 * router and i18n provider, so it receives environment facts as props instead
 * of reaching into an application runtime (`APP_PC_ARCHITECTURE_SPEC.md` §6).
 */
export interface AppstorePcAdminHostPort {
  /** Runtime family the console renders in; drives dense-table affordances. */
  platform: 'browser' | 'desktop' | 'tablet';
  /** Operator identity facts used for access decisions. */
  session: AppstoreAdminOperatorSession;
  /** BCP 47 locale tag the console renders in, for example `zh-CN`. */
  locale: string;
  /** Operator display name shown in the shell header, when available. */
  operatorName?: string;
}
