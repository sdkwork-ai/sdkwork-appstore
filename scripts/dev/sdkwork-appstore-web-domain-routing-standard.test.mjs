import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const readText = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const deployment = readJson('etc/sdkwork.deployment.config.json');
const topology = readJson('specs/topology.spec.json');
const deployManifest = readText('deployments/deploy.yaml');

// APP_RUNTIME_TOPOLOGY_NAMING.md section 9.2: appstore role host on
// sdkwork.com with the standard environment suffix formula.
const expectedOrigins = {
  development: 'http://appstore-dev.sdkwork.com:3900/',
  test: 'https://appstore-test.sdkwork.com/',
  staging: 'https://appstore-staging.sdkwork.com/',
  production: 'https://appstore.sdkwork.com/',
};
const expectedCloudApiBaseUrls = {
  development: 'https://api-dev.sdkwork.com/',
  test: 'https://api-test.sdkwork.com/',
  staging: 'https://api-staging.sdkwork.com/',
  production: 'https://api.sdkwork.com/',
};

for (const [environment, expectedOrigin] of Object.entries(expectedOrigins)) {
  const canonical = deployment.environments?.[environment];
  assert.ok(canonical, `deployment config must declare ${environment}`);
  assert.equal(canonical.applicationOrigin, expectedOrigin);
  assert.equal(canonical.cloudApiBaseUrl, expectedCloudApiBaseUrls[environment]);
  const parsed = new URL(expectedOrigin);
  assert.doesNotMatch(parsed.hostname, /^api(?:-|\.)/u);
}

const publicHost = topology.cloudPublicHosts?.['application.public-ingress'];
assert.ok(publicHost, 'topology must register application.public-ingress');
assert.equal(publicHost.httpHost, 'appstore.sdkwork.com');
assert.equal(publicHost.environments?.development?.httpHost, 'appstore-dev.sdkwork.com');
assert.equal(publicHost.environments?.test?.httpHost, 'appstore-test.sdkwork.com');
assert.equal(publicHost.environments?.staging?.httpHost, 'appstore-staging.sdkwork.com');
assert.equal(
  topology.cloudPublicHosts?.['platform.api-gateway']?.environments?.test?.httpHost,
  'api-test.sdkwork.com',
);

// All eight topology profile env files must exist under etc/topology.
const expectedProfileIds = [
  'standalone.development', 'standalone.test', 'standalone.staging', 'standalone.production',
  'cloud.development', 'cloud.test', 'cloud.staging', 'cloud.production',
];
for (const profileId of expectedProfileIds) {
  assert.ok(
    topology.profileFiles?.[profileId],
    `topology must declare profile ${profileId}`,
  );
}

for (const environment of ['development', 'test', 'staging', 'production']) {
  const profileSource = readText(`etc/topology/cloud.${environment}.env`);
  assert.match(profileSource, new RegExp(`SDKWORK_APPSTORE_ENVIRONMENT=${environment}`, 'u'));
  const appOrigin = expectedOrigins[environment].replace(/\/$/u, '');
  const apiOrigin = expectedCloudApiBaseUrls[environment].replace(/\/$/u, '');
  const appHostLine = profileSource.split('\n').find((l) => l.startsWith('SDKWORK_APPSTORE_APPLICATION_PUBLIC_HTTP_URL='));
  assert.ok(appHostLine, `cloud ${environment} must declare APPLICATION_PUBLIC_HTTP_URL`);
  assert.ok(appHostLine.includes(appOrigin), `cloud ${environment} application public must use ${appOrigin}: ${appHostLine}`);
  const gatewayLine = profileSource.split('\n').find((l) => l.startsWith('SDKWORK_APPSTORE_PLATFORM_API_GATEWAY_HTTP_URL='));
  assert.ok(gatewayLine, `cloud ${environment} must declare PLATFORM_API_GATEWAY_HTTP_URL`);
  assert.ok(gatewayLine.includes(apiOrigin), `cloud ${environment} gateway must use ${apiOrigin}: ${gatewayLine}`);
  // Cloud profiles must never fold to loopback.
  assert.doesNotMatch(profileSource, /127\.0\.0\.1/u, `cloud ${environment} must not use loopback URLs`);
}

// Standalone profiles fold SDK base URLs to loopback and must not reference
// cloud hostnames.
for (const environment of ['development', 'test', 'staging', 'production']) {
  const profileSource = readText(`etc/topology/standalone.${environment}.env`);
  assert.doesNotMatch(profileSource, /\.sdkwork\.com/u, `standalone ${environment} must not reference cloud hostnames`);
  assert.match(profileSource, /127\.0\.0\.1/u, `standalone ${environment} must fold to loopback URLs`);
}

// Retired non-formula domains must not appear in source config.
const topologyEnvFiles = [
  'cloud.development.env', 'cloud.test.env', 'cloud.staging.env', 'cloud.production.env',
  'standalone.development.env', 'standalone.test.env', 'standalone.staging.env', 'standalone.production.env',
];
const workspaceConfigText = [
  ...topologyEnvFiles.map((name) => readText(`etc/topology/${name}`)),
  readText('etc/sdkwork.deployment.config.json'),
  readText('specs/topology.spec.json'),
  deployManifest,
].join('\n');
assert.doesNotMatch(workspaceConfigText, /sdkwork-appstore-development|sdkwork-appstore-production/u,
  'legacy sdkwork-appstore-* domain names are retired');
assert.doesNotMatch(workspaceConfigText, /api-development|api-production/u,
  'legacy api-development/api-production names are retired');
assert.doesNotMatch(workspaceConfigText, /127\.0\.0\.1:8080/u, 'placeholder port 8080 is retired');

// deploy.yaml cloud expose domains must belong to the registered host set.
const cloudSection = deployManifest.split('standalone.production:')[0] ?? deployManifest;
const hostSets = new Set(Object.values(expectedOrigins).map((url) => new URL(url).hostname));
const exposeBlocks = [...cloudSection.matchAll(/domain:\s*([^\s]+)[\s\S]*?(?=\n\s{4}- domain:|\n\s{2}cloud\.|\n\s{2}standalone\.|$)/gu)];
assert.ok(exposeBlocks.length >= 3, 'deploy.yaml must declare cloud test/staging/production exposes');
for (const block of exposeBlocks) {
  assert.ok(hostSets.has(block[1]), `expose domain ${block[1]} must be registered in cloudPublicHosts`);
}

console.log('sdkwork-appstore web domain routing standard passed');
