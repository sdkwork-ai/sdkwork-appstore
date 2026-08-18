import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem, Review } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppHeader } from '../components/app-detail/AppHeader';
import { AppScreenshots } from '../components/app-detail/AppScreenshots';
import { AppDescription } from '../components/app-detail/AppDescription';
import { AppWhatsNew } from '../components/app-detail/AppWhatsNew';
import { AppReviews } from '../components/app-detail/AppReviews';
import { AppInfo } from '../components/app-detail/AppInfo';
import { AppInAppPurchases } from '../components/app-detail/AppInAppPurchases';
import { AppPrivacy } from '../components/app-detail/AppPrivacy';
import { AppMoreByDeveloper } from '../components/app-detail/AppMoreByDeveloper';
import { AppRecommendations } from '../components/app-detail/AppRecommendations';

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [app, setApp] = useState<AppItem | null>(null);
  const [allApps, setAllApps] = useState<AppItem[]>([]);
  const [similarApps, setSimilarApps] = useState<AppItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [otherApps, setOtherApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll the main content area to top on id change
    const scrollContainer = document.getElementById('main-scroll-area');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  useEffect(() => {
    async function fetchAppDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const appData = await AppStoreService.getAppById(id);
        if (appData) {
          setApp(appData);
          const [appReviews, moreApps, appsList, similar] = await Promise.all([
            AppStoreService.getReviewsByAppId(id),
            AppStoreService.getMoreByDeveloper(appData.developer, id),
            AppStoreService.getAllApps(),
            AppStoreService.getSimilarApps(id).catch(() => []),
          ]);
          setReviews(appReviews);
          setOtherApps(moreApps);
          setAllApps(appsList);
          setSimilarApps(similar);
        } else {
          setApp(null);
        }
      } catch (error) {
        console.error("Failed to load app details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!app) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full flex-1">
        <h2 className="text-2xl font-bold mb-4 text-[#1C1C1E] dark:text-[#F5F5F5]">{t('appDetail.notFound')}</h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-[#0A84FF] font-medium hover:underline cursor-pointer"
        >
          {t('appDetail.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 p-6 md:p-10 min-h-full flex flex-col items-center">
      <div className="w-full max-w-full flex flex-col flex-1">
        {/* Header section with Icon, Title, Rating badges */}
        <AppHeader app={app} />

        {/* Screenshots */}
        <AppScreenshots screenshots={app.screenshots} icon={app.icon} />

        {/* About this app */}
        <AppDescription description={app.description} />

        {/* What's New */}
        <AppWhatsNew whatsNew={app.whatsNew} />

        {/* Ratings & Reviews */}
        <AppReviews
          appId={app.id}
          rating={app.rating}
          reviewsCount={app.reviewsCount}
          ratingBreakdown={app.ratingBreakdown}
          reviews={reviews}
        />

        {/* Information Table */}
        <AppInfo app={app} />

        {/* In-App Purchases */}
        <AppInAppPurchases purchases={app.inAppPurchases} />

        {/* App Privacy */}
        <AppPrivacy app={app} />

        {/* Developer Other Apps */}
        <AppMoreByDeveloper developer={app.developer} apps={otherApps} />

        {/* Similar Board & Card Game Smart Recommendation System */}
        <AppRecommendations
          currentApp={app}
          allApps={allApps}
          similarApps={similarApps}
        />
      </div>
    </div>
  );
}

