import { useState, useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { ConsoleHeader } from '../components/console/ConsoleHeader';
import { ConsoleNotificationAlert } from '../components/console/ConsoleNotificationAlert';
import { PublishAppForm } from '../components/console/PublishAppForm';
import { ManagedAppsList, PublishedApp } from '../components/console/ManagedAppsList';
import {
  ConsoleService,
  ManagedApp,
  type ConsoleCategoryOption,
} from '../services/api';
import type { AppstorePcSessionStore } from '@sdkwork/appstore-pc-runtime/session';

interface ConsoleSettingsProps {
  /**
   * Session store from the app runtime; the tenant badge reads the live
   * snapshot instead of a hardcoded label. Optional so embedders without a
   * runtime handle still render the page (badge hidden).
   */
  session?: AppstorePcSessionStore;
}

/**
 * Resolves the tenant badge label from the session context. Returns
 * `undefined` while signed out so the header hides the badge instead of
 * showing a fabricated tenant.
 */
function readSessionTenantLabel(session: AppstorePcSessionStore | undefined): string | undefined {
  if (!session) {
    return undefined;
  }
  const context = session.getSnapshot().context;
  const tenantId = context?.tenantId?.trim();
  return tenantId ? tenantId : undefined;
}

export default function ConsoleSettings({ session }: ConsoleSettingsProps) {
  const { t } = useTranslation();
  const [appName, setAppName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [publishedApps, setPublishedApps] = useState<PublishedApp[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ConsoleCategoryOption[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const tenantLabel = useSyncExternalStore(
    (listener) => session?.subscribe(listener) ?? (() => {}),
    () => readSessionTenantLabel(session),
    () => readSessionTenantLabel(session),
  );

  const loadConsoleData = async () => {
    try {
      // Managed apps and live catalog categories are both real reads; a
      // category outage must not block the page, so it degrades to an empty
      // picker instead of fabricated options.
      const [apps, categories] = await Promise.all([
        ConsoleService.getManagedApps().catch(() => [] as ManagedApp[]),
        ConsoleService.listCategories().catch(() => [] as ConsoleCategoryOption[]),
      ]);
      setPublishedApps(apps);
      setCategoryOptions(categories);
    } catch (err) {
      console.error('Failed to load console settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsoleData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    const created = await ConsoleService.publishApp({
      name: appName,
      categoryId: categoryId || undefined,
      version,
      description,
    });

    setPublishedApps((prev) => [created, ...prev]);
    setSuccessMsg(t('console.alert.success', { appName }));
    setAppName('');
    setDescription('');
    setVersion('1.0.0');
    setCategoryId('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 select-none animate-fade-in">
      {/* Sub-component: Console Header */}
      <ConsoleHeader tenantLabel={tenantLabel} />

      {/* Sub-component: Notification Alert */}
      <ConsoleNotificationAlert message={successMsg} />

      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('console.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Submit App & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sub-component: Form */}
            <PublishAppForm
              appName={appName}
              categoryId={categoryId}
              version={version}
              description={description}
              categoryOptions={categoryOptions.map((option) => ({
                value: option.categoryId,
                label: option.displayName,
              }))}
              onAppNameChange={setAppName}
              onCategoryChange={setCategoryId}
              onVersionChange={setVersion}
              onDescriptionChange={setDescription}
              onSubmit={handlePublish}
            />

            {/* Sub-component: App List */}
            <ManagedAppsList apps={publishedApps} />
          </div>

          {/* Right 1 Col: platform capability notices. The App Store app API
            does not expose store API credentials, security policy, or console
            audit logs, so these render as explicit static states instead of
            interactive forms whose calls can never succeed. */}
          <div className="space-y-6">
            <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm space-y-2 ">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-store-ink-faint" />
                <h2 className="text-sm font-bold text-store-ink ">
                  {t('console.apiKeys.cardTitle', 'API 密钥与 SDK 凭证')}
                </h2>
              </div>
              <p className="text-xs text-store-ink-faint ">
                {t(
                  'console.apiKeys.unavailable',
                  '商店 API 凭证由平台统一签发，应用商店暂不提供发布者自助创建，请通过平台控制台管理。',
                )}
              </p>
            </div>

            <div className="bg-store-subtle/50 dark:bg-store-surface border border-store-line rounded-store-card p-5 shadow-sm space-y-2 ">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-store-ink-faint" />
                <h2 className="text-sm font-bold text-store-ink ">
                  {t('console.security.title')}
                </h2>
              </div>
              <p className="text-xs text-store-ink-faint ">
                {t(
                  'console.security.unavailable',
                  '安全策略能力暂未由 App Store 后端提供，当前保持安全默认配置。',
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
