#!/usr/bin/env node
/**
 * SDKWork App Store standard command dispatcher.
 * Follows ../sdkwork-specs/PNPM_SCRIPT_SPEC.md.
 */

import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const ALLOWED_DATABASES = new Set(["postgres", "sqlite"]);
const ALLOWED_DEPLOYMENT_PROFILES = new Set(["standalone", "cloud"]);
const ALLOWED_RUNTIME_TARGETS = new Set([
  "browser",
  "desktop",
  "server",
  "container",
  "capacitor-ios",
  "capacitor-android",
  "mini-program",
  "test-runner",
]);

function parseArgs(argv) {
  const args = { command: null, flags: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args.flags[key] = value;
    } else if (!args.command) {
      args.command = arg;
    }
  }
  return args;
}

function run(command, cwd = repoRoot) {
  const result = spawnSync(command, { cwd, shell: true, stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runNode(scriptRelativePath, scriptArgs = []) {
  const scriptPath = resolve(repoRoot, scriptRelativePath);
  const result = spawnSync("node", [scriptPath, ...scriptArgs], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function dbCliArgs(command, database) {
  const subcommand = command.replace("db:", "");
  const args = ["--app-root", "."];
  if (database === "postgres") {
    args.push("--engine", "postgres");
  }
  return [
    "cargo",
    "run",
    "--manifest-path",
    "../sdkwork-database/Cargo.toml",
    "-p",
    "sdkwork-database-cli",
    "--",
    ...args,
    subcommand,
  ].join(" ");
}

function resolveAppFilter(runtimeTarget, renderer) {
  if (renderer === "mobile" || runtimeTarget === "capacitor-ios" || runtimeTarget === "capacitor-android") {
    return "sdkwork-appstore-h5";
  }
  return "sdkwork-appstore-pc";
}

function dispatch({ command, flags }) {
  if (!command) {
    console.error("[sdkwork-appstore] Usage: node scripts/sdkwork-command.mjs <command> [--flags]");
    process.exit(1);
  }

  const runtimeTarget = flags["runtime-target"] || "browser";
  const database = flags.database || "postgres";
  const deploymentProfile = flags["deployment-profile"] || "standalone";
  const renderer = flags.renderer || (runtimeTarget === "browser" ? "desktop" : "mobile");

  if (flags.database && !ALLOWED_DATABASES.has(flags.database)) {
    console.error(`[sdkwork-appstore] Invalid database: ${flags.database}`);
    process.exit(1);
  }
  if (flags["runtime-target"] && !ALLOWED_RUNTIME_TARGETS.has(runtimeTarget)) {
    console.error(`[sdkwork-appstore] Invalid runtime-target: ${runtimeTarget}`);
    process.exit(1);
  }
  if (flags["deployment-profile"] && !ALLOWED_DEPLOYMENT_PROFILES.has(deploymentProfile)) {
    console.error(`[sdkwork-appstore] Invalid deployment-profile: ${deploymentProfile}`);
    process.exit(1);
  }

  switch (command) {
    case "dev": {
      const filter = resolveAppFilter(runtimeTarget, renderer);
      run(`pnpm --filter ${filter} dev`);
      break;
    }
    case "build": {
      run("pnpm --filter sdkwork-appstore-pc build");
      run("pnpm --filter sdkwork-appstore-h5 build");
      break;
    }
    case "preview": {
      const filter = resolveAppFilter(runtimeTarget, renderer);
      run(`pnpm --filter ${filter} preview`);
      break;
    }
    case "test": {
      run("cargo test --workspace");
      if (existsSync(resolve(repoRoot, "apps/sdkwork-appstore-pc"))) {
        run("pnpm --filter sdkwork-appstore-pc test");
      }
      break;
    }
    case "check": {
      run("pnpm run check:app-composition");
      run("pnpm run check:api-envelope");
      run("pnpm run check:app-sdk-consumers");
      run("pnpm run check:pagination");
      run("pnpm run check:tailwind-integration");
      run("pnpm run db:validate");
      run("cargo fmt --all --check");
      run("cargo check --workspace");
      break;
    }
    case "verify": {
      runNode("tools/verify-appstore-design.mjs");
      run("pnpm run check");
      run("pnpm run verify:rust");
      break;
    }
    case "clean": {
      for (const dir of ["apps/sdkwork-appstore-pc/dist", "apps/sdkwork-appstore-h5/dist", "target"]) {
        const path = resolve(repoRoot, dir);
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      }
      run("cargo clean");
      break;
    }
    case "api:materialize":
      runNode("tools/appstore_openapi_materialize.mjs");
      break;
    case "api:materialize:check":
    case "api:check":
      runNode("tools/appstore_openapi_materialize.mjs", ["--check"]);
      break;
    case "sdk:generate":
      runNode("tools/appstore_sdk_generate.mjs", ["--generate"]);
      break;
    case "sdk:generate:check":
    case "sdk:check":
      runNode("tools/appstore_sdk_generate.mjs");
      break;
    case "db:plan":
    case "db:init":
    case "db:migrate":
    case "db:seed":
    case "db:status":
    case "db:bootstrap":
    case "db:drift":
    case "db:drift:check": {
      run(dbCliArgs(command, database));
      break;
    }
    case "db:postgres:plan":
      run(dbCliArgs("db:plan", "postgres"));
      break;
    case "db:postgres:init":
      run(dbCliArgs("db:init", "postgres"));
      break;
    case "db:postgres:migrate":
      run(dbCliArgs("db:migrate", "postgres"));
      break;
    case "db:validate":
      runNode("../sdkwork-specs/tools/check-database-framework-standard.mjs", ["--root", "."]);
      runNode("tests/contract/database-framework.contract.test.mjs");
      break;
    case "db:materialize:contract":
      runNode("../sdkwork-specs/tools/materialize-database-contract-from-baseline.mjs", [
        "--root",
        ".",
        "--baseline",
        "database/ddl/baseline/postgres/0001_appstore_baseline.sql",
        "--module-id",
        "appstore",
        "--owner",
        "appstore-platform",
        "--prefixes",
        "appstore_",
        "--engines",
        "postgres",
      ]);
      break;
    case "topology:validate":
      runNode("../sdkwork-app-topology/scripts/sdkwork-topology.mjs", [
        "validate",
        "--root",
        ".",
        "--spec",
        "specs/topology.spec.json",
      ]);
      break;
    case "topology:plan":
      runNode("../sdkwork-app-topology/scripts/sdkwork-topology.mjs", [
        "plan",
        "--root",
        ".",
        "--spec",
        "specs/topology.spec.json",
      ]);
      break;
    case "gateway:package:cloud":
      runNode("../sdkwork-app-topology/scripts/gateway-cloud-bundle.mjs", ["bundle", "--root", "."]);
      break;
    case "gateway:validate:cloud":
      runNode("../sdkwork-app-topology/scripts/gateway-cloud-bundle.mjs", ["validate", "--root", "."]);
      break;
    case "deploy:validate": {
      const deployPath = resolve(repoRoot, "deployments/deploy.yaml");
      if (!existsSync(deployPath)) {
        console.error("[sdkwork-appstore] Missing deployments/deploy.yaml");
        process.exit(1);
      }
      console.log("[sdkwork-appstore] deployments/deploy.yaml present");
      break;
    }
    default:
      console.error(`[sdkwork-appstore] Unknown command: ${command}`);
      process.exit(1);
  }
}

dispatch(parseArgs(process.argv.slice(2)));
