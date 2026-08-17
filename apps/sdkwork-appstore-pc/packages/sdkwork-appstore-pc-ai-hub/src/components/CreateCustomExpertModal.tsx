import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';

interface CreateCustomExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateExpert: (expertData: {
    name: string;
    nickname: string;
    category: string;
    description: string;
    systemPrompt: string;
    tags: string[];
  }) => void;
}

export const CreateCustomExpertModal: React.FC<CreateCustomExpertModalProps> = ({
  isOpen,
  onClose,
  onCreateExpert,
}) => {
  const { t } = useTranslation();

  const [customName, setCustomName] = useState('');
  const [customNickname, setCustomNickname] = useState('');
  const [customCategory, setCustomCategory] = useState(t('aihub.experts.scenarios.dev'));
  const [customDesc, setCustomDesc] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTags, setCustomTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDesc.trim()) return;

    onCreateExpert({
      name: customName.trim(),
      nickname: customNickname.trim() || t('aihub.experts.customModal.defaultNickname'),
      category: customCategory,
      description: customDesc.trim(),
      systemPrompt: customPrompt.trim(),
      tags: customTags ? customTags.split(',').map((tag) => tag.trim()) : [t('aihub.experts.customModal.defaultTag1'), t('aihub.experts.customModal.defaultTag2')],
    });

    // Reset Form
    setCustomName('');
    setCustomNickname('');
    setCustomDesc('');
    setCustomPrompt('');
    setCustomTags('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" />
          <span>{t('aihub.experts.customModal.title')}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {t('aihub.experts.customModal.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.nameLabel')}
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t('aihub.experts.customModal.namePlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.nicknameLabel')}
            </label>
            <input
              type="text"
              value={customNickname}
              onChange={(e) => setCustomNickname(e.target.value)}
              placeholder={t('aihub.experts.customModal.nicknamePlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.categoryLabel')}
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value={t('aihub.experts.scenarios.dev')}>{t('aihub.experts.scenarios.dev')}</option>
              <option value={t('aihub.experts.scenarios.content')}>{t('aihub.experts.scenarios.content')}</option>
              <option value={t('aihub.experts.scenarios.invest')}>{t('aihub.experts.scenarios.invest')}</option>
              <option value={t('aihub.experts.scenarios.legal')}>{t('aihub.experts.scenarios.legal')}</option>
              <option value={t('aihub.experts.scenarios.business')}>{t('aihub.experts.scenarios.business')}</option>
              <option value={t('aihub.experts.scenarios.ecom')}>{t('aihub.experts.scenarios.ecom')}</option>
              <option value={t('aihub.experts.scenarios.data')}>{t('aihub.experts.scenarios.data')}</option>
              <option value={t('aihub.experts.scenarios.doc')}>{t('aihub.experts.scenarios.doc')}</option>
              <option value={t('aihub.experts.scenarios.design')}>{t('aihub.experts.scenarios.design')}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.descLabel')}
            </label>
            <textarea
              required
              rows={2}
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder={t('aihub.experts.customModal.descPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.promptLabel')}
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t('aihub.experts.customModal.promptPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('aihub.experts.customModal.tagsLabel')}
            </label>
            <input
              type="text"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              placeholder={t('aihub.experts.customModal.tagsPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {t('aihub.experts.customModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {t('aihub.experts.customModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
