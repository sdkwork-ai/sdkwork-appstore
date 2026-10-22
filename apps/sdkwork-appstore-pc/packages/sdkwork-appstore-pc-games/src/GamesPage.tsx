import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '@sdkwork/appstore-pc-core';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { LoadingSpinner } from '@sdkwork/appstore-pc-commons';
import { GamesHeaderBanner, GameTabType } from './components/GamesHeaderBanner';
import { BoardGamesHallSection } from './components/BoardGamesHallSection';
import { PcGamesSection } from './components/PcGamesSection';
import { MiniGamesSection } from './components/MiniGamesSection';
import { HandheldGamesSection } from './components/HandheldGamesSection';

export default function GamesPage() {
  const { t } = useTranslation();
  const [allApps, setAllApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GameTabType>('all');
  const [boardSubFilter, setBoardSubFilter] = useState<string>('全部');

  useEffect(() => {
    async function loadGames() {
      try {
        // Listing summaries carry no category, so each section is loaded from
        // its own catalog category and stamped with the category name the
        // section filters on.
        const categories = await AppStoreService.getCategories().catch(() => []);
        const idByName = new Map(categories.map((category) => [category.name, category.id]));
        const collected: AppItem[] = [];
        const seenIds = new Set<string>();
        for (const categoryName of ['棋牌游戏', '微信小游戏', '精品手游', '游戏']) {
          const categoryId = idByName.get(categoryName);
          if (!categoryId) {
            continue;
          }
          try {
            const page = await AppStoreService.listAppsPage({ categoryId, limit: 50 });
            for (const app of page.items) {
              if (seenIds.has(app.id)) {
                continue;
              }
              seenIds.add(app.id);
              collected.push({ ...app, category: categoryName });
            }
          } catch (err) {
            console.error(`Failed to load games for category ${categoryName}`, err);
          }
        }
        setAllApps(collected);
      } catch (err) {
        console.error('Failed to load games page data', err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const boardGames = allApps.filter(
    a => a.category === '棋牌游戏' || a.name.includes('棋') || a.name.includes('麻将') || a.name.includes('斗地主') || a.name.includes('掼蛋')
  );
  const miniGames = allApps.filter(a => a.category === '微信小游戏');
  const handheldGames = allApps.filter(a => a.category === '精品手游');
  const otherGames = allApps.filter(
    a => a.category.includes('游戏') && a.category !== '棋牌游戏' && !a.category.includes('微信') && !a.category.includes('手游')
  );

  const filteredBoardGames = boardGames.filter(game => {
    if (boardSubFilter === '全部' || boardSubFilter === 'All') return true;
    return game.name.includes(boardSubFilter);
  });

  const boardQuickNav = [
    { name: t('games.quickNav.all', '全部'), filter: '全部' },
    { name: t('games.quickNav.landlord', '斗地主'), filter: '斗地主' },
    { name: t('games.quickNav.xiangqi', '中国象棋'), filter: '中国象棋' },
    { name: t('games.quickNav.chess', '国际象棋'), filter: '国际象棋' },
    { name: t('games.quickNav.mahjong', '麻将'), filter: '麻将' },
    { name: t('games.quickNav.gobang', '五子棋'), filter: '五子棋' },
    { name: t('games.quickNav.junqi', '军旗'), filter: '军旗' },
    { name: t('games.quickNav.guandan', '掼蛋'), filter: '掼蛋' }
  ];

  return (
    <div className="p-5 md:p-6 space-y-7 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Games Hero Header & Action Tabs */}
      <GamesHeaderBanner
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Sub-component: Board & Card Games Section */}
      {(activeTab === 'all' || activeTab === 'board') && boardGames.length > 0 && (
        <BoardGamesHallSection
          boardGames={boardGames}
          filteredBoardGames={filteredBoardGames}
          boardQuickNav={boardQuickNav}
          boardSubFilter={boardSubFilter}
          onSelectSubFilter={setBoardSubFilter}
        />
      )}

      {/* Sub-component: WeChat Mini Games */}
      {(activeTab === 'all' || activeTab === 'mini') && (
        <MiniGamesSection games={miniGames} />
      )}

      {/* Sub-component: Handheld Games */}
      {(activeTab === 'all' || activeTab === 'handheld') && (
        <HandheldGamesSection games={handheldGames} />
      )}

      {/* Sub-component: Other PC Games */}
      {activeTab === 'all' && otherGames.length > 0 && (
        <PcGamesSection games={otherGames} />
      )}
    </div>
  );
}
