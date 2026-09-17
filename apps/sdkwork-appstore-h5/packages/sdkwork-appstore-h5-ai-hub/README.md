# @sdkwork/appstore-h5-ai-hub

Ai Hub capability package for the SDKWork App Store H5 root.

Owns route ids: `app.store.ai-hub.index`, `app.store.ai-hub.experts`, `app.store.ai-hub.plugins`, `app.store.ai-hub.skills`, `app.store.ai-hub.mcp`, `app.store.ai-hub.templates`, `app.store.ai-hub.template-detail`, `app.store.ai-hub.template-detail-alias`.

Integration contracts only: public exports are route contributions, the service
port, the package state slice, and domain models
(`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 6). Screens stay private
to the package.
