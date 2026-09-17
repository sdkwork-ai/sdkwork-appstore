import type { PublisherPageResult } from "../types/publisherModels.js";

export interface PublisherState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: PublisherPageResult<unknown>;
  readonly error?: string;
}

export function initialPublisherState(): PublisherState {
  return { status: "idle" };
}

export function reducePublisherState(
  state: PublisherState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: PublisherPageResult<unknown> }
    | { type: "failed"; error: string },
): PublisherState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
