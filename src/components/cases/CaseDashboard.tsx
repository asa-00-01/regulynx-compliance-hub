
import React from 'react';
import { CaseSummary } from '@/types/case';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  AlertCircleIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon
} from 'lucide-react';
import { mockComplianceCases } from '@/mocks/casesData';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart
} from 'recharts';

interface CaseDashboardProps {
  summary: CaseSummary;
  loading: boolean;
  onViewAllCases: () => void;
}

const CaseDashboard: React.FC<CaseDashboardProps> = ({ 
  summary, 
  loading, 
  onViewAllCases
}) => {
  // Format data for charts
  const statusData = Object.entries(summary.casesByStatus || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value
  }));

  const typeData = Object.entries(summary.casesByType || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    value
  }));

  const riskData = [
    { name: 'Low Risk (0-30)', value: mockComplianceCases.filter(c => c.riskScore < 30).length },
    { name: 'Medium Risk (30-60)', value: mockComplianceCases.filter(c => c.riskScore >= 30 && c.riskScore < 60).length },
    { name: 'High Risk (60-80)', value: mockComplianceCases.filter(c => c.riskScore >= 60 && c.riskScore < 80).length },
    { name: 'Critical Risk (80+)', value: mockComplianceCases.filter(c => c.riskScore >= 80).length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="mt-1">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="h-16 animate-pulse bg-muted rounded-md"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          "Open Cases",
          summary.openCases,
          "Requiring attention",
          <div className="p-2 rounded-full bg-blue-100">
            <FileTextIcon className="text-blue-600 h-5 w-5" />
          </div>
        )}

        {renderMetricCard(
          "High Risk Cases",
          summary.highRiskCases,
          "Score 70+",
          <div className="p-2 rounded-full bg-red-100">
            <AlertCircleIcon className="text-red-600 h-5 w-5" />
          </div>
        )}

        {renderMetricCard(
          "Resolved Last Week",
          summary.resolvedLastWeek,
          "Cases closed",
          <div className="p-2 rounded-full bg-green-100">
            <CheckCircleIcon className="text-green-600 h-5 w-5" />
          </div>
        )}

        {renderMetricCard(
          "Avg. Resolution Time",
          summary.averageResolutionDays > 0 ? `${summary.averageResolutionDays} days` : "N/A",
          "For closed cases",
          <div className="p-2 rounded-full bg-purple-100">
            <ClockIcon className="text-purple-600 h-5 w-5" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Cases by Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pie">
              <TabsList className="mb-4">
                <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              </TabsList>

              <TabsContent value="pie">
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => entry.name}
                        labelLine={false}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="bar">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1">
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Cases by Type</CardTitle>
            <Button variant="outline" size="sm" onClick={onViewAllCases}>View All Cases</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6366F1">
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CaseDashboard;
