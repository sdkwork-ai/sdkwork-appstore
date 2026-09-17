# @sdkwork/sdkwork-appstore-harmony-mobile-user-store

User Store capability package for the SDKWork App Store HarmonyOS
mobile root.

Owns route identities: `app.store.user-store.index` (`/user-store`), `app.store.user-store.public` (`/store/:shareToken`).

Receives the App Store app SDK clients by injection; never constructs a client.
