import React, { useState } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const RiskAnalysis = () => {
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data for demonstration
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const pieChartData = [
    { name: 'High Risk', value: 400 },
    { name: 'Medium Risk', value: 300 },
    { name: 'Low Risk', value: 300 },
    { name: 'Minimal Risk', value: 200 },
  ];

  const lineChartData = [
    { date: 'Jan', highRisk: 40, mediumRisk: 30 },
    { date: 'Feb', highRisk: 45, mediumRisk: 25 },
    { date: 'Mar', highRisk: 38, mediumRisk: 32 },
    { date: 'Apr', highRisk: 50, mediumRisk: 40 },
    { date: 'May', highRisk: 55, mediumRisk: 45 },
    { date: 'Jun', highRisk: 60, mediumRisk: 50 },
  ];

  const totalUsers = 1250;
  const highRiskUsers = 120;
  const suspiciousTransactions = 34;
  const totalTransactions = 2345;

  const handleFilterChange = (filter: string) => {
    setRiskLevelFilter(filter);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
            <div className="text-2xl font-bold">{totalUsers}</div>
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
            <div className="text-2xl font-bold text-red-600">{highRiskUsers}</div>
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
            <div className="text-2xl font-bold">{suspiciousTransactions}</div>
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
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart width={400} height={300}>
              <RechartsPieChart
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Trends</CardTitle>
          <CardDescription>Trends of high and medium risk levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="highRisk" stroke="#FF0000" strokeWidth={2} name="High Risk" />
              <Line type="monotone" dataKey="mediumRisk" stroke="#FFBB28" strokeWidth={2} name="Medium Risk" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Recent activities related to risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-none space-y-2">
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                User <span className="font-medium ml-1">@john_doe</span> flagged as high risk
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                Suspicious transaction detected for <span className="font-medium ml-1">@jane_smith</span>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                Risk analysis report generated for the month of June
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAnalysis;
