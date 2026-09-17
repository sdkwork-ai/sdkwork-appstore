# sdks/

Generated SDK integration notes for `sdkwork-appstore-harmony-mobile`.

Harmony packages consume `/app/v3/api` through ArkTS/TypeScript app SDK
clients adapted for the Harmony runtime
(`HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md` section 6). The SDK generation
chain currently emits the TypeScript target of `sdkwork-appstore-app-sdk` only;
governed generated output stays in the owning repository under `sdks/` and is
never vendored here.
