export interface CategoryLocalizationInput {
  /** BCP 47 locale tag, for example zh-CN or en-US. */
  locale: string;
  displayName: string;
  description?: string;
}
