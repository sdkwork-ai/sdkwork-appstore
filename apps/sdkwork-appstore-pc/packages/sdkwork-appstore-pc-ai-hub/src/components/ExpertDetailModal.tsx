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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-store-overlay backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-store-line rounded-store-modal max-w-2xl w-full text-slate-100 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-store-line bg-slate-950/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${expert.avatarBg} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{expert.name}</h3>
                {expert.badge && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-store-warning/20 text-store-warning border border-store-warning/30">
                    {expert.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-store-ink-faint mt-0.5 font-medium">
                {expert.nickname} · {scenarioLabel} ({filterTagLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleMyExpert(expert.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-store-control text-xs font-medium transition-all border ${
                isMyExpert
                  ? 'bg-store-brand/30 border-store-brand text-store-brand'
                  : 'bg-slate-800 border-store-line text-slate-300 hover:text-white'
              }`}
            >
              {isMyExpert ? (
                <>
                  <Check className="w-3.5 h-3.5 text-store-brand" />
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
              className="p-1.5 rounded-store-control text-store-ink-faint hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-store-ink-faint uppercase tracking-wider mb-1.5">
              {t('common.description')}
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-store-control border border-store-line">
              {expert.description}
            </p>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-semibold text-store-ink-faint uppercase tracking-wider mb-2">
              {t('common.tags')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {expert.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-store-brand/60 text-store-brand border border-store-brand/50 font-medium"
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
                <h4 className="text-xs font-semibold text-store-ink-faint uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-store-brand" />
                  <span>{t('aihub.experts.modal.systemPrompt')}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopySystemPrompt}
                  className="flex items-center gap-1 text-xs text-store-brand hover:text-store-brand transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-store-success" />
                      <span className="text-store-success">{t('aihub.experts.modal.promptCopied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('aihub.experts.modal.copyPrompt')}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-300 bg-slate-950 p-4 rounded-store-control border border-store-line whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto select-text">
                {expert.systemPrompt}
              </pre>
            </div>
          )}

          {/* Sandbox Test Prompt Input */}
          <div className="space-y-2 pt-2 border-t border-store-line">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-store-brand" />
              <span>{t('aihub.experts.modal.testPromptPlaceholder')}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder={t('aihub.experts.modal.testPromptExample')}
                className="flex-1 bg-store-field text-sm text-store-ink placeholder:text-store-ink-faint px-3 rounded-store-control border border-store-line focus:outline-none focus:border-store-brand h-9 outline-none transition-colors focus:ring-2 focus:ring-store-brand/25"
              />
              <button
                type="button"
                onClick={handleExecuteSandbox}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-store-control bg-store-brand hover:bg-store-brand text-white font-medium text-xs transition-colors shadow-md shadow-store-brand/20 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('aihub.experts.modal.sendToExpert')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-store-line bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-store-control bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {t('aihub.experts.modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
