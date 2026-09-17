import type { AppsPageResult } from "../types/appsModels.js";

export interface AppsState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: AppsPageResult<unknown>;
  readonly error?: string;
}

export function initialAppsState(): AppsState {
  return { status: "idle" };
}

export function reduceAppsState(
  state: AppsState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: AppsPageResult<unknown> }
    | { type: "failed"; error: string },
): AppsState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
