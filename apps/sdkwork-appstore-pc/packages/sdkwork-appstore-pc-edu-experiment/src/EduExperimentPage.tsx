import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { AppStoreService, AppItem } from '@sdkwork/appstore-pc-core';
import {
  EDU_EXPERIMENT_CATEGORY_NAMES,
  EDU_STAGE_GROUPS,
  EDU_SUBJECTS,
  EduExperimentProfile,
  LoadingSpinner,
  resolveEduExperimentProfile,
  type EduStageGroupId,
  type EduStageId,
  type EduSubjectId,
} from '@sdkwork/appstore-pc-commons';
import { EduExperimentSection } from './components/EduExperimentSection';

/** Stages behind the K12 filter group; the other groups map to a single stage. */
const K12_GROUP_STAGES: EduStageId[] = ['k12-primary', 'k12-junior', 'k12-senior'];

function groupStages(group: EduStageGroupId): EduStageId[] {
  return group === 'k12' ? K12_GROUP_STAGES : [group];
}

/** Filter chip row shared by the stage-group and subject selectors. */
function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-store-control text-xs font-medium transition-all border cursor-pointer ${
        active
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
          : 'bg-store-subtle text-store-ink-soft border-store-line hover:border-emerald-500/40'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 独立模块「教育实验应用」(REQ-2026-0002): education-experiment evaluation
 * apps, filterable by stage (K12 primary/junior/senior, university,
 * professional) and subject. Listing summaries carry no category, so the page
 * loads its window from the 教育实验应用 catalog category and stamps it on
 * every row.
 */
export default function EduExperimentPage() {
  const { t } = useTranslation();
  const [evalApps, setEvalApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageGroup, setStageGroup] = useState<EduStageGroupId | 'all'>('all');
  const [k12Stage, setK12Stage] = useState<EduStageId | 'all'>('all');
  const [subject, setSubject] = useState<EduSubjectId | 'all'>('all');

  useEffect(() => {
    async function loadEvalApps() {
      try {
        const categories = await AppStoreService.getCategories().catch(() => []);
        const idByName = new Map(categories.map((category) => [category.name, category.id]));
        const categoryId = EDU_EXPERIMENT_CATEGORY_NAMES.map((name) => idByName.get(name)).find(Boolean);
        if (!categoryId) {
          setEvalApps([]);
          return;
        }
        const page = await AppStoreService.listAppsPage({ categoryId, limit: 50 });
        setEvalApps(page.items.map((app) => ({ ...app, category: '教育实验应用' })));
      } catch (err) {
        console.error('Failed to load education experiment apps', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvalApps();
  }, []);

  const filteredApps = useMemo(() => {
    return evalApps.filter((app) => {
      const profile = resolveEduExperimentProfile(app) as EduExperimentProfile | undefined;
      if (!profile) return false;
      if (stageGroup !== 'all') {
        const stages = groupStages(stageGroup);
        if (stageGroup === 'k12' && k12Stage !== 'all') {
          if (!profile.stages.includes(k12Stage)) return false;
        } else if (!profile.stages.some((stage) => stages.includes(stage))) {
          return false;
        }
      }
      if (subject !== 'all' && !profile.subjects.includes(subject)) return false;
      return true;
    });
  }, [evalApps, stageGroup, k12Stage, subject]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 md:p-6 space-y-5 w-full max-w-full select-none transition-colors duration-200">
      {/* Sub-component: Module hero banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden">
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t('eduExperiment.header.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('eduExperiment.header.title')}
          </h1>
          <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed">
            {t('eduExperiment.header.subtitle')}
          </p>
        </div>
        <div className="z-10 p-4 rounded-store-card bg-emerald-600/10 border border-emerald-500/20 text-emerald-600">
          <GraduationCap className="w-10 h-10" />
        </div>
      </div>

      {/* Sub-component: Stage group filter, with the K12 sub-stage row on demand */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('eduExperiment.filters.stageLabel')}
          </span>
          <FilterChip
            active={stageGroup === 'all'}
            label={t('eduExperiment.filters.all')}
            onClick={() => {
              setStageGroup('all');
              setK12Stage('all');
            }}
          />
          {EDU_STAGE_GROUPS.map((group) => (
            <FilterChip
              key={group}
              active={stageGroup === group}
              label={t(`eduExperiment.stageGroups.${group}`)}
              onClick={() => setStageGroup(group)}
            />
          ))}
        </div>
        {stageGroup === 'k12' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-store-ink-faint mr-1">
              {t('eduExperiment.filters.k12Label')}
            </span>
            <FilterChip
              active={k12Stage === 'all'}
              label={t('eduExperiment.filters.allStages')}
              onClick={() => setK12Stage('all')}
            />
            {K12_GROUP_STAGES.map((stage) => (
              <FilterChip
                key={stage}
                active={k12Stage === stage}
                label={t(`eduExperiment.stages.${stage}`)}
                onClick={() => setK12Stage(stage)}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-store-ink-faint mr-1">
            {t('eduExperiment.filters.subjectLabel')}
          </span>
          <FilterChip
            active={subject === 'all'}
            label={t('eduExperiment.filters.allSubjects')}
            onClick={() => setSubject('all')}
          />
          {EDU_SUBJECTS.map((subjectId) => (
            <FilterChip
              key={subjectId}
              active={subject === subjectId}
              label={t(`eduExperiment.subjects.${subjectId}`)}
              onClick={() => setSubject(subjectId)}
            />
          ))}
        </div>
      </div>

      {/* Sub-component: Evaluation app grid */}
      <EduExperimentSection apps={filteredApps} />
    </div>
  );
}
