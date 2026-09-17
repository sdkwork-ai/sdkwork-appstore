import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(appRoot, relative), 'utf8'));

// `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`: the route registry belongs to the
// core package, so the ids come from the core route table source rather than
// from a copy inside `specs/component.spec.json`.
const registrySource = fs.readFileSync(
  path.join(appRoot, 'packages/sdkwork-appstore-harmony-mobile-core/src/main/ets/composition/RouteTable.ets'),
  'utf8',
);
const routeIds = [
  ...registrySource.matchAll(
    /id:\s*'((?:app|console|admin)\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*)'/gu,
  ),
].map((match) => match[1]);

test('core declares a canonical route registry', () => {
  assert.ok(routeIds.length > 0, 'core RouteTable.ets declares no canonical route id');
  assert.equal(new Set(routeIds).size, routeIds.length, 'duplicate route id in core RouteTable.ets');
});

test('every route identity has a owning capability package', () => {
  const capabilities = new Set(routeIds.map((routeId) => routeId.split('.')[2]));
  for (const capability of capabilities) {
    assert.ok(
      fs.existsSync(path.join(appRoot, 'packages', `sdkwork-appstore-harmony-mobile-${capability}`)),
      `missing capability package for ${capability}`,
    );
  }
});

test('core declares the App Store app SDK dependency and port', () => {
  const spec = readJson(`packages/sdkwork-appstore-harmony-mobile-core/specs/component.spec.json`);
  assert.equal(spec.contracts.layerRole, 'frontend-core');
  const workspaces = spec.contracts.sdkDependencies.map((dep) => dep.workspace);
  assert.ok(workspaces.includes('sdkwork-appstore-app-sdk'));
});

test('root oh-package.json5 wires every package by file dependency', () => {
  const rootPackage = readJson('oh-package.json5');
  for (const dependency of Object.values(rootPackage.dependencies)) {
    assert.match(dependency, /^file:\.\/packages\//u);
  }
  assert.ok(Object.keys(rootPackage.dependencies).length >= 11);
});

test('configuration materializes a descriptor for every supported profile', () => {
  const expected = ["standalone.development","standalone.test","standalone.staging","standalone.production","standalone.demo","cloud.development","cloud.test","cloud.staging","cloud.production","cloud.demo"];
  for (const profileId of expected) {
    assert.ok(
      fs.existsSync(path.join(appRoot, 'config/app', `runtime-env.${profileId}.json`)),
      `missing runtime env for ${profileId}`,
    );
  }
});
