
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatInterface from '@/components/ai-agent/ChatInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Bot, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AIAgent = () => {
  const { t, i18n } = useTranslation();

  // Debug: Log translation state
  React.useEffect(() => {
    console.log('🔍 AIAgent component - i18n state:', {
      isInitialized: i18n.isInitialized,
      language: i18n.language,
      testTranslations: {
        title: t('aiAgent.title'),
        quickTipsTitle: t('aiAgent.quickTipsTitle'),
        tipComplianceStrong: t('aiAgent.tipComplianceStrong'),
        tipComplianceText: t('aiAgent.tipComplianceText')
      }
    });
  }, [t, i18n]);

  // Test function to check if translation is working
  const getTranslation = (key: string) => {
    const translation = t(key);
    // If the translation equals the key, it means the translation failed
    if (translation === key) {
      console.warn(`⚠️ Translation failed for key: ${key}`);
      return `${key} (Translation failed)`;
    }
    return translation;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getTranslation('aiAgent.title')}</h1>
          <p className="text-muted-foreground">
            {getTranslation('aiAgent.subtitle')}
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
                {getTranslation('aiAgent.quickTipsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>{getTranslation('aiAgent.tipComplianceStrong')}</strong> {getTranslation('aiAgent.tipComplianceText')}
              </div>
              <div>
                <strong>{getTranslation('aiAgent.tipRiskAssessmentStrong')}</strong> {getTranslation('aiAgent.tipRiskAssessmentText')}
              </div>
              <div>
                <strong>{getTranslation('aiAgent.tipCaseManagementStrong')}</strong> {getTranslation('aiAgent.tipCaseManagementText')}
              </div>
              <div>
                <strong>{getTranslation('aiAgent.tipDocumentReviewStrong')}</strong> {getTranslation('aiAgent.tipDocumentReviewText')}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{getTranslation('aiAgent.proTipStrong')}</strong> {getTranslation('aiAgent.proTipText')}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {getTranslation('aiAgent.capabilitiesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>{getTranslation('aiAgent.capability1')}</div>
              <div>{getTranslation('aiAgent.capability2')}</div>
              <div>{getTranslation('aiAgent.capability3')}</div>
              <div>{getTranslation('aiAgent.capability4')}</div>
              <div>{getTranslation('aiAgent.capability5')}</div>
              <div>{getTranslation('aiAgent.capability6')}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
