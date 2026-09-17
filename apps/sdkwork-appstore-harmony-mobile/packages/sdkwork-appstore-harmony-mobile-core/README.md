# @sdkwork/sdkwork-appstore-harmony-mobile-core

HarmonyOS mobile core: runtime config, App Store app SDK port and factories,
token manager, session store, route registry, and host adapter contracts.

No ArkTS app SDK target is produced by the SDK generation chain, so this
package owns the declared SDK port and credential boundary rather than
vendoring a transport copy.
