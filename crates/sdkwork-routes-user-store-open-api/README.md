# sdkwork-routes-user-store-open-api

HTTP route crate for the appstore `userStore` capability (open-api).

Boundary: owns only route registration, request/response mapping, and
problem-detail projection for this capability. Business rules live in
`sdkwork-appstore-user-store-service`.
