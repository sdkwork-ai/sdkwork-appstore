import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

test("app-api base URL resolves through @sdkwork/sdk-common (ENVIRONMENT_SPEC §6.3)", () => {
  const source = read(
    "packages/sdkwork-appstore-mp-core/src/sdk/appstoreAppApiBaseUrl.ts",
  );
  assert.match(source, /from\s+["']@sdkwork\/sdk-common["']/u);
  assert.match(source, /\bresolveBaseUrl\b/u);
  assert.match(source, /preservePath:\s*true/u);
  assert.doesNotMatch(
    source,
    /https?:\/\//u,
    "base-url candidates belong in config/mini-program, never in source",
  );
});

test("runtime bundle keeps the app-api origin in configuration, not source", () => {
  const source = read("src/bootstrap/runtimeBundle.ts");
  assert.doesNotMatch(
    source,
    /https?:\/\//u,
    "the bundle must not carry a hardcoded app-api origin",
  );
  assert.match(source, /resolveAppstoreAppApiBaseUrl\(/u);
  assert.match(source, /__SDKWORK_RUNTIME_ENV__/u);
});

test("root bootstrap forwards the app-api base URL override into resolution", () => {
  const source = read("src/bootstrap/runtime.ts");
  assert.match(
    source,
    /seedRuntimeEnvFromBundle\(\{\s*appApiBaseUrl:\s*options\.appApiBaseUrl\s*\}\)/u,
    "the documented appApiBaseUrl option must reach resolveBaseUrl, not be dropped",
  );
});

test("runtime environment contract is owned by the application root", () => {
  const source = read("src/bootstrap/environment.ts");
  assert.match(source, /export interface MiniProgramRuntimeEnv/u);
  assert.doesNotMatch(
    source,
    /from\s+["']@sdkwork\/appstore-mp-core["']/u,
    "the root owns its environment contract; capability packages receive values by injection",
  );
});

test("registered pages keep their platform assets", () => {
  const appJson = JSON.parse(read("src/app.json"));
  const pages = appJson.pages ?? [];
  assert.ok(pages.length > 0, "at least one page must be registered");
  for (const page of pages) {
    for (const extension of [".js", ".json", ".wxml"]) {
      assert.ok(
        existsSync(path.join(ROOT, "src", `${page}${extension}`)),
        `missing page asset: src/${page}${extension}`,
      );
    }
  }
});

test("built runtime bundle exports the surface the thin pages destructure", () => {
  const bundle = read("src/runtime/appstore-app.js");
  for (const name of [
    "bootstrapAppstoreMiniProgram",
    "pageLoaders",
    "auth",
    "loadCurrentUser",
    "loadPersistedIamSession",
    "getIamSession",
    "setIamSession",
    "clearIamSession",
    "onIamSessionChange",
    "isIamAuthenticated",
  ]) {
    assert.ok(
      bundle.includes(name),
      `runtime bundle must export ${name}: pages destructure it at require time`,
    );
  }
});

test("every page destructured runtime symbol is a bundle export", () => {
  const bundle = read("src/runtime/appstore-app.js");
  const pageDir = path.join(ROOT, "src/pages");
  for (const entry of readdirSync(pageDir)) {
    const pageJs = path.join(pageDir, entry, "index.js");
    if (!existsSync(pageJs)) {
      continue;
    }
    const source = readFileSync(pageJs, "utf8");
    const match = source.match(
      /const\s*\{([^}]+)\}\s*=\s*require\(["'][^"']*runtime\/appstore-app["']\)/u,
    );
    if (!match) {
      continue;
    }
    for (const raw of match[1].split(",")) {
      const symbol = raw.trim().split(/\s+as\s+/u)[0];
      if (symbol === "") {
        continue;
      }
      assert.ok(
        new RegExp(`(?:^|[\\s,{])${symbol}\\s*[:(}]`).test(bundle) ||
          bundle.includes(symbol),
        `page src/pages/${entry}/index.js destructures "${symbol}" but the runtime bundle does not export it`,
      );
    }
  }
});

test("page session module resolves into the runtime bundle (single instance)", () => {
  const shim = read("src/bootstrap/iamRuntime.js");
  assert.match(
    shim,
    /module\.exports\s*=\s*require\("\.\.\/runtime\/appstore-app"\)/u,
    "iamRuntime.js must re-export the bundle session module so pages and loaders share one session",
  );
});

test("manifest exposes the canonical mini-program runtime build entry", () => {
  const manifest = JSON.parse(read("package.json"));
  assert.equal(
    manifest.scripts["build:mini-program"],
    "node scripts/build-runtime.mjs",
  );
});

test("every configured runtime profile declares an app-api base URL", () => {
  const configDir = path.join(ROOT, "config/mini-program");
  const profiles = [
    "standalone.development",
    "standalone.test",
    "standalone.staging",
    "standalone.production",
    "cloud.development",
    "cloud.test",
    "cloud.staging",
    "cloud.production",
  ];
  for (const profileId of profiles) {
    const filePath = path.join(configDir, `runtime-env.${profileId}.json`);
    assert.ok(existsSync(filePath), `missing runtime env config: ${profileId}`);
    const env = JSON.parse(readFileSync(filePath, "utf8"));
    assert.equal(env.profileId, profileId);
    assert.match(
      env.appstoreAppApiBaseUrl ?? "",
      /\/app\/v3\/api$/u,
      `${profileId} app-api base URL must keep the /app/v3/api suffix`,
    );
  }
});
