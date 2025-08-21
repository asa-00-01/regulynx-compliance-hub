
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ComplianceMetrics } from '@/types/compliance';

interface DashboardChartsProps {
  metrics: ComplianceMetrics;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ metrics }) => {
  const kycStatusData = [
    { name: 'Verified', value: metrics.verifiedCustomers, color: '#22c55e' },
    { name: 'Pending', value: metrics.pendingCustomers, color: '#f59e0b' },
    { name: 'Rejected', value: metrics.rejectedCustomers, color: '#ef4444' }
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: Math.max(0, metrics.totalCustomers - metrics.highRiskCustomers - metrics.pepCustomers), color: '#22c55e' },
    { name: 'High Risk', value: metrics.highRiskCustomers, color: '#ef4444' },
    { name: 'PEP', value: metrics.pepCustomers, color: '#f59e0b' },
    { name: 'Sanctioned', value: metrics.sanctionedCustomers, color: '#dc2626' }
  ];

  const monthlyTrendsData = [
    { month: 'Jan', verified: 12, pending: 8, rejected: 2 },
    { month: 'Feb', verified: 15, pending: 6, rejected: 3 },
    { month: 'Mar', verified: 18, pending: 9, rejected: 1 },
    { month: 'Apr', verified: 22, pending: 5, rejected: 2 },
    { month: 'May', verified: 25, pending: 7, rejected: 3 },
    { month: 'Jun', verified: 28, pending: 4, rejected: 1 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kycStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {kycStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly KYC Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="verified" stroke="#22c55e" name="Verified" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
