import React from 'react';
import { BookOpenCheck, GraduationCap, HeartPulse, MapPinned, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import {
  resolveAppSpecs,
  resolveEduExperimentProfile,
  resolveHealthcareProfile,
  resolveTourismProfile,
  type EduExperimentProfile,
  type HealthcareProfile,
  type TourismProfile,
} from '@sdkwork/appstore-pc-commons';
import { AppSpecEvaluation } from './AppSpecEvaluation';

/**
 * Vertical evaluation dispatcher of the detail page (REQ-2026-0002/0003/0004):
 * resolves the listing against the three vertical modules below the AI 模型测评
 * category and renders the matching coverage block plus the shared per-spec
 * leaderboard. Listings without a vertical profile fall back to the legacy AI
 * 模型测评 panel; non-evaluation listings render nothing.
 */

/** Stage × subject coverage matrix of an education-experiment listing. */
const EduCoverageMatrix: React.FC<{ appName: string; profile: EduExperimentProfile }> = ({ appName, profile }) => {
  const { t } = useTranslation();
  const cellOf = (stage: string, subject: string) =>
    profile.cells.find((cell) => cell.stage === stage && cell.subject === subject);

  return (
    <div className="mb-6 p-5 rounded-store-card bg-emerald-500/5 border border-emerald-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpenCheck className="w-4 h-4 text-emerald-600" />
        <div>
          <h4 className="text-sm font-bold text-store-ink">{t('eduExperiment.panel.title')}</h4>
          <p className="text-[11px] text-store-ink-faint">{t('eduExperiment.panel.subtitle', { name: appName })}</p>
        </div>
      </div>
      {profile.cells.length === 0 ? (
        <p className="text-xs text-store-ink-faint">{t('eduExperiment.panel.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr>
                <th className="text-left font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line w-20">
                  {t('eduExperiment.filters.stageLabel')}
                </th>
                {profile.subjects.map((subject) => (
                  <th
                    key={subject}
                    className="text-center font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line whitespace-nowrap"
                  >
                    {t(`eduExperiment.subjects.${subject}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profile.stages.map((stage) => (
                <tr key={stage}>
                  <td className="px-2 py-1.5 font-medium text-store-ink-soft whitespace-nowrap border-b border-store-line/60">
                    {t(`eduExperiment.stages.${stage}`)}
                  </td>
                  {profile.subjects.map((subject) => {
                    const cell = cellOf(stage, subject);
                    return (
                      <td key={subject} className="px-2 py-1.5 text-center border-b border-store-line/60">
                        {cell ? (
                          <span className="text-store-ink-soft">
                            {cell.tasks}
                            <span className="text-store-ink-faint"> · </span>
                            <span className="font-bold text-emerald-600">{cell.score.toFixed(1)}</span>
                          </span>
                        ) : (
                          <span className="text-store-ink-faint">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-store-ink-faint">
            {t('eduExperiment.panel.colTask')} / {t('eduExperiment.panel.colScore')}
          </p>
        </div>
      )}
    </div>
  );
};

/** Attraction coverage panel of a tourism listing, with the sampling timestamp. */
const TourismCoveragePanel: React.FC<{ appName: string; profile: TourismProfile }> = ({ appName, profile }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6 p-5 rounded-store-card bg-sky-500/5 border border-sky-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <MapPinned className="w-4 h-4 text-sky-600" />
        <div>
          <h4 className="text-sm font-bold text-store-ink">{t('tourism.panel.title')}</h4>
          <p className="text-[11px] text-store-ink-faint">{t('tourism.panel.subtitle', { name: appName })}</p>
        </div>
      </div>
      {profile.attractions.length === 0 ? (
        <p className="text-xs text-store-ink-faint">{t('tourism.panel.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr>
                <th className="text-left font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('tourism.panel.title')}
                </th>
                <th className="text-center font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('tourism.panel.colLevel')}
                </th>
                <th className="text-center font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('tourism.panel.colRegion')}
                </th>
                <th className="text-center font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('tourism.panel.colTheme')}
                </th>
                <th className="text-right font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('tourism.panel.colAccuracy')}
                </th>
              </tr>
            </thead>
            <tbody>
              {profile.attractions.map((attraction) => (
                <tr key={attraction.name}>
                  <td className="px-2 py-1.5 font-medium text-store-ink-soft border-b border-store-line/60">
                    {attraction.name}
                  </td>
                  <td className="px-2 py-1.5 text-center border-b border-store-line/60">
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-600 border border-amber-400/30">
                      {attraction.level}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center text-store-ink-soft border-b border-store-line/60">
                    {t(`tourism.regions.${attraction.region}`)}
                  </td>
                  <td className="px-2 py-1.5 text-center text-store-ink-soft border-b border-store-line/60">
                    {t(`tourism.themes.${attraction.theme}`)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-bold text-sky-600 border-b border-store-line/60">
                    {attraction.accuracy.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-store-ink-faint">{t('tourism.panel.updated', { time: profile.sampledAt })}</p>
    </div>
  );
};

/** Scenario coverage of a healthcare listing; safety is its own column. */
const HealthcareCoveragePanel: React.FC<{ appName: string; profile: HealthcareProfile }> = ({ appName, profile }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6 p-5 rounded-store-card bg-rose-500/5 border border-rose-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-4 h-4 text-rose-600" />
        <div>
          <h4 className="text-sm font-bold text-store-ink">{t('healthcare.panel.title')}</h4>
          <p className="text-[11px] text-store-ink-faint">{t('healthcare.panel.subtitle', { name: appName })}</p>
        </div>
      </div>
      {/* Non-diagnosis compliance notice: fixed copy, not dismissible. */}
      <div className="flex items-start gap-2 p-3 rounded-store-card bg-amber-400/10 border border-amber-400/30 text-amber-700 dark:text-amber-400">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">{t('healthcare.disclaimer.body')}</p>
      </div>
      {profile.scenarioScores.length === 0 ? (
        <p className="text-xs text-store-ink-faint">{t('healthcare.panel.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr>
                <th className="text-left font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('healthcare.filters.scenarioLabel')}
                </th>
                <th className="text-right font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('healthcare.panel.colTasks')}
                </th>
                <th className="text-right font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('healthcare.panel.colScore')}
                </th>
                <th className="text-right font-medium text-store-ink-faint px-2 py-1.5 border-b border-store-line">
                  {t('healthcare.panel.colSafety')}
                </th>
              </tr>
            </thead>
            <tbody>
              {profile.scenarioScores.map((row) => (
                <tr key={row.scenario}>
                  <td className="px-2 py-1.5 font-medium text-store-ink-soft border-b border-store-line/60">
                    {t(`healthcare.scenarios.${row.scenario}`)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-store-ink-soft border-b border-store-line/60">{row.tasks}</td>
                  <td className="px-2 py-1.5 text-right font-bold text-rose-600 border-b border-store-line/60">
                    {row.score.toFixed(1)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-bold text-emerald-600 border-b border-store-line/60">
                    {row.safety.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-store-ink-faint">{t('healthcare.panel.safetyNote')}</p>
        </div>
      )}
    </div>
  );
};

interface AppVerticalEvaluationProps {
  app: AppItem;
}

/** Resolve and render the vertical evaluation surface of one listing. */
export const AppVerticalEvaluation: React.FC<AppVerticalEvaluationProps> = ({ app }) => {
  const edu = resolveEduExperimentProfile(app);
  const tourism = resolveTourismProfile(app);
  const healthcare = resolveHealthcareProfile(app);
  const legacySpecs = resolveAppSpecs(app);

  if (edu) {
    return (
      <div className="flex-1 flex flex-col mb-10 pt-8 border-t border-store-line-soft">
        <EduCoverageMatrix appName={app.name} profile={edu} />
        <AppSpecEvaluation
          appId={app.id}
          appName={app.name}
          specs={edu.specs}
          titleKey="eduExperiment.specs.title"
          subtitleKey="eduExperiment.specs.subtitle"
        />
      </div>
    );
  }

  if (tourism) {
    return (
      <div className="flex-1 flex flex-col mb-10 pt-8 border-t border-store-line-soft">
        <TourismCoveragePanel appName={app.name} profile={tourism} />
        <AppSpecEvaluation
          appId={app.id}
          appName={app.name}
          specs={tourism.specs}
          titleKey="tourism.specs.title"
          subtitleKey="tourism.specs.subtitle"
        />
      </div>
    );
  }

  if (healthcare) {
    return (
      <div className="flex-1 flex flex-col mb-10 pt-8 border-t border-store-line-soft">
        <HealthcareCoveragePanel appName={app.name} profile={healthcare} />
        <AppSpecEvaluation
          appId={app.id}
          appName={app.name}
          specs={healthcare.specs}
          titleKey="healthcare.specs.title"
          subtitleKey="healthcare.specs.subtitle"
        />
      </div>
    );
  }

  if (legacySpecs && legacySpecs.length > 0) {
    return <AppSpecEvaluation appId={app.id} appName={app.name} specs={legacySpecs} />;
  }

  return null;
};
