import type { AppDetailPageResult } from "../types/appDetailModels.js";

export interface AppDetailState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: AppDetailPageResult<unknown>;
  readonly error?: string;
}

export function initialAppDetailState(): AppDetailState {
  return { status: "idle" };
}

export function reduceAppDetailState(
  state: AppDetailState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: AppDetailPageResult<unknown> }
    | { type: "failed"; error: string },
): AppDetailState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
