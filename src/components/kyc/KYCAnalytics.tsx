
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCAnalyticsProps {
  users: (KYCUser & { flags: UserFlags })[];
}

const KYCAnalytics: React.FC<KYCAnalyticsProps> = ({ users }) => {
  // Calculate analytics data
  const totalUsers = users.length;
  const verifiedUsers = users.filter(user => user.flags.is_email_confirmed && user.identityNumber).length;
  const pendingUsers = users.filter(user => !user.flags.is_email_confirmed || !user.identityNumber).length;
  const pepUsers = users.filter(user => user.flags.is_verified_pep).length;
  const sanctionedUsers = users.filter(user => user.flags.is_sanction_list).length;
  const highRiskUsers = users.filter(user => user.flags.riskScore >= 75).length;

  const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;
  const riskDistribution = {
    minimal: users.filter(user => user.flags.riskScore < 25).length,
    low: users.filter(user => user.flags.riskScore >= 25 && user.flags.riskScore < 50).length,
    medium: users.filter(user => user.flags.riskScore >= 50 && user.flags.riskScore < 75).length,
    high: users.filter(user => user.flags.riskScore >= 75).length
  };

  const avgRiskScore = totalUsers > 0 ? 
    users.reduce((sum, user) => sum + user.flags.riskScore, 0) / totalUsers : 0;

  const analyticsCards = [
    {
      title: 'Verification Rate',
      value: `${verificationRate.toFixed(1)}%`,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      trend: verificationRate >= 80 ? 'up' : 'down',
      color: 'bg-green-50'
    },
    {
      title: 'Average Risk Score',
      value: avgRiskScore.toFixed(1),
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      trend: avgRiskScore <= 50 ? 'up' : 'down',
      color: 'bg-orange-50'
    },
    {
      title: 'PEP Users',
      value: pepUsers,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      percentage: totalUsers > 0 ? (pepUsers / totalUsers) * 100 : 0,
      color: 'bg-purple-50'
    },
    {
      title: 'High Risk Users',
      value: highRiskUsers,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      percentage: totalUsers > 0 ? (highRiskUsers / totalUsers) * 100 : 0,
      color: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
                {card.trend && (
                  <div className={`flex items-center ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-medium text-muted-foreground mb-1">{card.title}</h3>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.percentage !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {card.percentage.toFixed(1)}% of total users
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(riskDistribution).map(([level, count]) => {
              const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              const colors = {
                minimal: 'bg-green-500',
                low: 'bg-blue-500',
                medium: 'bg-yellow-500',
                high: 'bg-red-500'
              };
              
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${colors[level as keyof typeof colors]} text-white border-none`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} users ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{verifiedUsers}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{sanctionedUsers}</div>
              <div className="text-sm text-muted-foreground">Sanctioned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCAnalytics;
