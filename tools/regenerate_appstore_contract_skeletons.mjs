import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function toPosixPath(value) {
  return value.replaceAll("\\", "/");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function snakeCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[.\-\s/]+/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function methodNameFor(operationId) {
  return snakeCase(operationId.replace(/^appstore\./, ""));
}

function routeSurfaceForPath(path) {
  if (path.startsWith("/app/v3/api")) {
    return "app-api";
  }
  if (path.startsWith("/backend/v3/api")) {
    return "backend-api";
  }
  return "open-api";
}

function routeKeyFor(operation) {
  const surface = routeSurfaceForPath(operation.path);
  const operationId = operation.operationId;

  if (surface === "app-api") {
    if (operationId.startsWith("appstore.catalog.")) return { capability: "catalog", surface };
    if (operationId.startsWith("appstore.compliance.")) return { capability: "compliance", surface };
    if (
      operationId.startsWith("appstore.library.") ||
      operationId.startsWith("appstore.wishlist.") ||
      operationId.startsWith("appstore.downloadGrants.")
    ) {
      return { capability: "library", surface };
    }
    if (operationId.startsWith("appstore.publishers.")) return { capability: "publisher", surface };
    if (
      operationId.startsWith("appstore.releases.") ||
      operationId.startsWith("appstore.artifacts.")
    ) {
      return { capability: "release", surface };
    }
    if (operationId.startsWith("appstore.listings.")) return { capability: "listing", surface };
  }

  if (surface === "backend-api") {
    if (operationId.startsWith("appstore.moderation.")) return { capability: "moderation", surface };
    if (
      operationId.startsWith("appstore.marketChannels.") ||
      operationId.startsWith("appstore.marketReleases.")
    ) {
      return { capability: "market", surface };
    }
    if (operationId.startsWith("appstore.metrics.")) return { capability: "metrics", surface };
    if (operationId.startsWith("appstore.catalog.")) return { capability: "catalog", surface };
    if (operationId.startsWith("appstore.listings.")) return { capability: "listing", surface };
    if (operationId.startsWith("appstore.publishers.")) return { capability: "publisher", surface };
  }

  if (surface === "open-api") {
    if (operationId.startsWith("appstore.publish.automation.")) {
      return { capability: "automation", surface };
    }
    if (
      operationId.startsWith("appstore.releases.") ||
      operationId.startsWith("appstore.artifacts.")
    ) {
      return { capability: "release", surface };
    }
    if (operationId.startsWith("appstore.catalog.")) return { capability: "catalog", surface };
    if (operationId.startsWith("appstore.listings.")) return { capability: "listing", surface };
  }

  const relativePath = operation.path.replace(/^\/(?:app|backend|store)\/v3\/api\/?/, "");
  const head = relativePath.split("/")[0];

  if (surface === "app-api") {
    if (head === "catalog") return { capability: "catalog", surface };
    if (head === "listings") return { capability: "listing", surface };
    if (head === "releases") return { capability: "release", surface };
    if (head === "library" || head === "wishlist" || head === "download_grants") {
      return { capability: "library", surface };
    }
    if (head === "publishers") return { capability: "publisher", surface };
    if (head === "compliance") return { capability: "compliance", surface };
  }

  if (surface === "backend-api") {
    if (head === "moderation") return { capability: "moderation", surface };
    if (head === "catalog") return { capability: "catalog", surface };
    if (head === "listings") return { capability: "listing", surface };
    if (head === "publishers") return { capability: "publisher", surface };
    if (head === "metrics") return { capability: "metrics", surface };
  }

  if (surface === "open-api") {
    if (head === "releases" || head === "artifacts") return { capability: "release", surface };
    if (head === "catalog") return { capability: "catalog", surface };
    if (head === "listings") return { capability: "listing", surface };
    if (head === "automation") return { capability: "automation", surface };
  }

  throw new Error(`Unsupported route mapping for ${operation.operationId} (${operation.path})`);
}

function serviceCapabilityFor(operation) {
  const routeKey = routeKeyFor(operation);
  if (routeKey.capability === "metrics") {
    return "catalog";
  }
  if (routeKey.capability === "automation") {
    return "release";
  }
  return routeKey.capability;
}

function pascalCase(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

async function write(relativePath, content) {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content.replace(/\n/g, "\r\n"));
}

function readLines(content) {
  return content.split(/\r?\n/);
}

function parseOperationCatalog(content) {
  const operations = [];
  for (const line of readLines(content)) {
    const match = line.match(/^\| `(?<operationId>appstore\.[^`]+)` \| (?<method>[A-Z]+) \| `(?<path>[^`]+)` \|/);
    if (match?.groups) {
      operations.push({
        operationId: match.groups.operationId,
        method: match.groups.method,
        path: match.groups.path,
      });
    }
  }
  return operations;
}

function extractRegistryTables(registry) {
  const tables = [];
  for (const line of readLines(registry)) {
    const match = line.match(/^\s*-\s+name:\s+(appstore_[A-Za-z0-9_]+)\s*$/);
    if (match) {
      tables.push(match[1]);
    }
  }
  return tables;
}

function parseRegistryEntries(registry) {
  const entries = [];
  let current = null;
  for (const line of readLines(registry)) {
    const nameMatch = line.match(/^\s*-\s+name:\s+(appstore_[A-Za-z0-9_]+)\s*$/);
    if (nameMatch) {
      current = {
        name: nameMatch[1],
        profile: "",
        complianceLevel: "",
      };
      entries.push(current);
      continue;
    }
    if (!current) {
      continue;
    }
    const profileMatch = line.match(/^\s*profile:\s+([A-Za-z0-9_]+)\s*$/);
    if (profileMatch) {
      current.profile = profileMatch[1];
      continue;
    }
    const complianceMatch = line.match(/^\s*complianceLevel:\s+([A-Za-z0-9_]+)\s*$/);
    if (complianceMatch) {
      current.complianceLevel = complianceMatch[1];
    }
  }
  return entries;
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

function serviceMethodNameFor(operation) {
  return methodNameFor(operation.operationId);
}

function routeHandlerNameFor(operation) {
  return methodNameFor(operation.operationId);
}

function routeCrateNameFor(operation) {
  const routeKey = routeKeyFor(operation);
  const capability = routeKey.capability === "catalog" ? "appstore-catalog" : routeKey.capability;
  return `sdkwork-routes-${capability}-${routeKey.surface}`;
}

function serviceCrateNameFor(operation) {
  return `sdkwork-appstore-${serviceCapabilityFor(operation)}-service`;
}

function serviceDisplayName(capability) {
  return `${pascalCase(capability)}Service`;
}

function renderCrateReadme(crateName, responsibility, todos) {
  return `# ${crateName}

${responsibility}

## Boundary

- Owns only this crate's SDKWork responsibility.
- Must preserve authored OpenAPI, database registry, and SDK family boundaries.
- Must not call raw HTTP, parse credential headers manually, or bypass generated/dependency SDKs.

## Handoff TODO

${todos.map((item) => `- TODO(appstore-implementation): ${item}`).join("\n")}
`;
}

function renderCargoToml(packageName, withBin = false) {
  return `[package]
name = "${packageName}"
version = "0.1.0"
edition = "2021"

[lib]
path = "src/lib.rs"
${withBin ? `
[[bin]]
name = "${packageName}"
path = "src/main.rs"
` : ""}
`;
}

function renderOperationRequestTypes(capability) {
  const typePrefix = pascalCase(capability);
  return `//! ${typePrefix} operation contracts.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}OperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
    pub todo: &'static str,
}

impl ${typePrefix}OperationRequest {
    pub fn new(operation_id: &'static str, todo: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
            todo,
        }
    }
}
`;
}

function renderOperationResultTypes(capability) {
  const typePrefix = pascalCase(capability);
  return `//! ${typePrefix} operation results.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}OperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
    pub todo: &'static str,
}

impl ${typePrefix}OperationResult {
    pub fn planned(operation_id: &'static str, todo: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
            todo,
        }
    }
}
`;
}

function renderOperationHandlerPlans(operationList, crateName) {
  const entries = operationList
    .map(
      (operation) => `    RouteHandlerPlan {
        operation_id: "${operation.operationId}",
        handler_name: "${routeHandlerNameFor(operation)}",
        service_method: "${serviceMethodNameFor(operation)}",
        todo: "TODO(appstore-implementation): wire ${operation.operationId} through ${crateName}",
    },`,
    )
    .join("\n");

  return `//! HTTP handler boundary for ${crateName}.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteHandlerPlan {
    pub operation_id: &'static str,
    pub handler_name: &'static str,
    pub service_method: &'static str,
    pub todo: &'static str,
}

pub const ROUTE_HANDLER_PLANS: &[RouteHandlerPlan] = &[
${entries}
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}
${operationList
  .map((operation) => {
    const handlerName = routeHandlerNameFor(operation);
    return `
pub fn ${handlerName}() -> &'static str {
    "TODO(appstore-implementation): decode request, call ${serviceMethodNameFor(operation)}, and map ${operation.operationId} response"
}`;
  })
  .join("\n")}
`;
}

function renderRouteDefinitions(operationList, crateName) {
  const entries = operationList
    .map(
      (operation) => `    RouteDefinition {
        method: "${operation.method}",
        path: "${operation.path}",
        operation_id: "${operation.operationId}",
        handler: "${routeHandlerNameFor(operation)}",
        service_method: "${serviceMethodNameFor(operation)}",
    },`,
    )
    .join("\n");

  return `//! Route registration descriptors for ${crateName}.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteDefinition {
    pub method: &'static str,
    pub path: &'static str,
    pub operation_id: &'static str,
    pub handler: &'static str,
    pub service_method: &'static str,
}

pub const ROUTES: &[RouteDefinition] = &[
${entries}
];

pub fn route_definitions() -> &'static [RouteDefinition] {
    ROUTES
}
`;
}

function renderRouteManifest(crateName, capability, surface) {
  const prefix = surface === "app-api" ? "/app/v3/api" : surface === "backend-api" ? "/backend/v3/api" : "/store/v3/api";
  const authority = surface === "app-api" ? "sdkwork-appstore-app-api" : surface === "backend-api" ? "sdkwork-appstore-backend-api" : "sdkwork-appstore-open-api";
  const sdkFamily = surface === "app-api" ? "sdkwork-appstore-app-sdk" : surface === "backend-api" ? "sdkwork-appstore-backend-sdk" : "sdkwork-appstore-sdk";
  return `//! Route manifest projection for ${crateName}.

use crate::paths::{API_AUTHORITY, CAPABILITY, PREFIX, SDK_FAMILY, SURFACE};
use crate::routes::{route_definitions, RouteDefinition};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteManifest {
    pub kind: &'static str,
    pub package_name: &'static str,
    pub owner: &'static str,
    pub domain: &'static str,
    pub capability: &'static str,
    pub surface: &'static str,
    pub prefix: &'static str,
    pub api_authority: &'static str,
    pub sdk_family: &'static str,
    pub routes: &'static [RouteDefinition],
}

pub fn route_manifest() -> RouteManifest {
    RouteManifest {
        kind: "sdkwork.route.manifest",
        package_name: "${crateName}",
        owner: "sdkwork-appstore",
        domain: "appstore",
        capability: CAPABILITY,
        surface: SURFACE,
        prefix: PREFIX,
        api_authority: API_AUTHORITY,
        sdk_family: SDK_FAMILY,
        routes: route_definitions(),
    }
}
`;
}

function renderRouteLib(crateName, capability, surface) {
  return `//! Route crate skeleton for ${crateName}.

pub mod error;
pub mod handlers;
pub mod manifest;
pub mod mapper;
pub mod paths;
pub mod routes;

pub use handlers::{route_handler_plans, RouteHandlerPlan};
pub use manifest::{route_manifest, RouteManifest};
pub use routes::{route_definitions, RouteDefinition};
`;
}

function renderRoutePaths(capability, surface) {
  const prefix = capability === "catalog" && surface === "app-api"
    ? "/app/v3/api/appstore/catalog"
    : capability === "catalog" && surface === "backend-api"
      ? "/backend/v3/api/appstore/catalog"
      : surface === "app-api"
        ? "/app/v3/api"
        : surface === "backend-api"
          ? "/backend/v3/api"
          : "/store/v3/api";
  const authority = surface === "app-api" ? "sdkwork-appstore-app-api" : surface === "backend-api" ? "sdkwork-appstore-backend-api" : "sdkwork-appstore-open-api";
  const sdkFamily = surface === "app-api" ? "sdkwork-appstore-app-sdk" : surface === "backend-api" ? "sdkwork-appstore-backend-sdk" : "sdkwork-appstore-sdk";
  return `//! Canonical path constants for ${capability} ${surface}.

pub const CAPABILITY: &str = "${capability}";
pub const SURFACE: &str = "${surface}";
pub const PREFIX: &str = "${prefix}";
pub const API_AUTHORITY: &str = "${authority}";
pub const SDK_FAMILY: &str = "${sdkFamily}";
`;
}

function renderRouteError(crateName, capability, surface) {
  const typePrefix = pascalCase(`${capability}_${surface}`);
  return `//! Problem-detail mapping placeholder for ${crateName}.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}RouteError {
    pub message: &'static str,
}
`;
}

function renderMapperModule() {
  return `//! Request/response/problem mappers.

pub mod problem;
pub mod request;
pub mod response;
`;
}

function renderMapperFile(kind) {
  const todo = {
    request: "TODO(appstore-implementation): map OpenAPI request DTOs to service commands",
    response: "TODO(appstore-implementation): map service results to OpenAPI response DTOs",
    problem: "TODO(appstore-implementation): map service errors to SDKWork problem details",
  }[kind];

  return `//! ${kind === "problem" ? "Problem-detail" : kind.charAt(0).toUpperCase() + kind.slice(1)} mapper placeholder.

pub fn ${kind}_mapper_todo() -> &'static str {
    "${todo}"
}
`;
}

function renderServiceLib(capability) {
  const typePrefix = pascalCase(capability);
  return `//! App Store ${capability} service boundary.

pub mod context;
pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use context::AppstoreRequestContext;
pub use domain::commands::${typePrefix}OperationRequest;
pub use domain::results::${typePrefix}OperationResult;
pub use error::{AppstoreServiceError, AppstoreServiceResult};
pub use service::${capability}_service::{${typePrefix}Operations, ${typePrefix}Service};

pub const CAPABILITY: &str = "${capability}";

pub fn capability_name() -> &'static str {
    CAPABILITY
}
`;
}

function renderServiceContext(capability) {
  return `//! Typed request context accepted by the ${capability} service.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppstoreRequestContext {
    pub tenant_id: String,
    pub organization_id: Option<String>,
    pub user_id: Option<String>,
    pub request_id: String,
}

impl AppstoreRequestContext {
    pub fn tenant_scoped(tenant_id: impl Into<String>, request_id: impl Into<String>) -> Self {
        Self {
            tenant_id: tenant_id.into(),
            organization_id: None,
            user_id: None,
            request_id: request_id.into(),
        }
    }
}
`;
}

function renderServiceError() {
  return `//! Service errors.

use std::fmt::{Display, Formatter};

pub type AppstoreServiceResult<T> = Result<T, AppstoreServiceError>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AppstoreServiceError {
    NotImplemented(&'static str),
}

impl Display for AppstoreServiceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotImplemented(message) => formatter.write_str(message),
        }
    }
}

impl std::error::Error for AppstoreServiceError {}
`;
}

function renderServiceDomainMod(capability) {
  return `//! ${pascalCase(capability)} domain model boundary.

pub mod commands;
pub mod events;
pub mod models;
pub mod results;
`;
}

function renderServiceDomainModels(capability) {
  const typePrefix = pascalCase(capability);
  return `//! ${typePrefix} domain placeholders.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}Id(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}Record {
    pub id: ${typePrefix}Id,
    pub tenant_id: String,
    pub status: String,
}
`;
}

function renderServiceDomainEvents(capability) {
  const typePrefix = pascalCase(capability);
  return `//! ${typePrefix} domain event placeholders.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}DomainEvent {
    pub event_type: &'static str,
}
`;
}

function renderServiceDomainCommands(capability, operations) {
  const typePrefix = pascalCase(capability);
  const extra = operations
    .map((operation) => `    // TODO(appstore-implementation): implement ${operation.operationId}
    pub fn ${methodNameFor(operation.operationId)}(idempotency_key: Option<String>) -> Self {
        Self {
            operation_id: "${operation.operationId}",
            idempotency_key,
            todo: "TODO(appstore-implementation): implement ${operation.operationId}",
        }
    }`)
    .join("\n\n");

  return `//! ${typePrefix} operation requests.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}OperationRequest {
    pub operation_id: &'static str,
    pub idempotency_key: Option<String>,
    pub todo: &'static str,
}

impl ${typePrefix}OperationRequest {
    pub fn new(operation_id: &'static str, todo: &'static str) -> Self {
        Self {
            operation_id,
            idempotency_key: None,
            todo,
        }
    }

${extra}
}
`;
}

function renderServiceDomainResults(capability) {
  const typePrefix = pascalCase(capability);
  return `//! ${typePrefix} operation results.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ${typePrefix}OperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
    pub todo: &'static str,
}

impl ${typePrefix}OperationResult {
    pub fn planned(operation_id: &'static str, todo: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
            todo,
        }
    }
}
`;
}

function renderServicePortsMod() {
  return `//! Service ports.

pub mod events;
pub mod provider;
pub mod repository;
`;
}

function renderServicePortsRepository(capability) {
  const typePrefix = pascalCase(capability);
  return `//! Repository port for ${capability} use cases.

pub trait ${typePrefix}Repository {
    fn port_name(&self) -> &'static str {
        "TODO(appstore-implementation): implement ${capability} repository port"
    }
}
`;
}

function renderServicePortsProvider(capability) {
  const typePrefix = pascalCase(capability);
  return `//! Dependency provider ports for ${capability} use cases.

pub trait ${typePrefix}ProviderPort {
    fn port_name(&self) -> &'static str {
        "TODO(appstore-implementation): inject SDKWork dependency SDK/provider adapters"
    }
}
`;
}

function renderServicePortsEvents(capability) {
  const typePrefix = pascalCase(capability);
  return `//! Event publication port for ${capability} use cases.

pub trait ${typePrefix}EventPublisher {
    fn port_name(&self) -> &'static str {
        "TODO(appstore-implementation): publish appstore.store.* events through outbox"
    }
}
`;
}

function renderServiceModule(capability) {
  return `//! ${pascalCase(capability)} service modules.

pub mod ${capability}_service;
`;
}

function renderServiceImpl(capability, operations) {
  const typePrefix = pascalCase(capability);
  const traitName = `${typePrefix}Operations`;
  const methodDefinitions = operations
    .map((operation) => {
      const methodName = methodNameFor(operation.operationId);
      return `    fn ${methodName}(
        &self,
        context: &AppstoreRequestContext,
        request: ${typePrefix}OperationRequest,
    ) -> AppstoreServiceResult<${typePrefix}OperationResult>;`;
    })
    .join("\n\n");

  const methodBodies = operations
    .map((operation) => {
      const methodName = methodNameFor(operation.operationId);
      return `    fn ${methodName}(
        &self,
        context: &AppstoreRequestContext,
        request: ${typePrefix}OperationRequest,
    ) -> AppstoreServiceResult<${typePrefix}OperationResult> {
        let _ = (context, request);
        // TODO(appstore-implementation): implement ${operation.operationId}
        Err(AppstoreServiceError::NotImplemented(
            "TODO(appstore-implementation): implement ${operation.operationId}",
        ))
    }`;
    })
    .join("\n\n");

  return `//! ${typePrefix} service entrypoint.

use crate::context::AppstoreRequestContext;
use crate::domain::commands::${typePrefix}OperationRequest;
use crate::domain::results::${typePrefix}OperationResult;
use crate::error::{AppstoreServiceError, AppstoreServiceResult};

pub trait ${traitName} {
${methodDefinitions}
}

#[derive(Debug, Default, Clone)]
pub struct ${typePrefix}Service;

impl ${traitName} for ${typePrefix}Service {
${methodBodies}
}
`;
}

function renderServiceReadme(crateName, capability, operations) {
  const bulletList = operations
    .map((operation) => `- ${operation.operationId} -> ${methodNameFor(operation.operationId)}`)
    .join("\n");
  return renderCrateReadme(
    crateName,
    `Business service/use-case crate for App Store ${capability} workflows.`,
    [
      `implement ${capability} authorization and tenant/data-scope policy`,
      `translate OpenAPI commands into ${capability} domain methods`,
      `coordinate idempotency, repository transactions, and appstore.store.* events`,
      `keep each operation mapped from the operation catalog:`,
      bulletList,
    ],
  );
}

function renderRouteReadme(crateName, capability, surface) {
  return renderCrateReadme(
    crateName,
    `Rust HTTP route adapter skeleton for ${capability} ${surface} operations.`,
    [
      "replace route descriptors with the selected Rust HTTP framework router builder",
      "map requests and responses against authored OpenAPI schemas",
      "delegate all business decisions to service crates and typed request context",
    ],
  );
}

function renderServiceInterfaceMap(operationGroups) {
  const sections = [];
  const groupEntries = [...operationGroups.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [serviceKey, operations] of groupEntries) {
    const crateName = `sdkwork-appstore-${serviceKey}-service`;
    const rows = operations
      .map(
        (operation) => `| \`${operation.operationId}\` | \`${routeCrateNameFor(operation)}\` | \`${routeHandlerNameFor(operation)}\` | \`${crateName}\` | \`${serviceMethodNameFor(operation)}\` | TODO(appstore-implementation): implement ${operation.operationId} |`,
      )
      .join("\n");
    sections.push(`## ${crateName}\n\n| operationId | routeCrate | handler | serviceCrate | serviceMethod | TODO |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n`);
  }

  return `# App Store Service Interface Map

This document maps each route operation to its generated handler and service
method name. It is a handoff artifact for later implementation agents.

${sections.join("\n")}
`;
}

function renderTableCatalog(registryEntries, migration) {
  const sections = [];
  for (const entry of registryEntries) {
    const table = entry.name;
    const createMatch = migration.match(
      new RegExp(
        `CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${escapeRegex(table)}\\s*\\((?:.|\\n)*?\\n\\);`,
        "i",
      ),
    );
    const indexMatches = [...migration.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX[^;]+;/gim)]
      .map((match) => match[0].trim())
      .filter((statement) => new RegExp(`\\b${escapeRegex(table)}\\b`, "i").test(statement));
    sections.push(`## ${table}

- profile: ${entry.profile || "unknown"}
- complianceLevel: ${entry.complianceLevel || "unknown"}

### DDL

\`\`\`sql
${createMatch ? createMatch[0].trim() : `-- TODO(appstore-implementation): add DDL excerpt for ${table}`}
\`\`\`

### Indexes

${indexMatches.length > 0 ? indexMatches.map((statement) => `\`\`\`sql\n${statement}\n\`\`\``).join("\n\n") : "_TODO(appstore-implementation): document indexes for this table_"}
`);
  }

  return `# App Store Table Catalog

This document mirrors the schema registry and migration DDL so later agents can
see every table structure without opening the raw SQL first.

${sections.join("\n")}
`;
}

async function main() {
  const operationCatalog = await readFile(join(root, "docs/api/operation-catalog.md"), "utf8");
  const registry = await readFile(join(root, "specs/database/schema-registry.yaml"), "utf8");
  const migration = await readFile(join(root, "database/ddl/baseline/postgres/0001_appstore_baseline.sql"), "utf8");

  const operations = parseOperationCatalog(operationCatalog);
  const registryEntries = parseRegistryEntries(registry);
  const routeGroups = groupBy(operations, routeKeyFor);
  const serviceGroups = groupBy(operations, serviceCapabilityFor);

  await write("docs/database/appstore-table-catalog.md", renderTableCatalog(registryEntries, migration));
  await write("docs/api/appstore-service-interface-map.md", renderServiceInterfaceMap(serviceGroups));

  const routeCrates = [
    "catalog:app-api",
    "listing:app-api",
    "release:app-api",
    "library:app-api",
    "publisher:app-api",
    "compliance:app-api",
    "moderation:backend-api",
    "catalog:backend-api",
    "listing:backend-api",
      "publisher:backend-api",
    "market:backend-api",
    "metrics:backend-api",
    "release:open-api",
    "catalog:open-api",
    "listing:open-api",
    "automation:open-api",
  ];

  for (const routeKey of routeCrates) {
    const [capability, surface] = routeKey.split(":");
    const crateCapability = capability === "catalog" ? "appstore-catalog" : capability;
    const crateName = `sdkwork-routes-${crateCapability}-${surface}`;
    const operationsForCrate = operations.filter((operation) => {
      const key = routeKeyFor(operation);
      return key.capability === capability && key.surface === surface;
    });

    await write(
      `crates/${crateName}/src/lib.rs`,
      renderRouteLib(crateName, capability, surface),
    );
    await write(`crates/${crateName}/Cargo.toml`, renderCargoToml(crateName));
    await write(`crates/${crateName}/README.md`, renderRouteReadme(crateName, capability, surface));
    await write(`crates/${crateName}/src/paths.rs`, renderRoutePaths(capability, surface));
    await write(`crates/${crateName}/src/routes.rs`, renderRouteDefinitions(operationsForCrate, crateName));
    await write(`crates/${crateName}/src/handlers.rs`, renderOperationHandlerPlans(operationsForCrate, crateName));
    await write(`crates/${crateName}/src/manifest.rs`, renderRouteManifest(crateName, capability, surface));
    await write(`crates/${crateName}/src/error.rs`, renderRouteError(crateName, capability, surface));
    await write(`crates/${crateName}/src/mapper/mod.rs`, renderMapperModule());
    await write(`crates/${crateName}/src/mapper/request.rs`, renderMapperFile("request"));
    await write(`crates/${crateName}/src/mapper/response.rs`, renderMapperFile("response"));
    await write(`crates/${crateName}/src/mapper/problem.rs`, renderMapperFile("problem"));
  }

  const serviceCrates = [
    "publisher",
    "listing",
    "release",
    "catalog",
    "library",
    "moderation",
    "compliance",
    "market",
  ];
  for (const capability of serviceCrates) {
    const crateName = `sdkwork-appstore-${capability}-service`;
    const operationsForService = operations.filter((operation) => serviceCapabilityFor(operation) === capability);
    await write(`crates/${crateName}/Cargo.toml`, renderCargoToml(crateName));
    await write(`crates/${crateName}/src/lib.rs`, renderServiceLib(capability));
    await write(`crates/${crateName}/src/context.rs`, renderServiceContext(capability));
    await write(`crates/${crateName}/src/error.rs`, renderServiceError());
    await write(`crates/${crateName}/src/domain/mod.rs`, renderServiceDomainMod(capability));
    await write(`crates/${crateName}/src/domain/models.rs`, renderServiceDomainModels(capability));
    await write(`crates/${crateName}/src/domain/commands.rs`, renderServiceDomainCommands(capability, operationsForService));
    await write(`crates/${crateName}/src/domain/results.rs`, renderServiceDomainResults(capability));
    await write(`crates/${crateName}/src/domain/events.rs`, renderServiceDomainEvents(capability));
    await write(`crates/${crateName}/src/ports/mod.rs`, renderServicePortsMod());
    await write(`crates/${crateName}/src/ports/repository.rs`, renderServicePortsRepository(capability));
    await write(`crates/${crateName}/src/ports/provider.rs`, renderServicePortsProvider(capability));
    await write(`crates/${crateName}/src/ports/events.rs`, renderServicePortsEvents(capability));
    await write(`crates/${crateName}/src/service/mod.rs`, renderServiceModule(capability));
    await write(`crates/${crateName}/src/service/${capability}_service.rs`, renderServiceImpl(capability, operationsForService));
    await write(`crates/${crateName}/README.md`, renderServiceReadme(crateName, capability, operationsForService));
  }
}

await main();
