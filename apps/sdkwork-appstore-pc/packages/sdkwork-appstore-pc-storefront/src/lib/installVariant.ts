import {
  paidPricing,
  resolveInstallVariantAction,
  type AppItem,
  type InstallPlan,
  type InstallVariant,
  type InstallVariantAction,
} from '@sdkwork/appstore-pc-core'

/**
 * Locale key of a build's architecture label.
 *
 * macOS names arm64 "Apple Silicon" because that is what its users know; every
 * other platform keeps the CPU architecture name. A listing-level variant has
 * no published architecture and therefore no label.
 * @param variant - resolved install variant.
 * @returns the key under `common.distribution.architecture`, or null.
 */
export function architectureLabelKey(
  variant: Pick<InstallVariant, 'platform' | 'architecture'>,
): string | null {
  if (variant.architecture === null) {
    return null
  }
  if (variant.architecture === 'arm64' && variant.platform === 'macos') {
    return 'appleSilicon'
  }
  return variant.architecture
}

/**
 * What clicking one build does for this listing on this device.
 *
 * Paid listings keep the checkout gate for every build until the listing is in
 * the library: a foreign-platform file is still a paid download and must pass
 * through the install dialog, which owns checkout. Afterwards — and for every
 * free listing — host compatibility decides: an installable build goes through
 * the install flow, a build the host cannot run downloads as a plain file.
 * @param app - listing item (pricing model decides the gate).
 * @param plan - resolved install plan for the host.
 * @param variant - build the user selected.
 * @param installed - whether the listing is already in this library.
 * @returns the action the build row and call to action perform.
 */
export function resolveListingBuildAction(
  app: Pick<AppItem, 'pricingModel'>,
  plan: Pick<InstallPlan, 'host'>,
  variant: InstallVariant,
  installed: boolean,
): InstallVariantAction {
  if (paidPricing(app.pricingModel) && !installed) {
    return 'install'
  }
  return resolveInstallVariantAction(plan.host, variant)
}
