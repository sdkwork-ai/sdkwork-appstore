import type { SearchPageResult } from "../types/searchModels.js";

export interface SearchState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: SearchPageResult<unknown>;
  readonly error?: string;
}

export function initialSearchState(): SearchState {
  return { status: "idle" };
}

export function reduceSearchState(
  state: SearchState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: SearchPageResult<unknown> }
    | { type: "failed"; error: string },
): SearchState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
