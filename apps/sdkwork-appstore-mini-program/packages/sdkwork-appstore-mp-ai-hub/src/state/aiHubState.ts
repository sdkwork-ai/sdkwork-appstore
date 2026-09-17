import type { AiHubPageResult } from "../types/aiHubModels.js";

export interface AiHubState {
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly lastResult?: AiHubPageResult<unknown>;
  readonly error?: string;
}

export function initialAiHubState(): AiHubState {
  return { status: "idle" };
}

export function reduceAiHubState(
  state: AiHubState,
  event:
    | { type: "load" }
    | { type: "loaded"; result: AiHubPageResult<unknown> }
    | { type: "failed"; error: string },
): AiHubState {
  switch (event.type) {
    case "load":
      return { ...state, status: "loading", error: undefined };
    case "loaded":
      return { status: "ready", lastResult: event.result };
    case "failed":
      return { ...state, status: "error", error: event.error };
  }
}
