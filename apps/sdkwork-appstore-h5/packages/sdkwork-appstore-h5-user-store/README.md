# @sdkwork/appstore-h5-user-store

User Store capability package for the SDKWork App Store H5 root.

Owns route ids: `app.store.user-store.index`, `app.store.user-store.public`.

Integration contracts only: public exports are route contributions, the service
port, the package state slice, and domain models
(`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 6). Screens stay private
to the package.
