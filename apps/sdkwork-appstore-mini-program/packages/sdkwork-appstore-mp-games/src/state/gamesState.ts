import type { GamesPageResult } from "../types/gamesModels.js";

export interface GamesState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: GamesPageResult<unknown>;
  readonly error?: string;
}

export function initialGamesState(): GamesState {
  return { status: "idle" };
}

export function reduceGamesState(
  state: GamesState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: GamesPageResult<unknown> }
    | { type: "failed"; error: string },
): GamesState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
