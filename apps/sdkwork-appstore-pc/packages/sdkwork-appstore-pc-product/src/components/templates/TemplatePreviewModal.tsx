import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { TemplateModalHeader } from './TemplateModalHeader';
import { TemplateDetailNav } from './TemplateDetailNav';
import { TemplateDetailNavTabs, TemplateTabType } from './TemplateDetailNavTabs';
import { TemplateOverviewTab } from './TemplateOverviewTab';
import { TemplateScreenshotsTab } from './TemplateScreenshotsTab';
import { TemplateTechStackTab } from './TemplateTechStackTab';
import { TemplateCliTab } from './TemplateCliTab';
import { TemplateDemoTab } from './TemplateDemoTab';
import { TemplateModalFooter } from './TemplateModalFooter';

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TemplateTabType>('overview');

  if (!template) return null;

  return (
    <ModalShell onClose={onClose} maxWidthClass="max-w-4xl">
      {/* Modal Header */}
      <TemplateModalHeader template={template} />

      {/* Navigation Tabs */}
      <TemplateDetailNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        screenshotsCount={template.screenshots?.length || 3}
      />

      {/* Tab Contents */}
      <div className="mt-3 min-h-[320px]">
        {activeTab === 'overview' && <TemplateOverviewTab template={template} />}
        {activeTab === 'screenshots' && (
          <TemplateScreenshotsTab
            screenshots={template.screenshots}
            title={template.title}
          />
        )}
        {activeTab === 'techstack' && <TemplateTechStackTab template={template} />}
        {activeTab === 'cli' && <TemplateCliTab templateId={template.id} title={template.title} />}
        {activeTab === 'demo' && <TemplateDemoTab template={template} />}
      </div>

      {/* Modal Footer */}
      <TemplateModalFooter template={template} onClose={onClose} />
    </ModalShell>
  );
};




