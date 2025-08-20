
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Lightbulb, Settings, Info } from 'lucide-react';
import ChatInterface from '@/components/ai-agent/ChatInterface';
import AIConfigurationManager from '@/components/ai-agent/AIConfigurationManager';
import { useAuth } from '@/hooks/useAuth';
import { aiAgentService } from '@/services/ai/aiAgentService';
import { customerAIService } from '@/services/ai/customerAIService';
import { useToast } from '@/hooks/use-toast';
import { ExtendedUser } from '@/types/auth';

const AIAgent = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('chat');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [usageLimits, setUsageLimits] = useState<{
    canUse: boolean;
    remainingRequests: number;
    limit: number;
  } | null>(null);

  // Debug: Log translation state
  React.useEffect(() => {
    console.log('🔍 AIAgent component - translation test:', {
      testTranslations: {
        title: t('aiAgent.title'),
        quickTipsTitle: t('aiAgent.quickTipsTitle'),
        tipComplianceStrong: t('aiAgent.tipComplianceStrong'),
        tipComplianceText: t('aiAgent.tipComplianceText')
      }
    });
  }, [t]);

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

  // Initialize AI Agent for the current customer
  useEffect(() => {
    const initializeAI = async () => {
      if (!user) return;

      try {
        // Get customer ID from user profile
        const customerId = (user as ExtendedUser).customer_id;
        if (!customerId) {
          console.warn('⚠️ No customer ID found for user');
          return;
        }

        setCustomerId(customerId);

        // Initialize AI Agent for this customer
        const success = await aiAgentService.initializeForCustomer(customerId);
        setIsInitialized(success);

        if (success) {
          // Check usage limits
          const limits = await customerAIService.checkUsageLimits(customerId);
          setUsageLimits(limits);

          if (!limits.canUse) {
            toast({
              title: 'Usage Limit Reached',
              description: `You have reached your daily AI usage limit of ${limits.limit} requests.`,
              variant: 'destructive'
            });
          }
        } else {
          // Show a warning but still allow the AI to work
          toast({
            title: 'AI Initialization Warning',
            description: 'AI Agent initialized with default settings. Some features may be limited.',
            variant: 'default'
          });
          setIsInitialized(true); // Set to true to allow the AI to work
        }
      } catch (error) {
        console.error('❌ Error initializing AI Agent:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize AI Agent for your organization.',
          variant: 'destructive'
        });
      }
    };

    initializeAI();
  }, [user, toast]);

  const handleConfigurationChange = () => {
    // Re-initialize AI Agent when configuration changes
    if (customerId) {
      aiAgentService.initializeForCustomer(customerId);
    }
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
        
        {usageLimits && (
          <div className="text-right">
            <Badge variant={usageLimits.canUse ? "default" : "destructive"}>
              {usageLimits.remainingRequests} / {usageLimits.limit} requests remaining
            </Badge>
          </div>
        )}
      </div>

      {!isInitialized && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            AI Agent is initializing for your organization. Please wait a moment...
          </AlertDescription>
        </Alert>
      )}

      {usageLimits && !usageLimits.canUse && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have reached your daily AI usage limit. Please contact your administrator to increase your limits or wait until tomorrow.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
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

              {/* Current Configuration Info */}
              {isInitialized && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Current Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2 text-muted-foreground">
                        {aiAgentService.getCurrentConfiguration()?.name || 'Default'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Tools:</span>
                      <span className="ml-2 text-muted-foreground">
                        {aiAgentService.getAvailableTools().length} available
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setActiveTab('config')}
                    >
                      Manage Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {customerId ? (
            <AIConfigurationManager
              customerId={customerId}
              onConfigurationChange={handleConfigurationChange}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Loading configuration manager...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAgent;
