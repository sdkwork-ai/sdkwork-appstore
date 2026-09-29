import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CategoryItem, Category } from './CategoryItem';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate('/search', { state: { filter: categoryName } });
  };

  return (
    <section className="pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-store-ink ">
          {t('discover.categories.browseTitle')}
        </h2>
        <button className="text-store-brand text-sm font-medium hover:underline cursor-pointer ">
          {t('discover.categories.seeAll')}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat, index) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            index={index}
            onClick={handleCategoryClick}
          />
        ))}
      </div>
    </section>
  );
}
