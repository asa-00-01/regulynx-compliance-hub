
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface RiskScoreChartProps {
  data: { date: string; score: number }[];
  loading: boolean;
}

const RiskScoreChart = ({ data, loading }: RiskScoreChartProps) => {
  const { t } = useTranslation();
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.riskScoreTrend')}</CardTitle>
        <CardDescription>{t('dashboard.riskScoreTrendDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {loading ? (
          <div className="h-full w-full bg-muted/20 animate-pulse rounded-md"></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1EAEDB" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1EAEDB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                tick={{fontSize: 12}}
              />
              <YAxis domain={[40, 100]} tick={{fontSize: 12}} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#1EAEDB" 
                fillOpacity={1} 
                fill="url(#riskScoreGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskScoreChart;
