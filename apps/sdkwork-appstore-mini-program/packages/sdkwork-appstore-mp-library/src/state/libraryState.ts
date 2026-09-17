import type { LibraryPageResult } from "../types/libraryModels.js";

export interface LibraryState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: LibraryPageResult<unknown>;
  readonly error?: string;
}

export function initialLibraryState(): LibraryState {
  return { status: "idle" };
}

export function reduceLibraryState(
  state: LibraryState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: LibraryPageResult<unknown> }
    | { type: "failed"; error: string },
): LibraryState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
