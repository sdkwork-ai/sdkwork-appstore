import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';
import { PublishTemplateSuccessState } from './PublishTemplateSuccessState';
import { PublishTemplateFormFields } from './PublishTemplateFormFields';

interface PublishTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newTemplate: TemplateItem) => void;
}

export const PublishTemplateModal: React.FC<PublishTemplateModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const { t } = useTranslation();
  const [appSource, setAppSource] = useState('app-qwen');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SaaS 全栈');
  const [framework, setFramework] = useState('React + Vite + Tailwind');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('React, AI, SaaS');
  const [published, setPublished] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTmpl: TemplateItem = {
      id: `tmpl-${Date.now()}`,
      title: title.trim(),
      author: 'Developer',
      framework,
      category,
      description: description || 'AI architecture & code template.',
      icon: 'Boxes',
      iconColor: 'bg-store-brand',
      stars: 1,
      forks: 0,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      publishedAt: 'Just now',
      isOfficial: false,
    };

    onPublish(newTmpl);
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-store-overlay backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-store-surface border border-store-line rounded-store-modal shadow-2xl overflow-hidden p-6 text-store-ink ">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-store-ink-faint hover:text-store-ink-soft bg-store-subtle rounded-full transition-colors cursor-pointer text-xs font-medium"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-store-control bg-store-brand text-white flex items-center justify-center shadow-md">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t('templates.publishModal.title')}</h2>
            <p className="text-xs text-store-ink-faint">{t('templates.publishModal.subtitle')}</p>
          </div>
        </div>

        {published ? (
          <PublishTemplateSuccessState />
        ) : (
          <PublishTemplateFormFields
            appSource={appSource}
            title={title}
            category={category}
            framework={framework}
            description={description}
            tags={tags}
            onAppSourceChange={setAppSource}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onFrameworkChange={setFramework}
            onDescriptionChange={setDescription}
            onTagsChange={setTags}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
};


