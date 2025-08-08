
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Database, 
  Users, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import MockDataValidator from '@/components/developer/MockDataValidator';
import { useCoherentMockData } from '@/hooks/useCoherentMockData';
import { config } from '@/config/environment';

const DeveloperTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    isMockMode, 
    completeTestUser, 
    highRiskUsers, 
    pendingKYCUsers, 
    suspiciousAMLUsers 
  } = useCoherentMockData();

  const testScenarios = [
    {
      id: 'complete_user',
      name: 'Complete Test User',
      description: 'User with all data types for full workflow testing',
      userCount: completeTestUser ? 1 : 0,
      icon: Users
    },
    {
      id: 'high_risk',
      name: 'High Risk Users',
      description: 'Users with high risk scores for compliance testing',
      userCount: highRiskUsers.length,
      icon: AlertTriangle
    },
    {
      id: 'pending_kyc',
      name: 'Pending KYC',
      description: 'Users with incomplete KYC for verification testing',
      userCount: pendingKYCUsers.length,
      icon: CheckCircle
    },
    {
      id: 'suspicious_aml',
      name: 'Suspicious AML',
      description: 'Users with flagged transactions for AML testing',
      userCount: suspiciousAMLUsers.length,
      icon: TestTube
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Code className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">
            Tools for testing and validating compliance workflows
          </p>
        </div>
      </div>

      <div className="grid gap-6 mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Mock data mode is currently <strong>{isMockMode ? 'enabled' : 'disabled'}</strong>
              </span>
              <Badge variant={isMockMode ? "default" : "secondary"}>
                {config.app.environment}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {isMockMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testScenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <Badge variant="outline">
                        {scenario.userCount} users
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validator">Data Validator</TabsTrigger>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Mock Data Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Mock Data Mode</span>
                    <Badge variant={isMockMode ? "default" : "secondary"}>
                      {isMockMode ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  {isMockMode && completeTestUser && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Complete Test User Available:</div>
                      <div className="text-sm text-muted-foreground">
                        {completeTestUser.fullName} (ID: {completeTestUser.id.slice(0, 8)}...)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Documents: {completeTestUser.documents.length} | 
                        Transactions: {completeTestUser.transactions.length} | 
                        Cases: {completeTestUser.complianceCases.length}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Environment:</span>
                    <Badge variant="outline">{config.app.environment}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Development Mode:</span>
                    <Badge variant={config.isDevelopment ? "default" : "secondary"}>
                      {config.isDevelopment ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mock Features:</span>
                    <Badge variant={config.features.useMockData ? "default" : "secondary"}>
                      {config.features.useMockData ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validator">
          <MockDataValidator />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid gap-6">
            {isMockMode ? (
              testScenarios.map((scenario) => {
                const IconComponent = scenario.icon;
                return (
                  <Card key={scenario.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {scenario.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{scenario.description}</p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {scenario.userCount} users available
                          </Badge>
                          {scenario.userCount > 0 && (
                            <Button variant="outline" size="sm">
                              View Test Data
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Enable mock data mode to access test scenarios.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Configuration is managed through environment variables and can be updated in the project settings.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Current Configuration</h4>
                    <pre className="text-sm bg-muted p-2 rounded overflow-auto">
{JSON.stringify({
  environment: config.app.environment,
  isDevelopment: config.isDevelopment,
  features: config.features
}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperTools;
