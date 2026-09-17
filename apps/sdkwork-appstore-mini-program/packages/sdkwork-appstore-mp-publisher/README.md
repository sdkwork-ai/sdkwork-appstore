# @sdkwork/appstore-mp-publisher

Publisher capability package for the SDKWork App Store mini program.

Owns route identities: `console.store.publisher.overview` (`/publisher`), `console.store.publisher.app-create` (`/publisher/apps/new`), `console.store.publisher.app-manage` (`/publisher/apps/:id`).

Receives the generated app SDK client by injection; never constructs one.
