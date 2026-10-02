import type { MediaResource } from './media-resource';

export interface ListingDetail {
  id: string;
  appId?: string;
  appKey: string;
  displayName: string;
  subtitle?: string;
  listingSlug: string;
  pricingModel: 'FREE' | 'PAID' | 'FREEMIUM' | 'SUBSCRIPTION';
  icon?: MediaResource;
  /** Publisher display name of the listing owner. */
  developerName?: string;
  /** Localized short/full description preview. */
  description?: string;
  currentVersion?: string;
  fileSizeBytes?: string;
  whatsNewSummary?: string;
  releasedAt?: string;
  averageRating?: string;
  ratingCount?: number;
  /** Raw platform codes the app ships for (appstore_platform_dictionary). */
  platforms?: string[];
  /** Store application type of the owning appstore_app row. */
  appType?: string;
  /** Direct-open URL for web/H5 distributions; QR scan target. */
  accessUrl?: string;
  listingStatus?: string;
  reviewStatus?: string;
  commentsThreadId?: string;
  /** Commerce catalog product id for paid checkout (cloudrouter/commerce domain). */
  commerceProductId?: string;
  currentReleaseId?: string;
  categories?: string[];
}
