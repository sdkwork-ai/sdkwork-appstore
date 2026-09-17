# sdkwork_appstore_flutter_mobile_publisher

Publisher capability package for the SDKWork App Store Flutter
mobile root.

Owns route identities: `console.store.publisher.overview` (`/publisher`), `console.store.publisher.app-create` (`/publisher/apps/new`), `console.store.publisher.app-manage` (`/publisher/apps/:id`).

Receives the App Store app SDK clients by injection; never constructs a client.
