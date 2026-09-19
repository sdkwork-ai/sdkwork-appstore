import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConsoleHeader } from '../components/console/ConsoleHeader';
import { ConsoleNotificationAlert } from '../components/console/ConsoleNotificationAlert';
import { PublishAppForm } from '../components/console/PublishAppForm';
import { ManagedAppsList, PublishedApp } from '../components/console/ManagedAppsList';
import { ApiCredentialsCard } from '../components/console/ApiCredentialsCard';
import { SecurityPolicyCard } from '../components/console/SecurityPolicyCard';
import { ConsoleService, ManagedApp, ApiCredential } from '../services/api';

export default function ConsoleSettings() {
  const { t } = useTranslation();
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('高效工作');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [publishedApps, setPublishedApps] = useState<PublishedApp[]>([]);
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConsoleData = async () => {
    try {
      // Managed apps are the primary surface; API credentials are a
      // fail-closed capability that must never block the page load.
      const [apps, creds] = await Promise.all([
        ConsoleService.getManagedApps().catch(() => []),
        ConsoleService.getApiCredentials().catch(() => []),
      ]);
      setPublishedApps(apps);
      setCredentials(creds);
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
      category,
      version,
      description,
    });

    setPublishedApps((prev) => [created, ...prev]);
    setSuccessMsg(t('console.alert.success', { appName }));
    setAppName('');
    setDescription('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleGenerateKey = async (name: string) => {
    try {
      const cred = await ConsoleService.generateApiKey(name);
      setCredentials((prev) => [cred, ...prev]);
    } catch (err) {
      console.error('Failed to generate API key', err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const success = await ConsoleService.revokeApiKey(id);
      if (success) {
        setCredentials((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'revoked' as const } : c))
        );
      }
    } catch (err) {
      console.error('Failed to revoke API key', err);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 select-none animate-fade-in">
      {/* Sub-component: Console Header */}
      <ConsoleHeader />

      {/* Sub-component: Notification Alert */}
      <ConsoleNotificationAlert message={successMsg} />

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('console.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Submit App & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sub-component: Form */}
            <PublishAppForm
              appName={appName}
              category={category}
              version={version}
              description={description}
              onAppNameChange={setAppName}
              onCategoryChange={setCategory}
              onVersionChange={setVersion}
              onDescriptionChange={setDescription}
              onSubmit={handlePublish}
            />

            {/* Sub-component: App List */}
            <ManagedAppsList apps={publishedApps} />
          </div>

          {/* Right 1 Col: Credentials & Security Status */}
          <div className="space-y-6">
            {/* Sub-component: API Key Card */}
            <ApiCredentialsCard
              credentials={credentials}
              onGenerateKey={handleGenerateKey}
              onRevokeKey={handleRevokeKey}
            />

            {/* Sub-component: Security Policy Card */}
            <SecurityPolicyCard />
          </div>
        </div>
      )}
    </div>
  );
}


