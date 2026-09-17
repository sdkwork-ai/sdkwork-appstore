import common from '@ohos.app.ability.common';

/**
 * Appbase IAM runtime wiring for the entry module.
 *
 * Authority: `APP_SDK_INTEGRATION_SPEC.md` and
 * `IAM_LOGIN_INTEGRATION_SPEC.md`. Exactly one IAM runtime and one token
 * manager exist per root; feature packages receive session state by injection.
 */
export interface AppstoreIamRuntime {
  readonly context: common.UIAbilityContext;
}

let iamRuntime: AppstoreIamRuntime | null = null;

export function createIamRuntime(context: common.UIAbilityContext): AppstoreIamRuntime {
  if (iamRuntime === null) {
    iamRuntime = { context };
  }
  return iamRuntime;
}

export function getIamRuntime(): AppstoreIamRuntime {
  if (iamRuntime === null) {
    throw new Error('AppstoreIamRuntime must be created first');
  }
  return iamRuntime;
}
