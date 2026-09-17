# etc/

Source configuration for `sdkwork-appstore-h5`.

## Discovery

`sdkwork.deployment.config.json` is the component deployment descriptor for this
deployable root. It declares the parent deployment authority
(`../../../etc/sdkwork.deployment.config.json`), the parent topology contract
(`../../../specs/topology.spec.json`), and how non-secret runtime config
materializes.

## Sources

Browser runtime sources live under `browser/`:

```text
etc/browser/runtime-env.<deploymentProfile>.<environment>.json
```

The declared matrix is ten profile ids: `standalone.{development,test,staging,demo,production}`
and `cloud.{development,test,staging,demo,production}`. Every declared id is listed in
`profiles` in `sdkwork.deployment.config.json`; selection of an undeclared profile fails closed.

## Materialization

```bash
node scripts/materialize-runtime-env.mjs
```

Format: `json`. Output: `../public/runtime-env.json`.

The canonical repository tool that keeps this matrix aligned to
`ENVIRONMENT_SPEC.md` is `../../../../sdkwork-specs/tools/align-browser-runtime-env.mjs`
(run with `--dry-run` to preview); `regress-browser-runtime-env.mjs --workspace <sdkwork-space-root>`
regresses it.

## Validation

```bash
node ../../../../sdkwork-specs/tools/check-source-config-standard.mjs --root .
node ../../../../sdkwork-specs/tools/check-browser-build-scripts.mjs --root .
```

## Rules

- Commit non-secret templates and environment descriptors only.
- Never commit access tokens, refresh tokens, signing material, or app secrets.
- Cloud profiles target the unified `api-<suffix>.<base-domain>` edge origin of the
  environment (`ENVIRONMENT_SPEC.md` section 5.1.0.1); standalone profiles stay same-origin
  with root-relative `/` SDK base URLs.
- Concrete environment, runtime, base URL, and deployment values belong here,
  not in `sdkwork.app.config.json`.
