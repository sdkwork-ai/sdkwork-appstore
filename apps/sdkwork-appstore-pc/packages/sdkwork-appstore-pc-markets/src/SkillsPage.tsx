import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { SkillCard } from './components/skills/SkillCard';
import { SkillFilter } from './components/skills/SkillFilter';
import { SkillDetailModal } from './components/skills/SkillDetailModal';
import { SkillsHeaderBanner } from './components/skills/SkillsHeaderBanner';
import { PublishSkillModal } from './components/skills/PublishSkillModal';
import { SkillsEmptyState } from './components/skills/SkillsEmptyState';
import { SkillsService } from '@sdkwork/appstore-pc-core';
import { ALL_CATEGORY, type CategoryOption } from './components/marketCategories';

export function SkillsPage() {
  const { t } = useTranslation();
  // The catalog is loaded once and filtered locally: the category chips are
  // derived from the full catalog, so selecting one never hides the others and
  // every chip names a category the catalog actually contains.
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    SkillsService.getSkills()
      .then((data) => {
        if (!cancelled) {
          setAllSkills(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load skills', err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The publish form keeps its own taxonomy; only the catalog filter is derived.
  const publishCategories = [
    t('skills.categories.all'),
    t('skills.categories.dataScience'),
    t('skills.categories.frontendDesign'),
    t('skills.categories.architecture'),
    t('skills.categories.codeRefactor'),
    t('skills.categories.nlp')
  ];

  const categories = useMemo<CategoryOption[]>(() => {
    const values = new Set<string>();
    allSkills.forEach((skill) => {
      if (skill.category) {
        values.add(skill.category);
      }
    });
    return [
      { value: ALL_CATEGORY, label: t('skills.categories.all') },
      ...[...values]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ value, label: value })),
    ];
  }, [allSkills, t]);

  const skills = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return allSkills.filter((skill) => {
      if (selectedCategory !== ALL_CATEGORY && skill.category !== selectedCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [skill.name, skill.author, skill.description, skill.category, ...skill.triggers]
        .some((text) => text.toLocaleLowerCase().includes(query));
    });
  }, [allSkills, selectedCategory, searchQuery]);

  const handleToggleInstall = async (id: string) => {
    setActionError(null);
    try {
      await SkillsService.toggleInstallSkill(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Skill action failed.');
      return;
    }
    setAllSkills((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.isInstalled;
          return {
            ...s,
            isInstalled: nextState,
            activeCount: nextState ? s.activeCount + 1 : Math.max(0, s.activeCount - 1),
          };
        }
        return s;
      })
    );
    if (selectedSkill && selectedSkill.id === id) {
      setSelectedSkill((prev) =>
        prev
          ? {
              ...prev,
              isInstalled: !prev.isInstalled,
              activeCount: !prev.isInstalled ? prev.activeCount + 1 : Math.max(0, prev.activeCount - 1),
            }
          : null
      );
    }
  };

  const handlePublishSubmit = async (skillData: {
    name: string;
    category: string;
    triggers: string[];
    promptTemplate: string;
    skillMarkdown: string;
  }) => {
    setActionError(null);
    try {
      const created = await SkillsService.publishSkill(skillData);
      setAllSkills((prev) => [created, ...prev]);
      setIsPublishOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Skill publishing failed.');
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in @container">
      {/* Header Banner Subcomponent */}
      <SkillsHeaderBanner />

      {/* Filter & Publish Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <SkillFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
        <button
          onClick={() => setIsPublishOpen(true)}
          className="px-4 py-2 bg-store-warning hover:bg-store-warning text-white rounded-store-control text-xs font-medium transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer h-10"
        >
          <Plus className="w-4 h-4" />
          <span>{t('skills.header.createBtn')}</span>
        </button>
      </div>
      {actionError && (
        <p role="alert" className="text-xs text-store-warning ">
          {actionError}
        </p>
      )}

      {/* Skill Grid — container-query driven, up to 4 columns on wide screens */}
      {loading ? (
        <div className="py-20 text-center text-xs text-store-ink-faint">{t('skills.loading')}</div>
      ) : (
        <CardGrid>
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggleInstall={handleToggleInstall}
              onSelect={setSelectedSkill}
            />
          ))}
        </CardGrid>
      )}

      {skills.length === 0 && !loading && <SkillsEmptyState />}

      {/* Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onToggleInstall={handleToggleInstall}
      />

      {/* Publish Skill Modal Subcomponent */}
      <PublishSkillModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onSubmit={handlePublishSubmit}
        categories={publishCategories}
      />
    </div>
  );
}

export default SkillsPage;
