import type { ChartsPageResult } from "../types/chartsModels.js";

export interface ChartsState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: ChartsPageResult<unknown>;
  readonly error?: string;
}

export function initialChartsState(): ChartsState {
  return { status: "idle" };
}

export function reduceChartsState(
  state: ChartsState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: ChartsPageResult<unknown> }
    | { type: "failed"; error: string },
): ChartsState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
