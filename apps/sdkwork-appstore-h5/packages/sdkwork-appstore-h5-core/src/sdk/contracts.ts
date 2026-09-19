/**
 * Generated App Store app SDK client port.
 *
 * Capability packages receive a client through this type and never construct
 * one, and they never import the generated SDK module directly
 * (`APP_SDK_INTEGRATION_SPEC.md`; `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
 * sections 5 and 8). The concrete factory lives in the H5 application root
 * (`src/services/storeClient.ts`), which is the only place allowed to bind the
 * client to the root's single `appstoreTokenManager` instance; this package
 * only publishes the port type, so no second factory and no second token store
 * can appear beside it.
 */
export type {
  AppStoreClient as AppstoreAppSdkClient,
  TokenManager as AppstoreTokenManager,
} from '@sdkwork/appstore-app-sdk';
