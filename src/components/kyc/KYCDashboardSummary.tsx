
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Shield, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCDashboardSummaryProps {
  users: (KYCUser & { flags: UserFlags })[];
}

const KYCDashboardSummary = ({ users }: KYCDashboardSummaryProps) => {
  // Calculate summary stats
  const totalUsers = users.length;
  const pepUsers = users.filter(user => user.flags.is_verified_pep).length;
  const sanctionedUsers = users.filter(user => user.flags.is_sanction_list).length;
  const highRiskUsers = users.filter(user => user.flags.riskScore >= 75).length;
  const pendingKYC = users.filter(user => 
    !user.phoneNumber || 
    !user.address || 
    !user.flags.is_email_confirmed
  ).length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'PEP Users',
      value: pepUsers,
      icon: Shield,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      title: 'Sanctioned Users',
      value: sanctionedUsers,
      icon: ShieldAlert,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'High Risk Users',
      value: highRiskUsers,
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Pending KYC',
      value: pendingKYC,
      icon: Clock,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg border">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground text-center">{stat.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCDashboardSummary;
