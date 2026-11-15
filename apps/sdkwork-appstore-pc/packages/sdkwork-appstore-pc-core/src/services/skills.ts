import type { SkillItem } from '../types';

export interface SkillSandboxResult {
  agentOutput: string;
  compiledPrompt: string;
  triggerMatched: string[];
}

/**
 * One category of the Skills marketplace taxonomy.
 *
 * The catalog's chips come from the Skills category registry (the owning
 * module), never from the codes present in the current catalog page: a
 * registry category with no skill filed under it is still a real filter, and
 * retired categories must not appear.
 */
export interface SkillCategoryOption {
  /** Category code the marketplace records are filed under. */
  code: string;
  /** Operator-facing category name. */
  name: string;
  /** Registry ordering weight; smaller sorts first. */
  sortWeight: number;
}

export interface ISkillsSDK {
  getSkills(category?: string, query?: string): Promise<SkillItem[]>;
  getSkillCategories(): Promise<SkillCategoryOption[]>;
  publishSkill(skillData: Partial<SkillItem>): Promise<SkillItem>;
  runSkillSandbox(skillId: string, promptInput: string): Promise<SkillSandboxResult>;
  toggleInstallSkill(id: string): Promise<boolean>;
}

export type SkillsServicePort = ISkillsSDK;

let skillsPort: SkillsServicePort = createUnconfiguredSkillsPort();

export function configureSkillsServicePort(port: SkillsServicePort): void {
  skillsPort = port;
}

export const SkillsService: ISkillsSDK = {
  getSkills: (category = 'All', query = '') => skillsPort.getSkills(category, query),
  getSkillCategories: () => skillsPort.getSkillCategories(),
  publishSkill: (skillData) => skillsPort.publishSkill(skillData),
  runSkillSandbox: (skillId, promptInput) =>
    skillsPort.runSkillSandbox(skillId, promptInput),
  toggleInstallSkill: (id) => skillsPort.toggleInstallSkill(id),
};

function createUnconfiguredSkillsPort(): SkillsServicePort {
  const unavailable = (): never => {
    throw new Error('The Skills app SDK runtime is not configured.');
  };
  return {
    getSkills: async () => unavailable(),
    getSkillCategories: async () => unavailable(),
    publishSkill: async () => unavailable(),
    runSkillSandbox: async () => unavailable(),
    toggleInstallSkill: async () => unavailable(),
  };
}
