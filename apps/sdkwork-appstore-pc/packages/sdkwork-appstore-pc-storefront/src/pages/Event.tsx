import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem, EventItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppRow } from '../components/AppRow';

export default function Event() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [event, setEvent] = useState<EventItem | undefined>();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const detail = await AppStoreService.getEventDetail(id);
        if (cancelled) {
          return;
        }
        setEvent(detail);
        if (!detail || detail.apps.length === 0) {
          setLoading(false);
          return;
        }
        // Exact bounded resolution of the event's listing ids; the previous
        // client-side filter over a wide catalog page dropped items silently.
        const resolved = await AppStoreService.getAppsByIds(detail.apps);
        const byId = new Map(resolved.map((app) => [app.id, app]));
        const items = detail.apps
          .map((appId) => byId.get(appId))
          .filter((app): app is AppItem => Boolean(app));
        if (!cancelled) {
          setApps(items);
        }
      } catch (error) {
        console.error('Failed to load event', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="p-6 md:p-8 w-full max-w-full">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
          <h3 className="text-sm font-bold text-store-ink ">
            {t('events.grid.empty')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none space-y-6">
      {/* Compact entity heading: the former gradient hero card is gone; the
          event title, description, and schedule metadata stay as plain text. */}
      <div>
        <p className="text-xs font-bold text-store-brand uppercase tracking-wider">
          {t('events.header.subtitle')}
        </p>
        <h1 className="text-xl font-bold tracking-tight text-store-ink mt-1">
          {t('events.header.title', { title: event.title })}
        </h1>
        {event.subtitle && (
          <p className="text-xs text-store-ink-faint mt-1 max-w-xl">{event.subtitle}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-store-ink-faint">
          {event.startsAt && <span>{t('events.meta.startsAt', { date: event.startsAt })}</span>}
          {event.endsAt && <span>{t('events.meta.endsAt', { date: event.endsAt })}</span>}
          {event.status && (
            <span className="px-2 py-0.5 rounded-full bg-store-subtle text-store-ink-soft">
              {event.status === 'active' ? t('events.meta.active') : t('events.meta.endsSoon')}
            </span>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-store-ink ">
          {t('events.grid.title', { count: apps.length })}
        </h3>
        {apps.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {apps.map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-dashed border-store-line-strong ">
            <h3 className="text-sm font-bold text-store-ink ">
              {t('events.grid.empty')}
            </h3>
          </div>
        )}
      </section>
    </div>
  );
}
