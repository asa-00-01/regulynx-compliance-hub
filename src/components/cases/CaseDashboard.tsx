
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
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
          <div className="flex-shrink-0">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-32">
            <CardContent className="p-6">
              <div className="h-full animate-pulse bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i} className="h-80">
            <CardContent className="p-6">
              <div className="h-full animate-pulse bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          "Open Cases",
          summary.openCases,
          "Requiring attention",
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {renderMetricCard(
          "High Risk Cases",
          summary.highRiskCases,
          "Score 70+",
          <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        )}

        {renderMetricCard(
          "Resolved Last Week",
          summary.resolvedLastWeek,
          "Cases closed",
          <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        )}

        {renderMetricCard(
          "Avg. Resolution Time",
          summary.averageResolutionDays > 0 ? `${summary.averageResolutionDays} days` : "N/A",
          "For closed cases",
          <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
            <ClockIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status Chart */}
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Cases by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cases by Risk Level Chart */}
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Cases by Risk Level</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="pie" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="pie" className="text-sm">Pie Chart</TabsTrigger>
                <TabsTrigger value="bar" className="text-sm">Bar Chart</TabsTrigger>
              </TabsList>

              <TabsContent value="pie" className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        labelLine={false}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="bar" className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Cases by Type Chart - Full Width */}
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
              <BarChart data={typeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseDashboard;
