import type { MiniProgramRuntimeEnv } from "@sdkwork/appstore-mp-core";

let current: MiniProgramRuntimeEnv | null = null;

export function readRuntimeEnv(): MiniProgramRuntimeEnv {
  if (current) {
    return current;
  }
  throw new Error(
    "mini program runtime environment must be seeded before SDK bootstrap",
  );
}

export function seedRuntimeEnv(env: MiniProgramRuntimeEnv): MiniProgramRuntimeEnv {
  current = env;
  return current;
}
