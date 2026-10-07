import type { ExpertItem, ExpertScenario } from '../types';

export interface IExpertsSDK {
  getExperts(category?: string, query?: string): Promise<ExpertItem[]>;
  getExpertById(id: string): Promise<ExpertItem | null>;
  getExpertScenarios(): Promise<ExpertScenario[]>;
  createCustomExpert(expertData: Partial<ExpertItem>): Promise<ExpertItem>;
}

export type ExpertsServicePort = IExpertsSDK;

let expertsPort: ExpertsServicePort = createUnconfiguredExpertsPort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureExpertsServicePort(port: ExpertsServicePort): void {
  expertsPort = port;
}

export const ExpertsService: IExpertsSDK = {
  getExperts: (category = '', query = '') => expertsPort.getExperts(category, query),
  getExpertById: (id) => expertsPort.getExpertById(id),
  getExpertScenarios: () => expertsPort.getExpertScenarios(),
  createCustomExpert: (expertData) => expertsPort.createCustomExpert(expertData),
};

function createUnconfiguredExpertsPort(): ExpertsServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store experts runtime is not configured.');
  };
  return {
    getExperts: async () => unavailable(),
    getExpertById: async () => unavailable(),
    getExpertScenarios: async () => unavailable(),
    createCustomExpert: async () => unavailable(),
  };
}

/**
 * Derive the featured scenario cards from the stored expert catalog: one card
 * per scenario category, counting its experts and featuring its three most
 * popular entries. Presentation styling (icon/color) stays a frontend concern;
 * everything shown as content comes from the backend rows.
 */
export function deriveExpertScenarios(experts: ExpertItem[]): ExpertScenario[] {
  const grouped = new Map<string, ExpertItem[]>();
  for (const expert of experts) {
    const bucket = grouped.get(expert.scenarioCategory);
    if (bucket) {
      bucket.push(expert);
    } else {
      grouped.set(expert.scenarioCategory, [expert]);
    }
  }
  return Array.from(grouped.entries())
    .map(([title, members]) => ({
      id: `scen-${title}`,
      title,
      icon: '',
      color: '',
      expertCount: members.length,
      featuredExperts: members
        .slice()
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 3)
        .map((expert) => ({ name: expert.name, nickname: expert.nickname })),
    }))
    .sort((a, b) => (b.expertCount ?? 0) - (a.expertCount ?? 0));
}
