/**
 * Appbase IAM runtime wiring for the mini program root.
 *
 * Authority: `APP_SDK_INTEGRATION_SPEC.md` and
 * `IAM_LOGIN_INTEGRATION_SPEC.md`. The root owns exactly one session; tokens
 * persist in wx storage so the login survives relaunch, and the appstore SDK
 * client seeds from the same session (`mp-core` session projection).
 */
export interface MiniProgramIamSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
  displayName?: string;
  userId?: string;
}

const STORAGE_KEY = 'sdkwork-appstore-mp-session';

const listeners = [];

function readStorage() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'object') {
      return raw;
    }
  } catch (error) {
    // storage unavailable (pre-launch window); fall back to memory only
  }
  return null;
}

function writeStorage(session) {
  try {
    wx.setStorageSync(STORAGE_KEY, session);
  } catch (error) {
    // storage full/unavailable; memory copy still holds the session
  }
}

let session = {};

export function loadPersistedIamSession() {
  const persisted = readStorage();
  if (persisted) {
    session = persisted;
  }
  return session;
}

export function getIamSession() {
  return session;
}

export function setIamSession(next) {
  session = next;
  writeStorage(next);
  for (const listener of listeners) {
    listener(next);
  }
}

export function clearIamSession() {
  session = {};
  try {
    wx.removeStorageSync(STORAGE_KEY);
  } catch (error) {
    // ignore; nothing persisted
  }
  for (const listener of listeners) {
    listener(session);
  }
}

export function onIamSessionChange(listener) {
  listeners.push(listener);
}

export function isIamAuthenticated() {
  const current = getIamSession();
  return Boolean(
    (current.authToken && current.authToken.length > 0) ||
      (current.accessToken && current.accessToken.length > 0),
  );
}
