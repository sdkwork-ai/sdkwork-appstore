import type {
  CompanyDemandCategoryCommand,
  CompanyDemandCategoryPatchCommand,
  SdkWorkPageData,
} from '@sdkwork/company-backend-sdk';

import {
  AppstoreAdminServiceError,
  executeAdminOperation,
  requireAdminIdentifier,
} from './errors';
import {
  type AppstoreAdminPage,
  emptyPage,
  mapPage,
  readId,
  readNumber,
  readRecord,
  readSingleRecord,
  readString,
} from './viewModel';

/**
 * Demand-domain operation ids owned by this port. Demand data lives in the
 * `sdkwork-company` backend API and is governed by the
 * `company.demand_categories.manage` permission.
 */
export const APPSTORE_ADMIN_DEMANDS_OPERATIONS = {
  listCategories: 'company.demandCategories.management.list',
  createCategory: 'company.demandCategories.create',
  updateCategory: 'company.demandCategories.update',
  deleteCategory: 'company.demandCategories.delete',
} as const;

/**
 * Application forms a demand may commission, one code per SDKWork application
 * architecture standard. Kept as an open union: the backend owns the
 * authoritative enum and a new form must not break an existing console.
 */
export const APPSTORE_ADMIN_DEMAND_APP_FORMS = [
  'pc',
  'h5',
  'static-web',
  'miniprogram',
  'flutter',
  'uniapp',
  'android-native',
  'ios-native',
  'harmony-native',
  'unity',
] as const;

/** Lifecycle statuses a demand category accepts. */
export const APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES = ['active', 'disabled'] as const;

/** One {@link APPSTORE_ADMIN_DEMAND_APP_FORMS} code. */
export type AppstoreAdminDemandAppForm = (typeof APPSTORE_ADMIN_DEMAND_APP_FORMS)[number];

/** One {@link APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES} code. */
export type AppstoreAdminDemandCategoryStatus =
  (typeof APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES)[number];

/** One operator-visible demand category row. */
export interface AppstoreAdminDemandCategoryRow {
  categoryId: string;
  categoryCode: string;
  parentId?: string;
  displayName: string;
  displayNameEn?: string;
  description?: string;
  appForm?: AppstoreAdminDemandAppForm;
  level: number;
  path: string;
  sortOrder?: number;
  status?: AppstoreAdminDemandCategoryStatus;
}

export interface AppstoreAdminCreateDemandCategoryInput {
  categoryCode: string;
  displayName: string;
  parentId?: string;
  displayNameEn?: string;
  description?: string;
  appForm?: AppstoreAdminDemandAppForm;
  sortOrder?: number;
  status?: AppstoreAdminDemandCategoryStatus;
}

export interface AppstoreAdminUpdateDemandCategoryInput {
  parentId?: string;
  displayName?: string;
  displayNameEn?: string;
  description?: string;
  appForm?: AppstoreAdminDemandAppForm;
  sortOrder?: number;
  status?: AppstoreAdminDemandCategoryStatus;
}

/** Demand-domain capabilities consumed by the demand console pages. */
export interface AppstoreAdminDemandsPort {
  /** List every category, including disabled ones, in tree order. */
  listCategories(): Promise<AppstoreAdminPage<AppstoreAdminDemandCategoryRow>>;
  /** Create one category node; returns the created row. */
  createCategory(
    input: AppstoreAdminCreateDemandCategoryInput,
  ): Promise<AppstoreAdminDemandCategoryRow>;
  /** Patch one category node; returns the updated row. */
  updateCategory(
    categoryId: string,
    input: AppstoreAdminUpdateDemandCategoryInput,
  ): Promise<AppstoreAdminDemandCategoryRow>;
  /** Delete one leaf category that no demand uses. */
  deleteCategory(categoryId: string): Promise<void>;
}

/**
 * The company backend operations this port dispatches.
 *
 * Declared as the narrow shape the port consumes so a test can supply a
 * stand-in; the generated `company.demandCategories` client satisfies it
 * structurally.
 */
export interface AppstoreAdminDemandCategoriesSource {
  readonly management: {
    /** @returns the category page from `demandCategories.management.list`. */
    list(): Promise<SdkWorkPageData>;
  };
  /** Create one category node. */
  create(body: CompanyDemandCategoryCommand): Promise<unknown>;
  /** Patch one category node. */
  update(categoryId: string, body: CompanyDemandCategoryPatchCommand): Promise<unknown>;
  /** Delete one category node. */
  delete(categoryId: string): Promise<void>;
}

function readAppForm(value: string): AppstoreAdminDemandAppForm | undefined {
  return (APPSTORE_ADMIN_DEMAND_APP_FORMS as readonly string[]).includes(value)
    ? (value as AppstoreAdminDemandAppForm)
    : undefined;
}

function readDemandCategoryStatus(
  value: string,
): AppstoreAdminDemandCategoryStatus | undefined {
  return (APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES as readonly string[]).includes(value)
    ? (value as AppstoreAdminDemandCategoryStatus)
    : undefined;
}

function projectDemandCategoryRow(
  record: Record<string, unknown>,
): AppstoreAdminDemandCategoryRow | undefined {
  const source = readRecord(record, 'category') ?? record;
  const categoryId = readId(source, 'id', 'categoryId', 'category_id');
  const categoryCode = readString(source, 'categoryCode', 'category_code');
  if (!categoryId || !categoryCode) {
    return undefined;
  }
  const parentId = readId(source, 'parentId', 'parent_id');
  const displayNameEn = readString(source, 'displayNameEn', 'display_name_en');
  const description = readString(source, 'description');
  const appForm = readAppForm(readString(source, 'appForm', 'app_form'));
  const status = readDemandCategoryStatus(readString(source, 'status'));
  const sortOrder = readNumber(source, 'sortOrder', 'sort_order');
  return {
    categoryId,
    categoryCode,
    ...(parentId ? { parentId } : {}),
    displayName: readString(source, 'displayName', 'display_name') || categoryCode,
    ...(displayNameEn ? { displayNameEn } : {}),
    ...(description ? { description } : {}),
    ...(appForm === undefined ? {} : { appForm }),
    level: readNumber(source, 'level') ?? 1,
    path: readString(source, 'path'),
    ...(sortOrder === undefined ? {} : { sortOrder }),
    ...(status ? { status } : {}),
  };
}

function readCategoryRow(value: unknown): AppstoreAdminDemandCategoryRow {
  const record = readSingleRecord(value);
  const row = record === undefined ? undefined : projectDemandCategoryRow(record);
  if (row === undefined) {
    throw new AppstoreAdminServiceError({
      kind: 'unknown',
      message: 'The demand category response did not contain a category.',
      fieldErrors: [],
    });
  }
  return row;
}

/**
 * Build the demand-domain port over the company backend client's demand
 * categories operations.
 * @param categories - `company.demandCategories` from the company backend client.
 * @returns the demand console's read and authoring operations.
 */
export function createAppstoreAdminDemandsPort(
  categories: AppstoreAdminDemandCategoriesSource,
): AppstoreAdminDemandsPort {
  return {
    async listCategories() {
      const payload = await executeAdminOperation(APPSTORE_ADMIN_DEMANDS_OPERATIONS.listCategories, () =>
        categories.management.list(),
      );
      if (!payload) {
        return emptyPage<AppstoreAdminDemandCategoryRow>();
      }
      return mapPage(payload, projectDemandCategoryRow);
    },

    async createCategory(input) {
      const categoryCode = requireAdminIdentifier(input.categoryCode, 'categoryCode');
      const displayName = requireAdminIdentifier(input.displayName, 'displayName');
      const payload = await executeAdminOperation(APPSTORE_ADMIN_DEMANDS_OPERATIONS.createCategory, () =>
        categories.create({
          categoryCode,
          displayName,
          ...(input.parentId?.trim() ? { parentId: input.parentId.trim() } : {}),
          ...(input.displayNameEn?.trim() ? { displayNameEn: input.displayNameEn.trim() } : {}),
          ...(input.description?.trim() ? { description: input.description.trim() } : {}),
          ...(input.appForm === undefined ? {} : { appForm: input.appForm }),
          ...(input.sortOrder === undefined ? {} : { sortOrder: String(input.sortOrder) }),
          ...(input.status === undefined ? {} : { status: input.status }),
        }),
      );
      return readCategoryRow(payload);
    },

    async updateCategory(categoryId, input) {
      const id = requireAdminIdentifier(categoryId, 'categoryId');
      const payload = await executeAdminOperation(APPSTORE_ADMIN_DEMANDS_OPERATIONS.updateCategory, () =>
        categories.update(id, {
          ...(input.parentId === undefined ? {} : { parentId: input.parentId.trim() }),
          ...(input.displayName?.trim() ? { displayName: input.displayName.trim() } : {}),
          ...(input.displayNameEn?.trim() ? { displayNameEn: input.displayNameEn.trim() } : {}),
          ...(input.description?.trim() ? { description: input.description.trim() } : {}),
          ...(input.appForm === undefined ? {} : { appForm: input.appForm }),
          ...(input.sortOrder === undefined ? {} : { sortOrder: String(input.sortOrder) }),
          ...(input.status === undefined ? {} : { status: input.status }),
        }),
      );
      return readCategoryRow(payload);
    },

    async deleteCategory(categoryId) {
      const id = requireAdminIdentifier(categoryId, 'categoryId');
      await executeAdminOperation(APPSTORE_ADMIN_DEMANDS_OPERATIONS.deleteCategory, () =>
        categories.delete(id),
      );
    },
  };
}
