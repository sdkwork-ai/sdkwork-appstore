# sdkwork-appstore-user-store-service

Business service/use-case crate for the App Store `userStore` capability:
user-defined custom categories, category items, and shareable personal
appstore views.

## Boundary

- Owns only this crate's SDKWork responsibility.
- Isolated from the platform catalog category domain; cross-domain listing
  display goes through `ListingCardProviderPort` (anti-corruption layer).
- Must preserve authored OpenAPI, database registry, and SDK family boundaries.
- Must not call raw HTTP, parse credential headers manually, or bypass
  generated/dependency SDKs.

## Operations

| Operation | Method |
|---|---|
| appstore.userStore.category.create | category_create |
| appstore.userStore.category.list | categories_list |
| appstore.userStore.category.retrieve | category_retrieve |
| appstore.userStore.category.update | category_update |
| appstore.userStore.category.delete | category_delete |
| appstore.userStore.item.add | item_add |
| appstore.userStore.item.remove | item_remove |
| appstore.userStore.item.list | items_list |
| appstore.userStore.item.reorder | items_reorder |
| appstore.userStore.share.create | share_create |
| appstore.userStore.share.list | shares_list |
| appstore.userStore.share.update | share_update |
| appstore.userStore.share.revoke | share_revoke |
| appstore.userStore.share.regenerateToken | share_regenerate_token |
| appstore.userStore.public.retrieve | public_user_store_view |
| appstore.userStore.public.items.list | public_category_items |

## Verification

```bash
cargo check -p sdkwork-appstore-user-store-service
cargo test -p sdkwork-appstore-user-store-service
```
