import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../types';
import { SkillCard } from '../components/skills/SkillCard';
import { SkillFilter } from '../components/skills/SkillFilter';
import { SkillDetailModal } from '../components/skills/SkillDetailModal';
import { SkillsHeaderBanner } from '../components/skills/SkillsHeaderBanner';
import { PublishSkillModal } from '../components/skills/PublishSkillModal';
import { SkillsEmptyState } from '../components/skills/SkillsEmptyState';
import { SkillsService } from '../services/api';

export function SkillsPage() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = [
    t('skills.categories.all'),
    t('skills.categories.dataScience'),
    t('skills.categories.frontendDesign'),
    t('skills.categories.architecture'),
    t('skills.categories.codeRefactor'),
    t('skills.categories.nlp')
  ];

  const loadSkills = async () => {
    try {
      const data = await SkillsService.getSkills(selectedCategory, searchQuery);
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [selectedCategory, searchQuery]);

  const handleToggleInstall = async (id: string) => {
    setActionError(null);
    try {
      await SkillsService.toggleInstallSkill(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Skill action failed.');
      return;
    }
    setSkills((prev) =>
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
      setSkills((prev) => [created, ...prev]);
      setIsPublishOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Skill publishing failed.');
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 animate-fade-in">
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
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer h-10"
        >
          <Plus className="w-4 h-4" />
          <span>{t('skills.header.createBtn')}</span>
        </button>
      </div>
      {actionError && (
        <p role="alert" className="text-xs text-amber-700 dark:text-amber-300">
          {actionError}
        </p>
      )}

      {/* Skill Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">{t('skills.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggleInstall={handleToggleInstall}
              onSelect={setSelectedSkill}
            />
          ))}
        </div>
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
        categories={categories}
      />
    </div>
  );
}

export default SkillsPage;
