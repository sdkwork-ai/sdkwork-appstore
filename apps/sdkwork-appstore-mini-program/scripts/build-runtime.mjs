#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const deploymentProfile = readArg("--deployment-profile", "standalone");
const environment = readArg("--environment", "development");
const profileId = `${deploymentProfile}.${environment}`;

const source = path.join(
  root,
  "config/mini-program",
  `runtime-env.${profileId}.json`,
);
if (!fs.existsSync(source)) {
  throw new Error(`missing runtime env config: ${profileId}`);
}
const env = JSON.parse(fs.readFileSync(source, "utf8"));

fs.mkdirSync(path.join(root, "src/runtime"), { recursive: true });

const define = {
  __SDKWORK_RUNTIME_ENV__: JSON.stringify({
    SDKWORK_PROFILE_ID: env.profileId,
    SDKWORK_APPSTORE_APP_API_BASE_URL: env.appstoreAppApiBaseUrl,
  }),
};

await build({
  entryPoints: [path.join(root, "src/bootstrap/runtime.ts")],
  outfile: path.join(root, "src/runtime/appstore-app.js"),
  bundle: true,
  format: "cjs",
  platform: "neutral",
  target: "es2021",
  define,
});

fs.writeFileSync(
  path.join(root, "src/runtime/runtime-env.js"),
  `module.exports = ${JSON.stringify(
    {
      SDKWORK_PROFILE_ID: env.profileId,
      SDKWORK_APPSTORE_APP_API_BASE_URL: env.appstoreAppApiBaseUrl,
    },
    null,
    2,
  )};\n`,
);

fs.writeFileSync(
  path.join(root, "src/runtime/build-manifest.json"),
  `${JSON.stringify(
    { profileId, deploymentProfile, environment, runtimeTarget: "mini-program-weixin" },
    null,
    2,
  )}\n`,
);

console.log(`mini program runtime built for ${profileId}`);
