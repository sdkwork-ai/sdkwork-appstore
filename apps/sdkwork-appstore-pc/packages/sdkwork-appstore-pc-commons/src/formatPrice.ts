import { formatMoney } from '@sdkwork/utils/money'

/**
 * Format a storefront price for the active locale.
 * @param price - amount in the catalog currency; `0` renders as Get.
 * @param locale - BCP 47 locale tag used by the money formatter.
 * @returns a display string for the price control.
 */
export function formatPrice(price: number, locale = 'en-US'): string {
  if (price === 0) return 'Get'
  return formatMoney(price, { currency: 'USD', locale, mode: 'symbol' }) ?? ''
}
