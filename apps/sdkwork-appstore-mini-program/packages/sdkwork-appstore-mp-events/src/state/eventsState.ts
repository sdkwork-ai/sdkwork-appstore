import type { EventsPageResult } from "../types/eventsModels.js";

export interface EventsState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: EventsPageResult<unknown>;
  readonly error?: string;
}

export function initialEventsState(): EventsState {
  return { status: "idle" };
}

export function reduceEventsState(
  state: EventsState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: EventsPageResult<unknown> }
    | { type: "failed"; error: string },
): EventsState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
