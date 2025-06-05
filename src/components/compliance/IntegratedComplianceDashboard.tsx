
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UnifiedUserData } from '@/context/compliance/types';
import { Shield, User, Activity, AlertTriangle } from 'lucide-react';
import ComplianceActions from './ComplianceActions';
import UserRiskScoring from './UserRiskScoring';
import PatternDetectionEngine from '../aml/PatternDetectionEngine';

interface IntegratedComplianceDashboardProps {
  user?: UnifiedUserData;
}

const IntegratedComplianceDashboard: React.FC<IntegratedComplianceDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No User Selected</h3>
          <p className="text-muted-foreground">
            Select a user to view their compliance dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'}>
                KYC: {user.kycStatus}
              </Badge>
              <Badge variant={user.riskScore >= 75 ? 'destructive' : user.riskScore >= 50 ? 'warning' : 'outline'}>
                Risk: {user.riskScore}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold">{user.riskScore}</p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${user.riskScore >= 75 ? 'text-red-500' : user.riskScore >= 50 ? 'text-orange-500' : 'text-green-500'}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                    <p className="text-2xl font-bold capitalize">{user.kycStatus}</p>
                  </div>
                  <Shield className={`h-8 w-8 ${user.kycStatus === 'verified' ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Flags</p>
                    <p className="text-2xl font-bold">
                      {(user.isPEP ? 1 : 0) + (user.isSanctioned ? 1 : 0)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">PEP Status</div>
                  <Badge variant={user.isPEP ? 'destructive' : 'outline'} className="mt-1">
                    {user.isPEP ? 'PEP' : 'Not PEP'}
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Sanctions</div>
                  <Badge variant={user.isSanctioned ? 'destructive' : 'outline'} className="mt-1">
                    {user.isSanctioned ? 'Sanctioned' : 'Clear'}
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Country</div>
                  <Badge variant="outline" className="mt-1">
                    {user.countryOfResidence}
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Date of Birth</div>
                  <div className="text-sm font-medium mt-1">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <UserRiskScoring user={user} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ComplianceActions user={user} />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <PatternDetectionEngine />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedComplianceDashboard;
