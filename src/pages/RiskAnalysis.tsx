
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { config } from '@/config/environment';
import { useTransactionData } from '@/hooks/useTransactionData';
import { normalizedUsers } from '@/mocks/normalizedMockData';

const RiskAnalysis = () => {
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState({
    totalUsers: 0,
    highRiskUsers: 0,
    suspiciousTransactions: 0,
    totalTransactions: 0,
    pieChartData: [],
    lineChartData: [],
    recentActivities: []
  });

  const { transactions } = useTransactionData();

  useEffect(() => {
    const loadRiskData = async () => {
      setLoading(true);
      try {
        if (config.features.useMockData) {
          // Use mock data when enabled
          const totalUsers = normalizedUsers.length;
          const highRiskUsers = normalizedUsers.filter(user => user.riskScore >= 75).length;
          const suspiciousTransactions = transactions.filter(t => t.riskScore > 70).length;
          const totalTransactions = transactions.length;

          // Generate pie chart data based on actual risk distribution
          const riskDistribution = {
            high: normalizedUsers.filter(u => u.riskScore >= 75).length,
            medium: normalizedUsers.filter(u => u.riskScore >= 50 && u.riskScore < 75).length,
            low: normalizedUsers.filter(u => u.riskScore >= 25 && u.riskScore < 50).length,
            minimal: normalizedUsers.filter(u => u.riskScore < 25).length
          };

          const pieChartData = [
            { name: 'High Risk', value: riskDistribution.high },
            { name: 'Medium Risk', value: riskDistribution.medium },
            { name: 'Low Risk', value: riskDistribution.low },
            { name: 'Minimal Risk', value: riskDistribution.minimal },
          ];

          // Generate line chart data based on actual transaction trends
          const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date.toLocaleString('default', { month: 'short' });
          }).reverse();

          const lineChartData = last6Months.map(month => ({
            date: month,
            highRisk: Math.floor(Math.random() * 20) + 30, // Mock trend data
            mediumRisk: Math.floor(Math.random() * 15) + 20
          }));

          // Generate recent activities based on actual data
          const recentActivities = [
            {
              type: 'High Risk User Detected',
              description: `User flagged as high risk (Score: ${Math.max(...normalizedUsers.map(u => u.riskScore || 0))})`,
              time: '2 hours ago'
            },
            {
              type: 'Suspicious Transaction',
              description: `${suspiciousTransactions} suspicious transactions detected`,
              time: '5 hours ago'
            },
            {
              type: 'Risk Analysis Report',
              description: 'Monthly risk analysis report generated',
              time: '1 day ago'
            }
          ];

          setRiskData({
            totalUsers,
            highRiskUsers,
            suspiciousTransactions,
            totalTransactions,
            pieChartData,
            lineChartData,
            recentActivities
          });
        } else {
          // When mock data is disabled, show empty state or fetch real data
          console.log('🌐 Real risk analysis data not implemented');
          setRiskData({
            totalUsers: 0,
            highRiskUsers: 0,
            suspiciousTransactions: 0,
            totalTransactions: 0,
            pieChartData: [],
            lineChartData: [],
            recentActivities: []
          });
        }
      } catch (error) {
        console.error('Error loading risk data:', error);
        setRiskData({
          totalUsers: 0,
          highRiskUsers: 0,
          suspiciousTransactions: 0,
          totalTransactions: 0,
          pieChartData: [],
          lineChartData: [],
          recentActivities: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
  }, [config.features.useMockData, normalizedUsers, transactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleFilterChange = (filter: string) => {
    setRiskLevelFilter(filter);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Analysis Center</h1>
            <p className="text-muted-foreground mt-2">
              Analyze and monitor risk levels across users and transactions
            </p>
          </div>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-4" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Analysis Center</h1>
          <p className="text-muted-foreground mt-2">
            Analyze and monitor risk levels across users and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskData.totalUsers}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500 inline-block mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskData.highRiskUsers}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-orange-500 inline-block mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskData.suspiciousTransactions}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500 inline-block mr-1" />
              -3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={riskLevelFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_12_months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10 w-64"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
          <CardDescription>Distribution of risk levels across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {riskData.pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart width={400} height={300}>
                <Pie
                  data={riskData.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskData.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No risk data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Trends</CardTitle>
          <CardDescription>Trends of high and medium risk levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          {riskData.lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskData.lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="highRisk" stroke="#FF0000" strokeWidth={2} name="High Risk" />
                <Line type="monotone" dataKey="mediumRisk" stroke="#FFBB28" strokeWidth={2} name="Medium Risk" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Recent activities related to risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {riskData.recentActivities.length > 0 ? (
            <ul className="list-none space-y-2">
              {riskData.recentActivities.map((activity, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-500" />
                    {activity.description}
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No recent activities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAnalysis;
