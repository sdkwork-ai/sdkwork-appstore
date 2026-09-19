/**
 * Mini program runtime environment contract.
 *
 * The application root owns this contract, mirroring the H5 root's local
 * `RuntimeEnvironment`: values are produced by the root bootstrap from
 * `config/mini-program/runtime-env.<profileId>.json` and capability packages
 * consume them through injection rather than reading the platform directly
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
export interface MiniProgramRuntimeEnv {
  /** Selected deployment profile id, for example `standalone.development`. */
  profileId: string;
  /** App Store app-api origin including the `/app/v3/api` path. */
  appstoreAppApiBaseUrl: string;
}

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
