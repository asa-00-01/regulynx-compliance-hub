
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend
} from 'recharts';

interface CaseTypeChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  onViewAllCases: () => void;
}

const CaseTypeChart: React.FC<CaseTypeChartProps> = ({ data, colors, onViewAllCases }) => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Cases by Type</CardTitle>
        <Button variant="outline" size="sm" onClick={onViewAllCases}>
          View All Cases
        </Button>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="value" name="Number of Cases" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default CaseTypeChart;
