
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatInterface from '@/components/ai-agent/ChatInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Bot, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AIAgent = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('aiAgent.title')}</h1>
          <p className="text-muted-foreground">
            {t('aiAgent.subtitle')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('aiAgent.quickTipsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>{t('aiAgent.tipComplianceStrong')}</strong> {t('aiAgent.tipComplianceText')}
              </div>
              <div>
                <strong>{t('aiAgent.tipRiskAssessmentStrong')}</strong> {t('aiAgent.tipRiskAssessmentText')}
              </div>
              <div>
                <strong>{t('aiAgent.tipCaseManagementStrong')}</strong> {t('aiAgent.tipCaseManagementText')}
              </div>
              <div>
                <strong>{t('aiAgent.tipDocumentReviewStrong')}</strong> {t('aiAgent.tipDocumentReviewText')}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{t('aiAgent.proTipStrong')}</strong> {t('aiAgent.proTipText')}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {t('aiAgent.capabilitiesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>{t('aiAgent.capability1')}</div>
              <div>{t('aiAgent.capability2')}</div>
              <div>{t('aiAgent.capability3')}</div>
              <div>{t('aiAgent.capability4')}</div>
              <div>{t('aiAgent.capability5')}</div>
              <div>{t('aiAgent.capability6')}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
