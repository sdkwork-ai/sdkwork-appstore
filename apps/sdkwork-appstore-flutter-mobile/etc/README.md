# etc/

Source configuration for `sdkwork-appstore-flutter-mobile`.

## Discovery

`sdkwork.deployment.config.json` is the deployment profile index for this
deployable root. It declares the parent deployment authority
(`../../../etc/sdkwork.deployment.config.json`), the parent topology contract
(`../../../specs/topology.spec.json`), and how non-secret runtime config
materializes.

## Materialization

```bash
pnpm workflow:materialize-client-env
```

Format: `dart-define-json`. Output: `../env/sdkwork.{deploymentProfile}.{environment}.json` for each
of the 10 supported profiles
(standalone.development, standalone.test, standalone.staging, standalone.production, standalone.demo, cloud.development, cloud.test, cloud.staging, cloud.production, cloud.demo).

## Rules

- Commit non-secret templates and environment descriptors only.
- Never commit access tokens, refresh tokens, signing material, or app secrets.
- Concrete environment, runtime, base URL, and deployment values belong here,
  not in `sdkwork.app.config.json`.
