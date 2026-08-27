import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../services/api';
import { AppItem } from '../types';
import {
  SearchHeader,
  SearchInput,
  SearchFilters,
  TrendingSearches,
  SearchResults,
  SearchHistory,
} from '../components/search';

const SEARCH_FILTER_KEYS = {
  all: 'all',
  apps: 'apps',
  games: 'games',
  productivity: 'productivity',
  miniGames: 'miniGames',
  utilities: 'utilities',
  ai: 'ai',
} as const;

export default function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || SEARCH_FILTER_KEYS.all;

  const filterCategories = [
    { key: SEARCH_FILTER_KEYS.all, label: t('search.filters.allTypes') },
    { key: SEARCH_FILTER_KEYS.apps, label: t('search.filters.apps') },
    { key: SEARCH_FILTER_KEYS.games, label: t('search.filters.games') },
    { key: SEARCH_FILTER_KEYS.productivity, label: t('search.filters.productivity') },
    { key: SEARCH_FILTER_KEYS.miniGames, label: t('search.filters.miniGames') },
    { key: SEARCH_FILTER_KEYS.utilities, label: t('search.filters.utilities') },
    { key: SEARCH_FILTER_KEYS.ai, label: t('search.filters.ai') },
  ];

  const [query, setQuery] = useState(urlQuery);
  const [activeFilter, setActiveFilter] = useState(urlCategory);
  const activeFilterLabel =
    filterCategories.find((item) => item.key === activeFilter)?.label ?? activeFilter;
  const [results, setResults] = useState<AppItem[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlQuery) setQuery(urlQuery);
    if (urlCategory) setActiveFilter(urlCategory);
  }, [urlQuery, urlCategory]);

  useEffect(() => {
    async function loadTrending() {
      try {
        const list = await AppStoreService.getTrendingSearches();
        setTrending(list);
      } catch (err) {
        console.error("Failed to load trending searches", err);
      }
    }
    loadTrending();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const items = await AppStoreService.getSearchHistory();
        if (!cancelled) {
          setHistory(items);
        }
      } catch (err) {
        // Anonymous sessions have no search history; keep the section hidden.
        if (!cancelled) {
          setHistory([]);
        }
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      try {
        const searchResults = await AppStoreService.searchApps(query, activeFilter);
        setResults(searchResults);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim() || activeFilter !== SEARCH_FILTER_KEYS.all) {
      const timer = setTimeout(doSearch, 200);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, activeFilter]);

  const recordSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }
    AppStoreService.saveSearchTerm(trimmed).catch(() => {
      // ignore: history persistence is best-effort
    });
    setHistory((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 20));
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilter(SEARCH_FILTER_KEYS.all);
    setResults([]);
  };

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      await AppStoreService.clearSearchHistory();
    } catch (err) {
      console.error("Failed to clear search history", err);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full transition-colors duration-200 select-none">
      <SearchHeader />

      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={handleClear}
        loading={loading}
        onSubmit={() => recordSearch(query)}
      />

      <SearchFilters
        filters={filterCategories}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {query.trim() || activeFilter !== SEARCH_FILTER_KEYS.all ? (
        <SearchResults query={query || activeFilterLabel} results={results} loading={loading} />
      ) : (
        <>
          <SearchHistory
            items={history}
            onSelect={(item) => {
              setQuery(item);
              recordSearch(item);
            }}
            onClear={handleClearHistory}
          />
          <TrendingSearches
            trending={trending}
            onSelect={(item) => {
              setQuery(item);
              recordSearch(item);
            }}
          />
        </>
      )}
    </div>
  );
}
