
import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatInterface from '@/components/ai-agent/ChatInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Bot, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ChatInterface />
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Ask about compliance:</strong> Get help with AML monitoring, KYC verification, and regulatory requirements.
                </div>
                <div>
                  <strong>Risk assessment:</strong> Ask for explanations of risk scores, factors, and mitigation strategies.
                </div>
                <div>
                  <strong>Case management:</strong> Get guidance on investigating cases and following compliance procedures.
                </div>
                <div>
                  <strong>Document review:</strong> Ask about document verification processes and requirements.
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Pro tip:</strong> Be specific in your questions. Instead of "Help with compliance," try "How do I investigate a high-risk transaction from a sanctioned country?"
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• Real-time compliance guidance</div>
                <div>• Risk assessment explanations</div>
                <div>• Regulatory requirement lookups</div>
                <div>• Case investigation support</div>
                <div>• Document analysis assistance</div>
                <div>• Best practice recommendations</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAgent;
