import React, { useState } from 'react';
import { Server, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalShell } from '../common/ModalShell';
import { McpServerFormFields } from './McpServerFormFields';

interface AddMcpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    publisher: string;
    description: string;
    transportType: 'stdio' | 'sse' | 'http';
    commandOrUrl: string;
    toolsProvided: string[];
  }) => Promise<void>;
}

export const AddMcpServerModal: React.FC<AddMcpServerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [newTransport, setNewTransport] = useState<'stdio' | 'sse' | 'http'>('stdio');
  const [newCommand, setNewCommand] = useState('npx -y @modelcontextprotocol/server-postgres');
  const [newPublisher, setNewPublisher] = useState('DevStudio Team');
  const [newTools, setNewTools] = useState('query, execute_ddl');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await onSubmit({
      name: newName,
      publisher: newPublisher,
      description: newDesc || `${newName} MCP Service`,
      transportType: newTransport,
      commandOrUrl: newCommand,
      toolsProvided: newTools.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewName('');
    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#282c38]">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-500" />
          <span>{t('mcp.form.addTitle')}</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-component: Form Fields */}
      <McpServerFormFields
        newName={newName}
        newTransport={newTransport}
        newCommand={newCommand}
        newPublisher={newPublisher}
        newTools={newTools}
        newDesc={newDesc}
        onNameChange={setNewName}
        onTransportChange={setNewTransport}
        onCommandChange={setNewCommand}
        onPublisherChange={setNewPublisher}
        onToolsChange={setNewTools}
        onDescChange={setNewDesc}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  );
};

