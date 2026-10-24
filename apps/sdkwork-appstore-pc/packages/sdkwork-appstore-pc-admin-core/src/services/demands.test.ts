import { describe, expect, it, vi } from 'vitest';

import {
  APPSTORE_ADMIN_DEMANDS_OPERATIONS,
  createAppstoreAdminDemandsPort,
  type AppstoreAdminDemandCategoriesSource,
} from './demands';
import { AppstoreAdminServiceError } from './errors';

function source(overrides: Partial<AppstoreAdminDemandCategoriesSource> = {}) {
  return {
    management: {
      list: vi.fn(async () => ({
        items: [
          {
            id: 'cat-web',
            parentId: 'cat-software',
            categoryCode: 'web',
            displayName: 'Web 应用',
            displayNameEn: 'Web applications',
            appForm: 'pc',
            level: '2',
            path: '/software/web',
            sortOrder: '10',
            status: 'disabled',
          },
          {
            id: 'cat-legacy',
            categoryCode: 'legacy',
            displayName: 'Legacy',
            appForm: 'windows-forms',
            level: '1',
            path: '/legacy',
            sortOrder: '20',
          },
          { id: '', categoryCode: 'ignored' },
        ],
        pageInfo: { mode: 'offset' as const, totalItems: '3' },
      })),
    },
    create: vi.fn(async (body: { categoryCode: string; displayName: string }) => ({
      id: 'cat-new',
      categoryCode: body.categoryCode,
      displayName: body.displayName,
      level: '1',
      path: '/new',
      sortOrder: '0',
      status: 'active',
    })),
    update: vi.fn(async (categoryId: string, body: { displayName?: string }) => ({
      id: categoryId,
      categoryCode: 'web',
      displayName: body.displayName ?? 'Web 应用',
      level: '2',
      path: '/software/web',
      sortOrder: '10',
      status: 'active',
    })),
    delete: vi.fn(async () => undefined),
    ...overrides,
  } satisfies AppstoreAdminDemandCategoriesSource;
}

describe('createAppstoreAdminDemandsPort', () => {
  it('projects the category tree rows and drops rows without an id', async () => {
    const port = createAppstoreAdminDemandsPort(source());
    const page = await port.listCategories();

    expect(page.items).toHaveLength(2);
    expect(page.items[0]).toMatchObject({
      categoryId: 'cat-web',
      parentId: 'cat-software',
      categoryCode: 'web',
      displayName: 'Web 应用',
      displayNameEn: 'Web applications',
      appForm: 'pc',
      level: 2,
      path: '/software/web',
      sortOrder: 10,
      status: 'disabled',
    });
    // An unknown application-form code is dropped rather than shown raw.
    expect(page.items[1]?.appForm).toBeUndefined();
    expect(page.items[1]?.status).toBeUndefined();
    expect(page.pageInfo.totalItems).toBe('3');
  });

  it('returns an empty page when the service returns no payload', async () => {
    const port = createAppstoreAdminDemandsPort(source({
      management: { list: async () => undefined as never },
    }));
    await expect(port.listCategories()).resolves.toEqual({
      items: [],
      pageInfo: { mode: 'offset' },
    });
  });

  it('creates a category with trimmed identifiers and returns the row', async () => {
    const s = source();
    const port = createAppstoreAdminDemandsPort(s);
    const created = await port.createCategory({
      categoryCode: '  admin-system ',
      displayName: ' 管理与业务系统 ',
      parentId: ' cat-web ',
      appForm: 'pc',
      sortOrder: 30,
    });

    expect(created).toMatchObject({ categoryId: 'cat-new', categoryCode: 'admin-system' });
    expect(s.create).toHaveBeenCalledWith({
      categoryCode: 'admin-system',
      displayName: '管理与业务系统',
      parentId: 'cat-web',
      appForm: 'pc',
      sortOrder: '30',
    });
  });

  it('rejects a category without a code or name before dispatching', async () => {
    const s = source();
    const port = createAppstoreAdminDemandsPort(s);

    await expect(port.createCategory({ categoryCode: ' ', displayName: 'x' }))
      .rejects.toMatchObject({ kind: 'validation' });
    await expect(port.createCategory({ categoryCode: 'x', displayName: '  ' }))
      .rejects.toMatchObject({ kind: 'validation' });
    expect(s.create).not.toHaveBeenCalled();
  });

  it('updates only the provided fields and returns the row', async () => {
    const s = source();
    const port = createAppstoreAdminDemandsPort(s);
    const updated = await port.updateCategory(' cat-web ', {
      displayName: ' Web 平台 ',
      status: 'active',
    });

    expect(updated).toMatchObject({ categoryId: 'cat-web', displayName: 'Web 平台' });
    expect(s.update).toHaveBeenCalledWith('cat-web', {
      displayName: 'Web 平台',
      status: 'active',
    });
  });

  it('requires a category id before updating or deleting', async () => {
    const s = source();
    const port = createAppstoreAdminDemandsPort(s);

    await expect(port.updateCategory(' ', { displayName: 'x' }))
      .rejects.toMatchObject({ kind: 'validation' });
    await expect(port.deleteCategory('')).rejects.toMatchObject({ kind: 'validation' });
    expect(s.update).not.toHaveBeenCalled();
    expect(s.delete).not.toHaveBeenCalled();
  });

  it('deletes one category by its trimmed id', async () => {
    const s = source();
    const port = createAppstoreAdminDemandsPort(s);
    await port.deleteCategory(' cat-web ');
    expect(s.delete).toHaveBeenCalledWith('cat-web');
  });

  it('normalizes a transport failure onto the operation id', async () => {
    const port = createAppstoreAdminDemandsPort(source({
      create: async () => {
        throw Object.assign(new Error('conflict'), { code: 'CONFLICT', httpStatus: 409 });
      },
    }));

    const failure = await port
      .createCategory({ categoryCode: 'web', displayName: 'Web' })
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AppstoreAdminServiceError);
    expect(failure).toMatchObject({
      kind: 'conflict',
      operationId: APPSTORE_ADMIN_DEMANDS_OPERATIONS.createCategory,
    });
  });
});
