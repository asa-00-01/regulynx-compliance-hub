
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UsageData {
  apiCalls: { current: number; limit: number };
  documentProcessing: { current: number; limit: number };
  activeCases: { current: number; limit: number };
}

interface UsageOverviewCardProps {
  isSubscribed: boolean;
  usageData?: UsageData;
}

const UsageOverviewCard = ({ isSubscribed, usageData }: UsageOverviewCardProps) => {
  if (!isSubscribed) {
    return null;
  }

  const defaultUsage: UsageData = {
    apiCalls: { current: 1247, limit: 10000 },
    documentProcessing: { current: 89, limit: 500 },
    activeCases: { current: 23, limit: 100 }
  };

  const usage = usageData || defaultUsage;

  const calculatePercentage = (current: number, limit: number) => {
    return (current / limit) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
        <CardDescription>Your usage for the current billing period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Calls</span>
            <span>{usage.apiCalls.current} / {usage.apiCalls.limit}</span>
          </div>
          <Progress value={calculatePercentage(usage.apiCalls.current, usage.apiCalls.limit)} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Document Processing</span>
            <span>{usage.documentProcessing.current} / {usage.documentProcessing.limit}</span>
          </div>
          <Progress value={calculatePercentage(usage.documentProcessing.current, usage.documentProcessing.limit)} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Active Cases</span>
            <span>{usage.activeCases.current} / {usage.activeCases.limit}</span>
          </div>
          <Progress value={calculatePercentage(usage.activeCases.current, usage.activeCases.limit)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageOverviewCard;
