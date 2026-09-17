import type { UserStorePageResult } from "../types/userStoreModels.js";

export interface UserStoreState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: UserStorePageResult<unknown>;
  readonly error?: string;
}

export function initialUserStoreState(): UserStoreState {
  return { status: "idle" };
}

export function reduceUserStoreState(
  state: UserStoreState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: UserStorePageResult<unknown> }
    | { type: "failed"; error: string },
): UserStoreState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
