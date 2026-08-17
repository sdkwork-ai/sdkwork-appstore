import React, { useState } from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Bot,
  Send,
  UserCheck,
  Plus
} from 'lucide-react';
import { ExpertItem } from '@sdkwork/appstore-pc-core';

const scenarioTitleKeyMap: Record<string, string> = {
  '内容创作': 'aihub.experts.scenarios.content',
  '投资分析': 'aihub.experts.scenarios.invest',
  '法律咨询': 'aihub.experts.scenarios.legal',
  '小微企业': 'aihub.experts.scenarios.business',
  '电商运营': 'aihub.experts.scenarios.ecom',
  '数据分析': 'aihub.experts.scenarios.data',
  '专业文档': 'aihub.experts.scenarios.doc',
  '产品设计': 'aihub.experts.scenarios.design',
  '工程开发': 'aihub.experts.scenarios.dev',
};

const filterTagKeyMap: Record<string, string> = {
  '全部': 'aihub.experts.filterTags.all',
  'OPC:一人公司': 'aihub.experts.filterTags.opc',
  '腾讯专家': 'aihub.experts.filterTags.tencent',
  '产品设计': 'aihub.experts.filterTags.productDesign',
  '技术工程': 'aihub.experts.filterTags.engineering',
  '金融投资': 'aihub.experts.filterTags.finance',
  '全球发展': 'aihub.experts.filterTags.globalDev',
  '教育学习': 'aihub.experts.filterTags.education',
  '游戏空间': 'aihub.experts.filterTags.gaming',
  '数据智能': 'aihub.experts.filterTags.dataIntelligence',
  '营销增长': 'aihub.experts.filterTags.marketing',
  '内容创作': 'aihub.experts.filterTags.contentCreation',
  '销售商务': 'aihub.experts.filterTags.salesBiz',
  '运营人力': 'aihub.experts.filterTags.operations',
  '项目质量': 'aihub.experts.filterTags.quality',
  '法务安全': 'aihub.experts.filterTags.legalSecurity',
  '行业顾问': 'aihub.experts.filterTags.consultant',
};

interface ExpertDetailModalProps {
  expert: ExpertItem | null;
  isOpen: boolean;
  onClose: () => void;
  isMyExpert: boolean;
  onToggleMyExpert: (expertId: string) => void;
  onTestInSandbox: (expert: ExpertItem, userMessage?: string) => void;
}

export const ExpertDetailModal: React.FC<ExpertDetailModalProps> = ({
  expert,
  isOpen,
  onClose,
  isMyExpert,
  onToggleMyExpert,
  onTestInSandbox
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');

  if (!isOpen || !expert) return null;

  const handleCopySystemPrompt = () => {
    if (!expert.systemPrompt) return;
    navigator.clipboard.writeText(expert.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteSandbox = () => {
    onTestInSandbox(expert, testPrompt);
    onClose();
  };

  const scenarioLabel = t(scenarioTitleKeyMap[expert.scenarioCategory] ?? '', expert.scenarioCategory);
  const filterTagLabel = t(filterTagKeyMap[expert.filterTag] ?? '', expert.filterTag);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full text-slate-100 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${expert.avatarBg} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{expert.name}</h3>
                {expert.badge && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {expert.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {expert.nickname} · {scenarioLabel} ({filterTagLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleMyExpert(expert.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isMyExpert
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isMyExpert ? (
                <>
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('aihub.experts.card.addedToMine')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('aihub.experts.card.addToMine')}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('common.description')}
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {expert.description}
            </p>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('common.tags')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {expert.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* System Prompt View */}
          {expert.systemPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('aihub.experts.modal.systemPrompt')}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopySystemPrompt}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t('aihub.experts.modal.promptCopied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('aihub.experts.modal.copyPrompt')}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto select-text">
                {expert.systemPrompt}
              </pre>
            </div>
          )}

          {/* Sandbox Test Prompt Input */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('aihub.experts.modal.testPromptPlaceholder')}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder={t('aihub.experts.modal.testPromptExample')}
                className="flex-1 bg-slate-950 text-sm text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleExecuteSandbox}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('aihub.experts.modal.sendToExpert')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {t('aihub.experts.modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
