import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '@sdkwork/appstore-pc-core';
import { CardGrid } from '@sdkwork/appstore-pc-commons';
import { SkillCard } from './components/skills/SkillCard';
import { SkillFilter } from './components/skills/SkillFilter';
import { SkillDetailModal } from './components/skills/SkillDetailModal';
import { PublishSkillModal } from './components/skills/PublishSkillModal';
import { SkillsEmptyState } from './components/skills/SkillsEmptyState';
import { SkillsService } from '@sdkwork/appstore-pc-core';
import type { SkillCategoryOption } from '@sdkwork/appstore-pc-core';
import { ALL_CATEGORY, type CategoryOption } from './components/marketCategories';

/** Props for the skills catalog page. */
export interface SkillsPageProps {
  /**
   * Controlled catalog text filter. The surrounding chrome owns the search
   * field (the store header's global search, or an embedding host's toolbar)
   * and passes its query here; the page renders no search input of its own.
   * Unset filters by the empty string, i.e. the full catalog.
   */
  searchQuery?: string;
}

export function SkillsPage({ searchQuery }: SkillsPageProps = {}) {
  const { t } = useTranslation();
  // The catalog is loaded once and filtered locally. The category chips come
  // from the Skills category registry (the owning module), not from the codes
  // present in this page: a registry category with nothing filed under it is
  // still a real filter, and retired categories must not appear. When the
  // registry is unavailable the chips fall back to the codes the catalog
  // actually carries, so the page never loses its filter row.
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [registryCategories, setRegistryCategories] = useState<SkillCategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      SkillsService.getSkills(),
      // The taxonomy is a presentation enhancement: a failed registry read must
      // not hide the catalog behind an error banner.
      SkillsService.getSkillCategories().catch(() => [] as SkillCategoryOption[]),
    ])
      .then(([skills, categories]) => {
        if (!cancelled) {
          setAllSkills(skills);
          setRegistryCategories(categories);
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
    const all = { value: ALL_CATEGORY, label: t('skills.categories.all') };
    if (registryCategories.length > 0) {
      return [
        all,
        ...registryCategories.map((category) => ({
          value: category.code,
          label: category.name,
        })),
      ];
    }
    const values = new Set<string>();
    allSkills.forEach((skill) => {
      if (skill.category) {
        values.add(skill.category);
      }
    });
    return [
      all,
      ...[...values]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ value, label: value })),
    ];
  }, [allSkills, registryCategories, t]);

  const skills = useMemo(() => {
    const query = (searchQuery ?? '').trim().toLocaleLowerCase();
    return allSkills.filter((skill) => {
      if (selectedCategory !== ALL_CATEGORY) {
        const codes = skill.categoryCodes ?? [skill.category];
        if (!codes.includes(selectedCategory)) {
          return false;
        }
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
      {/* Category Filter & Create Bar — the create action rides the top filter
          row; text search belongs to the surrounding chrome. */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <SkillFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
        <button
          onClick={() => setIsPublishOpen(true)}
          className="px-4 py-2 bg-store-brand hover:bg-store-brand-hover text-white rounded-store-control text-xs font-medium transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer h-10"
        >
          <Plus className="w-4 h-4" />
          <span>{t('skills.header.createBtn')}</span>
        </button>
      </div>
      {actionError && (
        <p role="alert" className="text-xs text-store-danger ">
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
