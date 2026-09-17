import type { DiscoverPageResult } from "../types/discoverModels.js";

export interface DiscoverState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: DiscoverPageResult<unknown>;
  readonly error?: string;
}

export function initialDiscoverState(): DiscoverState {
  return { status: "idle" };
}

export function reduceDiscoverState(
  state: DiscoverState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: DiscoverPageResult<unknown> }
    | { type: "failed"; error: string },
): DiscoverState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
