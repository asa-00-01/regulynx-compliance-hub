
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CircleDollarSign, ShieldAlert, UserCheck } from 'lucide-react';
import { CircleX } from 'lucide-react';

interface ComplianceMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  verifiedUsers: number;
  sanctionedUsers: number;
  pepUsers: number;
}

interface ComplianceSummaryProps {
  metrics?: ComplianceMetrics;
  loading?: boolean;
}

const ComplianceSummaryCard = ({ metrics, loading = false }: ComplianceSummaryProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                  <div className="ml-3 h-4 w-32 bg-muted animate-pulse" />
                </div>
                <div className="h-5 w-10 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeMetrics: ComplianceMetrics = metrics ?? {
    totalTransactions: 0,
    flaggedTransactions: 0,
    verifiedUsers: 0,
    sanctionedUsers: 0,
    pepUsers: 0,
  };

  const flaggedPct = safeMetrics.totalTransactions > 0
    ? ((safeMetrics.flaggedTransactions / safeMetrics.totalTransactions) * 100).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CircleDollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <div className="ml-3 font-medium text-sm">Total Transactions</div>
            </div>
            <div className="text-lg font-bold">{safeMetrics.totalTransactions.toLocaleString()}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <CircleX className="h-4 w-4 text-red-500" />
              </div>
              <div className="ml-3 font-medium text-sm">Flagged Transactions</div>
            </div>
            <div className="flex items-center">
              <div className="text-lg font-bold">{safeMetrics.flaggedTransactions.toLocaleString()}</div>
              <div className="ml-2 text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5">
                {flaggedPct}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-500" />
              </div>
              <div className="ml-3 font-medium text-sm">Verified Users</div>
            </div>
            <div className="text-lg font-bold">{safeMetrics.verifiedUsers.toLocaleString()}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              </div>
              <div className="ml-3 font-medium text-sm">Sanctioned/PEP Users</div>
            </div>
            <div className="text-lg font-bold">
              {(safeMetrics.sanctionedUsers + safeMetrics.pepUsers).toLocaleString()}
              <span className="ml-2 text-xs text-muted-foreground">
                ({safeMetrics.sanctionedUsers} / {safeMetrics.pepUsers})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceSummaryCard;
