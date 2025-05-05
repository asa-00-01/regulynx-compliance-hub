
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { usePermissions } from '@/hooks/use-permissions';

// Mock data for risk analysis
const riskByCountryData = [
  { name: 'Sweden', value: 15 },
  { name: 'Denmark', value: 12 },
  { name: 'Norway', value: 8 },
  { name: 'Finland', value: 5 },
  { name: 'Germany', value: 25 },
  { name: 'UK', value: 18 },
  { name: 'USA', value: 22 },
];

const riskByTypeData = [
  { name: 'AML', value: 45 },
  { name: 'KYC', value: 35 },
  { name: 'Sanctions', value: 20 },
];

const monthlyRiskScoreTrend = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 73 },
  { month: 'Apr', score: 65 },
  { month: 'May', score: 60 },
  { month: 'Jun', score: 58 },
  { month: 'Jul', score: 65 },
  { month: 'Aug', score: 70 },
  { month: 'Sep', score: 68 },
  { month: 'Oct', score: 63 },
  { month: 'Nov', score: 65 },
  { month: 'Dec', score: 62 },
];

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#1EAEDB', '#FF6B6B'];

const RiskAnalysis = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { canGenerateReports } = usePermissions();

  return (
    <DashboardLayout requiredRoles={['admin', 'complianceOfficer', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
          <p className="text-muted-foreground">
            Analyze and visualize risk patterns across your compliance data
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="geographical">Geographical</TabsTrigger>
            <TabsTrigger value="case-types">Case Types</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Distribution</CardTitle>
                  <CardDescription>Risk level distribution across all cases</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Low Risk', value: 35 },
                          { name: 'Medium Risk', value: 45 },
                          { name: 'High Risk', value: 20 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4ade80" /> {/* Green for low risk */}
                        <Cell fill="#facc15" /> {/* Yellow for medium risk */}
                        <Cell fill="#f87171" /> {/* Red for high risk */}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Trend</CardTitle>
                  <CardDescription>Average risk score over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRiskScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#1EAEDB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Risk Summary</CardTitle>
                <CardDescription>Key risk indicators and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Average Risk Score</p>
                    <h3 className="text-2xl font-bold">65.8</h3>
                    <p className="text-xs text-muted-foreground mt-1">+2.3 from last month</p>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">High Risk Cases</p>
                    <h3 className="text-2xl font-bold">24</h3>
                    <p className="text-xs text-muted-foreground mt-1">-3 from last month</p>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                    <h3 className="text-2xl font-bold">12</h3>
                    <p className="text-xs text-muted-foreground mt-1">+5 from last month</p>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                    <h3 className="text-2xl font-bold">92%</h3>
                    <p className="text-xs text-muted-foreground mt-1">+2% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk by Country</CardTitle>
                <CardDescription>Distribution of risk scores by country</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskByCountryData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1EAEDB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="case-types" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk by Case Type</CardTitle>
                <CardDescription>Distribution of risk across different case types</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskByTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Trend (12 Months)</CardTitle>
                <CardDescription>Average risk score over the past year</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRiskScoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#1EAEDB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysis;
