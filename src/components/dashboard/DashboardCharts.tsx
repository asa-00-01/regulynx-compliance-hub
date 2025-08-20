
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockBarData = [
  { name: 'Jan', transactions: 400, alerts: 24 },
  { name: 'Feb', transactions: 300, alerts: 13 },
  { name: 'Mar', transactions: 200, alerts: 98 },
  { name: 'Apr', transactions: 278, alerts: 39 },
  { name: 'May', transactions: 189, alerts: 48 },
  { name: 'Jun', transactions: 239, alerts: 38 },
];

const mockPieData = [
  { name: 'Low Risk', value: 400, color: '#22c55e' },
  { name: 'Medium Risk', value: 300, color: '#eab308' },
  { name: 'High Risk', value: 200, color: '#f43f5e' },
  { name: 'Critical', value: 100, color: '#dc2626' },
];

const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Transaction Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#3b82f6" />
              <Bar dataKey="alerts" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockPieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
