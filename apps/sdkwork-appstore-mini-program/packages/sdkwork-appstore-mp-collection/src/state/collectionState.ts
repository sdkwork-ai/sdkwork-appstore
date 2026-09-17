import type { CollectionPageResult } from "../types/collectionModels.js";

export interface CollectionState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: CollectionPageResult<unknown>;
  readonly error?: string;
}

export function initialCollectionState(): CollectionState {
  return { status: "idle" };
}

export function reduceCollectionState(
  state: CollectionState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: CollectionPageResult<unknown> }
    | { type: "failed"; error: string },
): CollectionState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
