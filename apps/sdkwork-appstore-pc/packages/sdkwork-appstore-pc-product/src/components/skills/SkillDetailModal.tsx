import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { SkillModalHeader } from './SkillModalHeader';
import { SkillOverviewTab } from './SkillOverviewTab';
import { SkillSandboxTab } from './SkillSandboxTab';
import { SkillModalFooter } from './SkillModalFooter';
import { SkillModalNavTabs } from './SkillModalNavTabs';
import { SkillsService } from '../../services/api';

interface SkillDetailModalProps {
  skill: SkillItem | null;
  onClose: () => void;
  onToggleInstall: (id: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  onClose,
  onToggleInstall,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'info' | 'test'>('info');
  const [testInput, setTestInput] = useState('Extract and analyze key requirements and refactoring risks...');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ output: string; tokensUsed: number } | null>(null);

  if (!skill) return null;

  const handleRunSandbox = async () => {
    setRunning(true);
    try {
      const res = await SkillsService.runSkillSandbox(skill.id, testInput);
      setOutput({ output: res.agentOutput, tokensUsed: 180 });
    } catch {
      setOutput({ output: 'Execution error', tokensUsed: 0 });
    } finally {
      setRunning(false);
    }
  };

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="max-h-[85vh] flex flex-col">
        {/* Subcomponent: Modal Header */}
        <SkillModalHeader skill={skill} />

        {/* Subcomponent: Tab switch */}
        <SkillModalNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Scrollable Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
          {activeTab === 'info' ? (
            <SkillOverviewTab skill={skill} />
          ) : (
            <SkillSandboxTab
              testInput={testInput}
              running={running}
              output={output}
              onTestInputChange={setTestInput}
              onRunSandbox={handleRunSandbox}
            />
          )}
        </div>

        {/* Subcomponent: Footer Actions */}
        <SkillModalFooter
          skill={skill}
          onClose={onClose}
          onToggleInstall={onToggleInstall}
        />
      </div>
    </ModalShell>
  );
};




