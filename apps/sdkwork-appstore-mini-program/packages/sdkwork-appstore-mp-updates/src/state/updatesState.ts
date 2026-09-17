import type { UpdatesPageResult } from "../types/updatesModels.js";

export interface UpdatesState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: UpdatesPageResult<unknown>;
  readonly error?: string;
}

export function initialUpdatesState(): UpdatesState {
  return { status: "idle" };
}

export function reduceUpdatesState(
  state: UpdatesState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: UpdatesPageResult<unknown> }
    | { type: "failed"; error: string },
): UpdatesState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
