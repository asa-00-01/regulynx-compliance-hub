
import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatInterface from '@/components/ai-agent/ChatInterface';

const AIAgent = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('aiAgent.title')}</h1>
            <p className="text-muted-foreground">
              {t('aiAgent.subtitle')}
            </p>
          </div>
        </div>
        
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default AIAgent;
