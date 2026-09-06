# User Store Service

SDKWork appstore `userStore` capability service: user-defined custom
categories, category-to-listing bindings, and shareable personal appstore
views.

Boundary: isolated from the platform catalog category domain; stores
`listing_id` references only and resolves display cards through
`ListingCardProviderPort`.
