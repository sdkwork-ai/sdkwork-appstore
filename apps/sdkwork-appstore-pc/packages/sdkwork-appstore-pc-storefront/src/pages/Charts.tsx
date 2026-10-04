import { useState, useEffect } from 'react';
import { AppStoreService } from '../services/api';
import { AppItem } from '../types';
import { ChartsHeader, ChartsList } from '../components/charts';

export default function Charts() {
  const [activeTab, setActiveTab] = useState<'free' | 'paid'>('free');
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const data = await AppStoreService.getTopCharts(activeTab);
        setApps(data);
      } catch (err) {
        console.error("Failed to fetch charts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, [activeTab]);

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200">
      <ChartsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <ChartsList apps={apps} loading={loading} />
    </div>
  );
}
