import { registerMiniProgramHostAdapters } from "@sdkwork/appstore-mp-host";

/** Register platform host adapters before the first page renders. */
export function registerHostAdapters(): void {
  registerMiniProgramHostAdapters();
}
