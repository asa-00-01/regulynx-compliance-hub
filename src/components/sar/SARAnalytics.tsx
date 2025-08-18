import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter
} from 'lucide-react';
import { SAR } from '@/types/sar';

interface SARAnalyticsProps {
  sars: SAR[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}

interface AnalyticsData {
  totalSARs: number;
  statusBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  averageProcessingTime: number;
  topUsers: Array<{ userName: string; count: number }>;
  riskDistribution: Record<string, number>;
}

const SARAnalytics: React.FC<SARAnalyticsProps> = ({
  sars,
  timeRange,
  onTimeRangeChange
}) => {
  const analyticsData = useMemo((): AnalyticsData => {
    const now = new Date();
    const filteredSARs = sars.filter(sar => {
      const sarDate = new Date(sar.dateSubmitted);
      switch (timeRange) {
        case '7d':
          return (now.getTime() - sarDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return (now.getTime() - sarDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        case '90d':
          return (now.getTime() - sarDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
        case '1y':
          return (now.getTime() - sarDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    // Status breakdown
    const statusBreakdown = filteredSARs.reduce((acc, sar) => {
      acc[sar.status] = (acc[sar.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (last 12 months)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const count = filteredSARs.filter(sar => 
        sar.dateSubmitted.startsWith(monthKey)
      ).length;
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      };
    }).reverse();

    // Average processing time (draft to filed)
    const completedSARs = filteredSARs.filter(sar => sar.status === 'filed');
    const processingTimes = completedSARs.map(sar => {
      const submitted = new Date(sar.dateSubmitted);
      const filed = new Date(sar.dateSubmitted); // In real app, this would be filed date
      return (filed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    // Top users
    const userCounts = filteredSARs.reduce((acc, sar) => {
      acc[sar.userName] = (acc[sar.userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topUsers = Object.entries(userCounts)
      .map(([userName, count]) => ({ userName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Risk distribution (mock data)
    const riskDistribution = {
      low: Math.floor(filteredSARs.length * 0.3),
      medium: Math.floor(filteredSARs.length * 0.5),
      high: Math.floor(filteredSARs.length * 0.2)
    };

    return {
      totalSARs: filteredSARs.length,
      statusBreakdown,
      monthlyTrend,
      averageProcessingTime,
      topUsers,
      riskDistribution
    };
  }, [sars, timeRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'filed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <BarChart3 className="h-4 w-4 text-gray-500" />;
  };

  const handleExportReport = () => {
    const reportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sar-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SAR Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of Suspicious Activity Reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SARs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSARs}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.averageProcessingTime.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground">
              Draft to filed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filed Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalSARs > 0 
                ? Math.round((analyticsData.statusBreakdown.filed || 0) / analyticsData.totalSARs * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully filed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalSARs > 0 
                ? Math.round((analyticsData.statusBreakdown.rejected || 0) / analyticsData.totalSARs * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Rejected SARs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="capitalize">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <Badge variant="outline">
                      {analyticsData.totalSARs > 0 
                        ? Math.round(count / analyticsData.totalSARs * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.monthlyTrend.slice(-6).map((item, index, array) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    {index > 0 && getTrendIcon(item.count, array[index - 1].count)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by SAR Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topUsers.map((user, index) => (
              <div key={user.userName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span>{user.userName}</span>
                </div>
                <span className="font-medium">{user.count} SARs</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SARAnalytics;
