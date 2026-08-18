import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { Sparkles, Club, ChevronRight } from 'lucide-react';
import { AppRecommendationCard } from './AppRecommendationCard';

interface AppRecommendationsProps {
  currentApp: AppItem;
  allApps: AppItem[];
  similarApps?: AppItem[];
}

export function AppRecommendations({ currentApp, allApps, similarApps = [] }: AppRecommendationsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 判断是否为棋牌类游戏
  const isBoardGame =
    currentApp.category === '棋牌游戏' ||
    ['斗地主', '象棋', '麻将', '五子棋', '军旗', '掼蛋', '飞行棋', '棋', '牌'].some(kw =>
      currentApp.name.includes(kw) || currentApp.description.includes(kw)
    );

  // 算法：获取棋牌游戏子类型 (Card / Chess / Tile)
  const getBoardGameSubtype = (app: AppItem) => {
    const text = (app.name + app.description).toLowerCase();
    if (text.includes('象棋') || text.includes('五子棋') || text.includes('军旗') || text.includes('围棋')) {
      return 'chess'; // 棋艺对决
    }
    if (text.includes('斗地主') || text.includes('掼蛋') || text.includes('扑克') || text.includes('打牌')) {
      return 'poker'; // 扑克打牌
    }
    if (text.includes('麻将') || text.includes('雀神')) {
      return 'mahjong'; // 国粹麻将
    }
    return 'board_other';
  };

  const currentSubtype = getBoardGameSubtype(currentApp);

  // 相似度匹配算法
  const calculateSimilarity = (otherApp: AppItem) => {
    if (otherApp.id === currentApp.id) return -1;

    let score = 0;
    const otherSubtype = getBoardGameSubtype(otherApp);

    if (isBoardGame) {
      const otherIsBoard =
        otherApp.category === '棋牌游戏' ||
        ['斗地主', '象棋', '麻将', '五子棋', '军旗', '掼蛋', '飞行棋', '棋', '牌'].some(kw =>
          otherApp.name.includes(kw)
        );

      if (otherIsBoard) {
        score += 50; // 同为棋牌大类
        if (otherSubtype === currentSubtype) {
          score += 35; // 同种棋牌细分类型（如都是象棋类或都是扑克类）
        }
      } else if (otherApp.category.includes('游戏')) {
        score += 15; // 通用游戏
      }
    } else {
      if (otherApp.category === currentApp.category) {
        score += 45;
      }
    }

    if (otherApp.developer === currentApp.developer) {
      score += 10;
    }

    score += otherApp.rating * 2;
    return score;
  };

  // 排序获取推荐列表：优先采用服务端 similar 推荐，空/失败时回退客户端相似度算法
  const recommendedApps = similarApps.length > 0
    ? similarApps.slice(0, 6).map((app) => ({ app, score: calculateSimilarity(app) }))
    : allApps
        .map(app => ({
          app,
          score: calculateSimilarity(app)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

  if (recommendedApps.length === 0) return null;

  return (
    <div className="pt-8 border-t border-gray-200 dark:border-[#2C2C2E] mt-10 space-y-4">
      {/* 推荐组件 Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl text-white ${isBoardGame ? 'bg-amber-500' : 'bg-blue-600'}`}>
            {isBoardGame ? <Club className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[#1C1C1E] dark:text-[#F5F5F5] flex items-center gap-2">
              <span>{isBoardGame ? t('appDetail.recommendations.boardGameTitle') : t('appDetail.recommendations.similarTitle')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                {t('appDetail.recommendations.badge')}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isBoardGame
                ? t('appDetail.recommendations.boardGameSubtitle', { name: currentApp.name })
                : t('appDetail.recommendations.similarSubtitle', { name: currentApp.name })}
            </p>
          </div>
        </div>

        {isBoardGame && (
          <button
            onClick={() => navigate('/games')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{t('appDetail.recommendations.hall')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 推荐游戏 Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
        {recommendedApps.map(({ app: itemApp, score }) => (
          <AppRecommendationCard
            key={itemApp.id}
            app={itemApp}
            score={score}
          />
        ))}
      </div>
    </div>
  );
}


