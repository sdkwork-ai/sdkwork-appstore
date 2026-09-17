import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

import type { CategoryPageResult } from "../types/categoryModels.js";

/**
 * Category service.
 *
 * The generated App Store app SDK client is injected by the root bootstrap
 * (`APP_SDK_INTEGRATION_SPEC.md`); this package never constructs a client and
 * never issues raw HTTP.
 */
export interface CategoryService {
  readonly capability: "category";
}

export function createCategoryService(client: AppstoreAppClient): CategoryService {
  void client;
  return { capability: "category" };
}

export function emptyCategoryResult(): CategoryPageResult<never> {
  return { items: [] };
}
