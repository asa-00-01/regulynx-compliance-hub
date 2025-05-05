
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RiskDistributionItem } from './types/riskScoringTypes';

interface RiskDistributionChartProps {
  riskDistribution: RiskDistributionItem[];
}

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ riskDistribution }) => {
  return (
    <div className="h-72">
      <h3 className="mb-4 text-sm font-medium">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={riskDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Number of Users">
            {riskDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionChart;
