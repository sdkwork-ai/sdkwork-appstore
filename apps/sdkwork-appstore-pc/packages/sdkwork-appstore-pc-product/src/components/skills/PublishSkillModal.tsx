import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalShell } from '../common/ModalShell';
import { PublishSkillFormFields } from './PublishSkillFormFields';

interface PublishSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    triggers: string[];
    promptTemplate: string;
    skillMarkdown: string;
  }) => Promise<void>;
  categories: string[];
}

export const PublishSkillModal: React.FC<PublishSkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
}) => {
  const { t } = useTranslation();
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Data Science');
  const [newSkillTriggers, setNewSkillTriggers] = useState('@custom-skill, analyze');
  const [newSkillPrompt, setNewSkillPrompt] = useState('You are an expert assistant. Please strictly analyze the following input...');
  const [newSkillMarkdown, setNewSkillMarkdown] = useState('# Custom Skill Guide\n\n1. Analyze input.\n2. Output summary.');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    await onSubmit({
      name: newSkillName,
      category: newSkillCategory,
      triggers: newSkillTriggers.split(',').map((t) => t.trim()).filter(Boolean),
      promptTemplate: newSkillPrompt,
      skillMarkdown: newSkillMarkdown,
    });

    setNewSkillName('');
    onClose();
  };

  const filteredCategories = categories.filter((c) => c !== t('skills.categories.all'));

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#282c38]">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{t('skills.modal.publishTitle')}</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-component: Form Fields */}
      <PublishSkillFormFields
        newSkillName={newSkillName}
        newSkillCategory={newSkillCategory}
        newSkillTriggers={newSkillTriggers}
        newSkillPrompt={newSkillPrompt}
        newSkillMarkdown={newSkillMarkdown}
        filteredCategories={filteredCategories}
        onNameChange={setNewSkillName}
        onCategoryChange={setNewSkillCategory}
        onTriggersChange={setNewSkillTriggers}
        onPromptChange={setNewSkillPrompt}
        onMarkdownChange={setNewSkillMarkdown}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  );
};

