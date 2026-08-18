import React, { useState } from 'react';
import { Plug, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalShell } from '../common/ModalShell';
import { RegisterPluginFormFields } from './RegisterPluginFormFields';

interface RegisterPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    apiSchemaType: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST';
    description: string;
    capabilities: string[];
  }) => Promise<void>;
  categories: string[];
}

export const RegisterPluginModal: React.FC<RegisterPluginModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
}) => {
  const { t } = useTranslation();
  const [newPlugName, setNewPlugName] = useState('');
  const [newPlugCategory, setNewPlugCategory] = useState('Code & Dev');
  const [newPlugSchemaType, setNewPlugSchemaType] = useState<'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST'>('OpenAPI');
  const [newPlugDesc, setNewPlugDesc] = useState('');
  const [newPlugCapabilities, setNewPlugCapabilities] = useState('Code Execution, Result Parsing');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlugName.trim()) return;

    await onSubmit({
      name: newPlugName,
      category: newPlugCategory,
      apiSchemaType: newPlugSchemaType,
      description: newPlugDesc,
      capabilities: newPlugCapabilities.split(',').map((c) => c.trim()).filter(Boolean),
    });

    setNewPlugName('');
    setNewPlugDesc('');
    onClose();
  };

  const filteredCategories = categories.filter((c) => c !== t('plugins.categories.all'));

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#282c38]">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Plug className="w-4 h-4 text-indigo-500" />
          <span>{t('plugins.registerModal.title')}</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-component: Form Fields */}
      <RegisterPluginFormFields
        newPlugName={newPlugName}
        newPlugCategory={newPlugCategory}
        newPlugSchemaType={newPlugSchemaType}
        newPlugDesc={newPlugDesc}
        newPlugCapabilities={newPlugCapabilities}
        filteredCategories={filteredCategories}
        onNameChange={setNewPlugName}
        onCategoryChange={setNewPlugCategory}
        onSchemaTypeChange={setNewPlugSchemaType}
        onDescChange={setNewPlugDesc}
        onCapabilitiesChange={setNewPlugCapabilities}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  );
};

