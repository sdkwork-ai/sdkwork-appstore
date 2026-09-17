/**
 * Appbase IAM runtime wiring for the mini program root.
 *
 * Authority: `APP_SDK_INTEGRATION_SPEC.md` and
 * `IAM_LOGIN_INTEGRATION_SPEC.md`. The root owns exactly one TokenManager and
 * one IAM runtime; feature packages receive session state by injection.
 */

export interface MiniProgramIamSession {
  accessToken?: string;
  refreshToken?: string;
}

let session: MiniProgramIamSession = {};

export function getIamSession(): MiniProgramIamSession {
  return session;
}

export function setIamSession(next: MiniProgramIamSession): void {
  session = next;
}

export function clearIamSession(): void {
  session = {};
}
