import type { WishlistPageResult } from "../types/wishlistModels.js";

export interface WishlistState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: WishlistPageResult<unknown>;
  readonly error?: string;
}

export function initialWishlistState(): WishlistState {
  return { status: "idle" };
}

export function reduceWishlistState(
  state: WishlistState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: WishlistPageResult<unknown> }
    | { type: "failed"; error: string },
): WishlistState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
