
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { KYCUser, UserFlags } from '@/types/kyc';
import { AlertTriangle, Shield, Users, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KYCDashboardSummaryProps {
  users: (KYCUser & { flags: UserFlags })[];
  isLoading?: boolean;
}

const KYCDashboardSummary: React.FC<KYCDashboardSummaryProps> = ({ users, isLoading = false }) => {
  // Calculate summary stats
  const totalUsers = users.length;
  const pepUsers = users.filter(user => user.flags.is_verified_pep).length;
  const sanctionedUsers = users.filter(user => user.flags.is_sanction_list).length;
  const highRiskUsers = users.filter(user => user.flags.riskScore >= 75).length;
  const incompleteKYCUsers = users.filter(user => 
    !user.flags.is_email_confirmed || 
    !user.phoneNumber || 
    !user.identityNumber
  ).length;

  const summaryCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      title: 'PEP Users',
      value: pepUsers,
      icon: <Shield className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-50',
      isHighlighted: pepUsers > 0
    },
    {
      title: 'Sanctioned',
      value: sanctionedUsers,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50',
      isHighlighted: sanctionedUsers > 0
    },
    {
      title: 'High Risk',
      value: highRiskUsers,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50',
      isHighlighted: highRiskUsers > 0
    },
    {
      title: 'Incomplete KYC',
      value: incompleteKYCUsers,
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      color: 'bg-amber-50',
      isHighlighted: incompleteKYCUsers > 0
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {summaryCards.map((card, index) => (
        <Card 
          key={index} 
          className={`overflow-hidden border shadow-sm ${
            card.isHighlighted ? 'border-l-4' : ''
          } ${
            card.isHighlighted ? 
              index === 1 ? 'border-l-orange-500' :
              index === 2 ? 'border-l-red-500' :
              index === 3 ? 'border-l-red-500' : 
              'border-l-amber-500' : ''
          }`}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-2 rounded-full ${card.color}`}>
                {card.icon}
              </div>
              {card.isHighlighted && <span className="text-xs font-medium text-red-600">Requires Action</span>}
            </div>
            <div>
              <CardTitle className="text-base text-muted-foreground mb-1">{card.title}</CardTitle>
              <div className="text-3xl font-bold">{card.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KYCDashboardSummary;
