import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { AISandboxResponseBadge } from './AISandboxResponseBadge';
import { AISandboxPromptPresets } from './AISandboxPromptPresets';
import { AISandboxMetricsBar } from './AISandboxMetricsBar';
import { AISandboxModelSelector } from './AISandboxModelSelector';
import { AISandboxForm } from './AISandboxForm';
import { AIHubService, AIModelInfo } from '@sdkwork/appstore-pc-core';

interface AISandboxAssistantProps {
  initialPrompt?: string;
  activeExpertName?: string;
}

export const AISandboxAssistant: React.FC<AISandboxAssistantProps> = ({
  initialPrompt,
  activeExpertName
}) => {
  const { t } = useTranslation();
  const [demoPrompt, setDemoPrompt] = useState(initialPrompt || '');
  const [demoResponse, setDemoResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2.5-flash');
  const [metrics, setMetrics] = useState<{ tokenCount?: number; latencyMs?: number; modelUsed?: string }>({});

  useEffect(() => {
    if (initialPrompt) {
      setDemoPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    async function loadModels() {
      try {
        const list = await AIHubService.getModels();
        setModels(list);
      } catch (err) {
        console.error('Failed to load AI models', err);
      }
    }
    loadModels();
  }, []);

  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim()) return;

    setIsGenerating(true);
    setDemoResponse('');
    setMetrics({});

    try {
      const result = await AIHubService.generateCompletion(demoPrompt, selectedModelId);
      setDemoResponse(result.response);
      setMetrics({
        tokenCount: result.tokenCount,
        latencyMs: result.latencyMs,
        modelUsed: result.modelUsed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('not configured')) {
        setDemoResponse(t('aihub.sandbox.notConfigured'));
      } else {
        setDemoResponse(t('aihub.sandbox.errorText'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-5 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl shadow-sm space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{t('aihub.sandbox.title')}</span>
        </h3>
        
        {/* Model Selector Subcomponent */}
        <AISandboxModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
        />
      </div>

      {/* Prompt Form Subcomponent */}
      <AISandboxForm
        demoPrompt={demoPrompt}
        isGenerating={isGenerating}
        onPromptChange={setDemoPrompt}
        onSubmit={handleTestPrompt}
      />

      {/* Preset prompt pills subcomponent */}
      <AISandboxPromptPresets onSelectPreset={(preset) => setDemoPrompt(preset)} />

      {/* Metrics & Copy bar subcomponent */}
      <AISandboxMetricsBar demoResponse={demoResponse} metrics={metrics} />

      <AISandboxResponseBadge response={demoResponse} />
    </div>
  );
};



