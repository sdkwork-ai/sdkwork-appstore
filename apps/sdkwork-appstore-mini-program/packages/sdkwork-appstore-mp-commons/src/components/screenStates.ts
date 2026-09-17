export interface ScreenState {
  readonly kind: "loading" | "empty" | "error" | "ready";
  readonly message: string;
}

export function loadingState(): ScreenState {
  return { kind: "loading", message: "Loading" };
}

export function emptyState(message: string): ScreenState {
  return { kind: "empty", message };
}

export function errorState(message: string): ScreenState {
  return { kind: "error", message };
}

export function readyState(): ScreenState {
  return { kind: "ready", message: "" };
}
