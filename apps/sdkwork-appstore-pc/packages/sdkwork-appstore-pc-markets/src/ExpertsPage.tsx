import { useMemo, useState } from 'react';
import { expertItems } from '@sdkwork/appstore-pc-ai-hub';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { ExpertCard } from './components/experts/ExpertCard';
import { ALL_CATEGORY, ExpertsCategoryFilter } from './components/experts/ExpertsCategoryFilter';
import { ExpertsEmptyState } from './components/experts/ExpertsEmptyState';
import { ExpertsHeaderBanner } from './components/experts/ExpertsHeaderBanner';
import { ExpertsSearchBar } from './components/experts/ExpertsSearchBar';

export function ExpertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  const categories = useMemo(() => {
    const tags = new Set<string>();
    expertItems.forEach((expert) => {
      if (expert.filterTag) {
        tags.add(expert.filterTag);
      }
    });
    return [ALL_CATEGORY, ...Array.from(tags)];
  }, []);

  const filteredExperts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return expertItems.filter((expert) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY || expert.filterTag === selectedCategory;
      if (!matchesCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        expert.name.toLocaleLowerCase().includes(query) ||
        expert.nickname.toLocaleLowerCase().includes(query) ||
        expert.description.toLocaleLowerCase().includes(query) ||
        expert.tags.some((tag) => tag.toLocaleLowerCase().includes(query))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Header Banner Subcomponent */}
      <ExpertsHeaderBanner />

      {/* Search and Lab Entry Bar Subcomponent */}
      <ExpertsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Horizontal Filter Subcomponent */}
      <ExpertsCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Expert Grid — container-query driven, up to 4 columns on wide screens */}
      <CardGrid>
        {filteredExperts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
          />
        ))}
      </CardGrid>

      {filteredExperts.length === 0 && <ExpertsEmptyState />}
    </div>
  );
}

export default ExpertsPage;
