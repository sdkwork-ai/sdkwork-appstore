import type { CategoryPageResult } from "../types/categoryModels.js";

export interface CategoryState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: CategoryPageResult<unknown>;
  readonly error?: string;
}

export function initialCategoryState(): CategoryState {
  return { status: "idle" };
}

export function reduceCategoryState(
  state: CategoryState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: CategoryPageResult<unknown> }
    | { type: "failed"; error: string },
): CategoryState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
