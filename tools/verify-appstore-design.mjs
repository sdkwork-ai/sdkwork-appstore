import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function requireFile(relativePath) {
  const fullPath = join(root, relativePath);
  if (!existsSync(fullPath)) {
    errors.push(`Missing required file: ${relativePath}`);
    return null;
  }
  return fullPath;
}

function readRequired(relativePath) {
  const fullPath = requireFile(relativePath);
  return fullPath ? readFileSync(fullPath, "utf8") : "";
}

function readJson(relativePath) {
  const content = readRequired(relativePath);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    errors.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function extractRegistryTables(registry) {
  return [...registry.matchAll(/^\s*-\s+name:\s+(appstore_[A-Za-z0-9_]+)\s*$/gm)].map(
    (match) => match[1],
  );
}

function extractMigrationFiles(registry) {
  // Registry entries point at the consolidated initialization baseline and the
  // ordered post-GA migrations under database/migrations/postgres/ (both
  // relative to specs/database/); see DATABASE_FRAMEWORK_SPEC.md section 7.5
  // and tools/appstore-database-assets.mjs, the canonical inventory reader.
  return [...registry.matchAll(/^\s+file:\s+(\S+\.sql)\s*$/gm)].map(
    (match) => match[1],
  );
}

function extractOperationIds(openApi) {
  return [...openApi.matchAll(/^\s*operationId:\s+([A-Za-z0-9_.]+)\s*$/gm)].map(
    (match) => match[1],
  );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertContains(content, needle, message) {
  if (!content.includes(needle)) {
    errors.push(message);
  }
}

function assertNotContains(content, needle, message) {
  if (content.includes(needle)) {
    errors.push(message);
  }
}

function assertPathSegmentsAreLowerSnake({ name, path }) {
  for (const segment of path.split("/").filter(Boolean)) {
    if (segment.startsWith("{") && segment.endsWith("}")) {
      continue;
    }
    if (!/^[a-z0-9_]+$/.test(segment)) {
      errors.push(`${name} OpenAPI path segment ${segment} in ${path} must be lower_snake_case`);
    }
  }
}

function assertOpenApiSurface({ name, source, prefix, authority, sdkFamily }) {
  assertContains(source, "openapi: 3.1.2", `${name} OpenAPI must use OpenAPI 3.1.2`);
  assertContains(
    source,
    "  x-sdkwork-owner: sdkwork-appstore",
    `${name} OpenAPI missing sdkwork-appstore owner metadata`,
  );
  assertContains(
    source,
    `  x-sdkwork-api-authority: ${authority}`,
    `${name} OpenAPI missing ${authority} authority metadata`,
  );
  assertContains(
    source,
    `  x-sdkwork-sdk-family: ${sdkFamily}`,
    `${name} OpenAPI missing ${sdkFamily} SDK family metadata`,
  );
  assertContains(
    source,
    "  x-sdkwork-domain: appstore",
    `${name} OpenAPI must declare x-sdkwork-domain: appstore`,
  );

  for (const match of source.matchAll(/^  (\/[^:]+):/gm)) {
    const path = match[1];
    if (!path.startsWith(prefix)) {
      errors.push(`${name} OpenAPI path ${path} must start with ${prefix}`);
    }
    assertPathSegmentsAreLowerSnake({ name, path });
  }

  for (const operationId of extractOperationIds(source)) {
    if (!operationId.startsWith("appstore.")) {
      errors.push(`${name} OpenAPI operationId ${operationId} must start with appstore.`);
    }
  }
}

function toPosixPath(value) {
  return value.replaceAll("\\", "/");
}

const catalog = readRequired("docs/api/operation-catalog.md");
const serviceInterfaceMap = readRequired("docs/api/appstore-service-interface-map.md");
const tableCatalog = readRequired("docs/database/appstore-table-catalog.md");
const registry = readRequired("specs/database/schema-registry.yaml");
const migrationFiles = extractMigrationFiles(registry);
const migration = migrationFiles
  .map((file) => readRequired(`specs/database/${file}`))
  .join("\n\n");
const events = readRequired("apis/async/events/appstore-events.yaml");

const openApiSurfaces = [
  {
    name: "app-api",
    sourcePath: "apis/app-api/store/openapi.yaml",
    materializedPath:
      "sdks/sdkwork-appstore-app-sdk/openapi/sdkwork-appstore-app-api.openapi.yaml",
    generationInputSpec: "openapi/sdkwork-appstore-app-api.sdkgen.yaml",
    prefix: "/app/v3/api",
    authority: "sdkwork-appstore-app-api",
    sdkFamily: "sdkwork-appstore-app-sdk",
    manifestPath: "sdks/sdkwork-appstore-app-sdk/sdk-manifest.json",
  },
  {
    name: "backend-api",
    sourcePath: "apis/backend-api/store/openapi.yaml",
    materializedPath:
      "sdks/sdkwork-appstore-backend-sdk/openapi/sdkwork-appstore-backend-api.openapi.yaml",
    generationInputSpec: "openapi/sdkwork-appstore-backend-api.sdkgen.yaml",
    prefix: "/backend/v3/api",
    authority: "sdkwork-appstore-backend-api",
    sdkFamily: "sdkwork-appstore-backend-sdk",
    manifestPath: "sdks/sdkwork-appstore-backend-sdk/sdk-manifest.json",
  },
  {
    name: "open-api",
    sourcePath: "apis/open-api/store/openapi.yaml",
    materializedPath:
      "sdks/sdkwork-appstore-sdk/openapi/sdkwork-appstore-open-api.openapi.yaml",
    generationInputSpec: "openapi/sdkwork-appstore-open-api.sdkgen.yaml",
    prefix: "/store/v3/api",
    authority: "sdkwork-appstore-open-api",
    sdkFamily: "sdkwork-appstore-sdk",
    manifestPath: "sdks/sdkwork-appstore-sdk/sdk-manifest.json",
  },
].map((surface) => ({
  ...surface,
  source: readRequired(surface.sourcePath),
  materialized: readRequired(surface.materializedPath),
  manifest: readJson(surface.manifestPath),
}));

const serviceCrates = [
  "publisher",
  "listing",
  "release",
  "catalog",
  "library",
  "market",
  "moderation",
  "compliance",
].map((capability) => ({
  capability,
  path: `crates/sdkwork-appstore-${capability}-service`,
}));

const routeCrates = [
  ["appstore-catalog", "app-api"],
  ["listing", "app-api"],
  ["release", "app-api"],
  ["library", "app-api"],
  ["publisher", "app-api"],
  ["compliance", "app-api"],
  ["user-store", "app-api"],
  ["moderation", "backend-api"],
  ["appstore-catalog", "backend-api"],
  ["listing", "backend-api"],
  ["publisher", "backend-api"],
  ["market", "backend-api"],
  ["metrics", "backend-api"],
  ["release", "open-api"],
  ["appstore-catalog", "open-api"],
  ["listing", "open-api"],
  ["automation", "open-api"],
  ["user-store", "open-api"],
].map(([capability, surface]) => ({
  capability,
  surface,
  path: `crates/sdkwork-routes-${capability}-${surface}`,
}));

const backendCrates = [
  { name: "sdkwork-api-appstore-standalone-gateway", path: "crates/sdkwork-api-appstore-standalone-gateway" },
  { name: "sdkwork-appstore-service-host", path: "crates/sdkwork-appstore-service-host" },
  {
    name: "sdkwork-appstore-repository-sqlx",
    path: "crates/sdkwork-appstore-repository-sqlx",
  },
  {
    name: "sdkwork-appstore-analytics-worker",
    path: "crates/sdkwork-appstore-analytics-worker",
  },
  ...serviceCrates.map(({ capability, path }) => ({
    name: `sdkwork-appstore-${capability}-service`,
    path,
  })),
  ...routeCrates.map(({ capability, surface, path }) => ({
    name: `sdkwork-routes-${capability}-${surface}`,
    path,
  })),
];

const allOpenApi = openApiSurfaces.map((surface) => surface.source).join("\n");
const allContractText = [catalog, registry, migration, events, allOpenApi].join("\n");

function extractRouteOperationIds(routeSource) {
  return [...routeSource.matchAll(/^\s*operation_id:\s+"([A-Za-z0-9_.]+)"\s*,?\s*$/gm)].map(
    (match) => match[1],
  );
}

assertContains(registry, "domain: appstore", "Schema registry must declare domain: appstore");
assertContains(registry, "databasePrefix: appstore_", "Schema registry must use appstore_ prefix");
assertContains(
  registry,
  "file: ../../database/ddl/baseline/postgres/0001_appstore_baseline.sql",
  "Schema registry migration path must be the consolidated initialization baseline",
);
assertNotContains(
  registry,
  "0001_appstore_store_foundation.sql",
  "Schema registry must not reference deprecated appstore_store migration name",
);
assertNotContains(
  registry,
  "file: migrations/0001_appstore_foundation.sql",
  "Schema registry must not reference the deleted pre-consolidation foundation migration",
);

const registryTables = extractRegistryTables(registry);
const requiredTables = [
  "appstore_app",
  "appstore_app_dependency",
  "appstore_listing",
  "appstore_release",
  "appstore_market_channel",
  "appstore_market_release",
  "appstore_entitlement",
];

for (const table of requiredTables) {
  if (!registryTables.includes(table)) {
    errors.push(`Schema registry missing required table: ${table}`);
  }
}

for (const table of registryTables) {
  const tablePattern = new RegExp(
    `CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${escapeRegex(table)}\\s*\\(`,
    "i",
  );
  if (!tablePattern.test(migration)) {
    errors.push(`Migration missing table from schema registry: ${table}`);
  }
}

assertNotContains(migration, "ecosystem_", "Migration still contains deprecated ecosystem_ table prefix");
assertNotContains(migration, "ecosystem.", "Migration still contains deprecated ecosystem. prefix");

const catalogOperationIds = [
  ...new Set([...catalog.matchAll(/^\| `(appstore\.[^`]+)` \|/gm)].map((match) => match[1])),
];
const openApiOperationIds = new Set();

for (const surface of openApiSurfaces) {
  assertOpenApiSurface(surface);
  for (const operationId of extractOperationIds(surface.source)) {
    openApiOperationIds.add(operationId);
  }

  if (surface.materialized && surface.source !== surface.materialized) {
    errors.push(`${surface.materializedPath} is stale; run pnpm run api:materialize:models`);
  }

  if (surface.manifest) {
    const manifestDir = dirname(join(root, surface.manifestPath));
    const resolvedGenerationInput = resolve(manifestDir, surface.manifest.generationInputSpec ?? "");

    if (surface.manifest.sdkOwner !== "sdkwork-appstore") {
      errors.push(`${surface.manifestPath} sdkOwner must be sdkwork-appstore`);
    }
    if (surface.manifest.apiAuthority !== surface.authority) {
      errors.push(`${surface.manifestPath} apiAuthority must be ${surface.authority}`);
    }
    if (surface.manifest.sdkFamily !== surface.sdkFamily) {
      errors.push(`${surface.manifestPath} sdkFamily must be ${surface.sdkFamily}`);
    }
    if (surface.manifest.generationInputSpec !== surface.generationInputSpec) {
      errors.push(
        `${surface.manifestPath} generationInputSpec must be ${surface.generationInputSpec}`,
      );
    }
    const expectedGenerationInput = join(root, surface.manifestPath, "..", surface.generationInputSpec);
    if (resolvedGenerationInput !== expectedGenerationInput) {
      errors.push(
        `${surface.manifestPath} generationInputSpec resolves to ${toPosixPath(
          relative(root, resolvedGenerationInput),
        )}, expected ${surface.generationInputSpec}`,
      );
    }
    if (surface.manifest.apiPrefix !== surface.prefix) {
      errors.push(`${surface.manifestPath} apiPrefix must be ${surface.prefix}`);
    }
  }
}

for (const operationId of catalogOperationIds) {
  if (!openApiOperationIds.has(operationId)) {
    errors.push(`operationId missing from OpenAPI: ${operationId}`);
  }
}

for (const operationId of openApiOperationIds) {
  if (!catalogOperationIds.includes(operationId)) {
    errors.push(`operationId missing from operation catalog: ${operationId}`);
  }
}

assertContains(events, "domain: appstore", "Event catalog must declare domain: appstore");
assertContains(events, "eventPrefix: appstore.store", "Event catalog must use appstore.store prefix");
for (const eventType of [...events.matchAll(/^\s+-\s+type:\s+([A-Za-z0-9_.]+)\s*$/gm)].map(
  (match) => match[1],
)) {
  if (!eventType.startsWith("appstore.store.")) {
    errors.push(`Event type ${eventType} must start with appstore.store.`);
  }
}

assertNotContains(
  allContractText,
  "ecosystem_",
  "Contracts still contain deprecated ecosystem_ table prefix",
);
assertNotContains(
  allContractText,
  "ecosystem.",
  "Contracts still contain deprecated ecosystem. operation or event prefix",
);
assertNotContains(
  allContractText,
  "0001_appstore_store_foundation.sql",
  "Contracts still contain deprecated appstore_store migration name",
);

assertNotContains(allOpenApi, "/app/v3/api/auth/", "App API must not define auth login routes");
assertNotContains(
  allOpenApi,
  "/backend/v3/api/auth/",
  "Backend API must not define auth login routes",
);

const rootCargoToml = readRequired("Cargo.toml");
const implementationTodo = readRequired("crates/IMPLEMENTATION_TODO.md");
const integrationDocs = readRequired("docs/integration/appstore-integration-capabilities.md");
const serviceHostLib = readRequired("crates/sdkwork-appstore-service-host/src/lib.rs");
const apiServerBootstrap = readRequired("crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/mod.rs");
const apiServerPreflight = readRequired("crates/sdkwork-api-appstore-standalone-gateway/src/preflight/mod.rs");

const integrationCapabilities = [
  "appbase",
  "platform",
  "drive",
  "comments",
  "commerce",
  "notifications",
  "search",
  "market_channels",
];

const serviceHostIntegrationFiles = [
  "crates/sdkwork-appstore-service-host/src/integrations/mod.rs",
  "crates/sdkwork-appstore-service-host/src/integrations/registry.rs",
  ...integrationCapabilities.map(
    (capability) => `crates/sdkwork-appstore-service-host/src/integrations/${capability}.rs`,
  ),
];

const apiServerIntegrationFiles = [
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/adapters.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/preflight/dependency_surfaces.rs",
];

for (const crate of backendCrates) {
  requireFile(`${crate.path}/Cargo.toml`);
  requireFile(`${crate.path}/README.md`);
  requireFile(`${crate.path}/src/lib.rs`);
  assertContains(
    rootCargoToml,
    `"${crate.path}"`,
    `Cargo workspace missing member ${crate.path}`,
  );
}

for (const { capability, path } of serviceCrates) {
  for (const file of [
    "src/context.rs",
    "src/error.rs",
    "src/domain/mod.rs",
    "src/domain/models.rs",
    "src/domain/commands.rs",
    "src/domain/results.rs",
    "src/domain/events.rs",
    "src/ports/mod.rs",
    "src/ports/repository.rs",
    "src/ports/provider.rs",
    "src/ports/events.rs",
    "src/service/mod.rs",
    `src/service/${capability}_service.rs`,
  ]) {
    requireFile(`${path}/${file}`);
  }
}

const routeOperationIds = new Set();
for (const { path } of routeCrates) {
  for (const file of [
    "src/paths.rs",
    "src/routes.rs",
    "src/handlers.rs",
    "src/manifest.rs",
    "src/error.rs",
    "src/mapper/mod.rs",
    "src/mapper/request.rs",
    "src/mapper/response.rs",
    "src/mapper/problem.rs",
  ]) {
    requireFile(`${path}/${file}`);
  }

  const routeSource = readRequired(`${path}/src/routes.rs`);
  for (const operationId of extractRouteOperationIds(routeSource)) {
    routeOperationIds.add(operationId);
  }
}

for (const file of [
  "crates/sdkwork-api-appstore-standalone-gateway/src/main.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/mod.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/config.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/adapters.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/state.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/bootstrap/routers.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/server/mod.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/preflight/mod.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/preflight/dependency_surfaces.rs",
  "crates/sdkwork-api-appstore-standalone-gateway/src/health.rs",
  "crates/sdkwork-appstore-service-host/src/bootstrap/mod.rs",
  "crates/sdkwork-appstore-service-host/src/bootstrap/config.rs",
  "crates/sdkwork-appstore-service-host/src/bootstrap/repositories.rs",
  "crates/sdkwork-appstore-service-host/src/bootstrap/services.rs",
  "crates/sdkwork-appstore-service-host/src/host/mod.rs",
  "crates/sdkwork-appstore-service-host/src/host/service_container.rs",
  "crates/sdkwork-appstore-service-host/src/preflight/mod.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/db/mod.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/db/schema.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/db/rows.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/mapper/mod.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/repository/mod.rs",
  "crates/sdkwork-appstore-repository-sqlx/src/repository/queries.rs",
  "crates/sdkwork-appstore-analytics-worker/src/main.rs",
  "crates/sdkwork-appstore-analytics-worker/src/jobs/mod.rs",
  "crates/sdkwork-appstore-analytics-worker/src/scheduler/mod.rs",
  "crates/sdkwork-appstore-analytics-worker/src/bootstrap/mod.rs",
]) {
  requireFile(file);
}

for (const file of serviceHostIntegrationFiles) {
  requireFile(file);
}

for (const file of apiServerIntegrationFiles) {
  requireFile(file);
}

assertContains(
  serviceHostLib,
  "pub mod integrations;",
  "sdkwork-appstore-service-host must export integrations module",
);
assertContains(
  apiServerBootstrap,
  "pub mod adapters;",
  "sdkwork-api-appstore-standalone-gateway bootstrap must export adapters module",
);
assertContains(
  apiServerPreflight,
  "pub mod dependency_surfaces;",
  "sdkwork-api-appstore-standalone-gateway preflight must export dependency_surfaces module",
);

for (const capability of integrationCapabilities) {
  assertContains(
    integrationDocs,
    capability,
    `Integration capabilities doc must describe ${capability}`,
  );
  assertContains(
    implementationTodo,
    capability,
    `crates/IMPLEMENTATION_TODO.md must include ${capability} integration handoff item`,
  );
}

for (const table of registryTables) {
  assertContains(
    tableCatalog,
    `## ${table}`,
    `docs/database/appstore-table-catalog.md must describe ${table}`,
  );
}

for (const operationId of catalogOperationIds) {
  assertContains(
    serviceInterfaceMap,
    operationId,
    `docs/api/appstore-service-interface-map.md must describe ${operationId}`,
  );
  if (!routeOperationIds.has(operationId)) {
    errors.push(`Route definitions missing operationId: ${operationId}`);
  }
}

for (const operationId of routeOperationIds) {
  if (!catalogOperationIds.includes(operationId)) {
    errors.push(`Route definitions contain unexpected operationId: ${operationId}`);
  }
}

assertContains(
  implementationTodo,
  "## API Operations",
  "crates/IMPLEMENTATION_TODO.md must track API operation implementation status",
);

if (serviceInterfaceMap.includes("TODO(appstore-implementation)")) {
  errors.push(
    "docs/api/appstore-service-interface-map.md still contains TODO(appstore-implementation) entries",
  );
}

if (errors.length > 0) {
  console.error("App Store design verification failed:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log("App Store design verification passed.");
console.log(`- operationIds cataloged: ${catalogOperationIds.length}`);
console.log(`- database tables verified: ${registryTables.length}`);
console.log(`- API surfaces verified: ${openApiSurfaces.length}`);
console.log("- SDK manifests and materialized OpenAPI verified");
console.log(`- backend crates planned: ${backendCrates.length}`);
