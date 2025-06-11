
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Document } from '@/types/supabase';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';

interface DocumentAnalyticsProps {
  documents: Document[];
}

const DocumentAnalytics: React.FC<DocumentAnalyticsProps> = ({ documents }) => {
  // Calculate analytics
  const totalDocuments = documents.length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;
  
  const verificationRate = totalDocuments > 0 ? ((verifiedCount / totalDocuments) * 100).toFixed(1) : '0';
  const rejectionRate = totalDocuments > 0 ? ((rejectedCount / totalDocuments) * 100).toFixed(1) : '0';

  // Status distribution for pie chart
  const statusData = [
    { name: 'Verified', value: verifiedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Document types distribution
  const typeData = documents.reduce((acc, doc) => {
    const type = doc.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeData).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  // Upload trend (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const uploadTrendData = last30Days.map(date => {
    const count = documents.filter(doc => 
      doc.upload_date.split('T')[0] === date
    ).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uploads: count
    };
  });

  // Processing time analysis (mock data based on document status)
  const avgProcessingTime = documents
    .filter(d => d.verification_date)
    .reduce((acc, doc) => {
      const uploadTime = new Date(doc.upload_date).getTime();
      const verificationTime = new Date(doc.verification_date!).getTime();
      const processTime = (verificationTime - uploadTime) / (1000 * 60 * 60); // hours
      return acc + processTime;
    }, 0) / documents.filter(d => d.verification_date).length || 0;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricsCard
          title="Total Documents"
          value={totalDocuments}
          icon={FileText}
        />
        <DashboardMetricsCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          valueColor="text-yellow-600"
        />
        <DashboardMetricsCard
          title="Verification Rate"
          value={`${verificationRate}%`}
          icon={CheckCircle}
          valueColor="text-green-600"
        />
        <DashboardMetricsCard
          title="Avg Processing Time"
          value={`${Math.round(avgProcessingTime)}h`}
          icon={TrendingUp}
          valueColor="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upload Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Document Upload Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uploadTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Document Processing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{verificationRate}%</div>
              <div className="text-sm text-muted-foreground">Verification Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
              <div className="text-sm text-muted-foreground">Rejection Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(avgProcessingTime)}</div>
              <div className="text-sm text-muted-foreground">Avg Hours to Process</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {documents.filter(d => d.user_id).length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Customers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalytics;
