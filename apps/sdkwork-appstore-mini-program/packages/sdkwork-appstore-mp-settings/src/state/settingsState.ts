import type { SettingsPageResult } from "../types/settingsModels.js";

export interface SettingsState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: SettingsPageResult<unknown>;
  readonly error?: string;
}

export function initialSettingsState(): SettingsState {
  return { status: "idle" };
}

export function reduceSettingsState(
  state: SettingsState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: SettingsPageResult<unknown> }
    | { type: "failed"; error: string },
): SettingsState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
