import type { SdkworkAuthRuntimeConfig } from '@sdkwork/auth-pc-react';

export function resolveAppstorePcAuthRuntimeConfig(): SdkworkAuthRuntimeConfig {
  return {
    leftRailMode: 'qr-only',
    loginMethods: ['password', 'emailCode', 'phoneCode'],
    oauthLoginEnabled: false,
    oauthProviders: [],
    qrLoginEnabled: true,
    recoveryMethods: ['email', 'phone'],
    registerMethods: ['email', 'phone'],
    verificationPolicy: {
      emailCodeLoginEnabled: true,
      emailRegistrationVerificationRequired: false,
      phoneCodeLoginEnabled: true,
      phoneRegistrationVerificationRequired: false,
    },
  };
}
